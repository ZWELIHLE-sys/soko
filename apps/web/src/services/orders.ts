import { prisma } from '@vuna/db'

const COMMISSION_RATE = 0.05

interface CartItem {
  productId: string
  sellerId: string
  price: number
  quantity: number
}

export async function createOrders(
  buyerId: string,
  items: CartItem[],
  opts: {
    deliveryAddress: string
    deliveryCityId: string
    deliveryTier: string
    deliveryFee: number
    paymentRef?: string
  },
) {
  // Trust ONLY productId + quantity from the client. Price, seller and stock
  // are authoritative from the database — never the cart. This is what stops a
  // crafted cart from dictating its own prices or totals.
  const wanted = new Map<string, number>()
  for (const item of items) {
    const qty = Math.floor(Number(item?.quantity))
    if (typeof item?.productId !== 'string' || !Number.isFinite(qty) || qty < 1) {
      return { error: 'Your cart contains an invalid item.' }
    }
    wanted.set(item.productId, (wanted.get(item.productId) ?? 0) + qty)
  }
  if (wanted.size === 0) return { error: 'No items in cart.' }

  const products = await prisma.product.findMany({
    where:  { id: { in: [...wanted.keys()] }, status: 'ACTIVE' },
    select: { id: true, name: true, price: true, stock: true, sellerId: true, bulkMinQty: true, bulkPrice: true },
  })
  if (products.length !== wanted.size) {
    return { error: 'One or more products are no longer available.' }
  }

  // Group by seller using DB values only; apply bulk pricing server-side
  const bySeller = new Map<string, Array<{ productId: string; quantity: number; unitPrice: number }>>()
  for (const p of products) {
    const qty = wanted.get(p.id)!
    if (qty > p.stock) return { error: `Not enough stock for ${p.name}.` }
    const unitPrice = p.bulkMinQty && p.bulkPrice && qty >= p.bulkMinQty ? p.bulkPrice : p.price
    const arr = bySeller.get(p.sellerId) ?? []
    arr.push({ productId: p.id, quantity: qty, unitPrice })
    bySeller.set(p.sellerId, arr)
  }

  const deliveryFee = Math.max(0, Number(opts.deliveryFee) || 0)

  // Live energy — if a market is live right now, the first 3 orders of the day
  // get flagged (admin contacts them to arrange the welcome piece).
  const now = new Date()
  const liveMarket = await prisma.market.findFirst({
    where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    select: { id: true },
  })
  let firstThreeMarketId: string | null = null
  if (liveMarket) {
    const flagged = await prisma.order.count({
      where: { firstThreeMarketId: liveMarket.id },
    })
    if (flagged < 3) firstThreeMarketId = liveMarket.id
  }

  const orders = []

  for (const [sellerId, sellerItems] of bySeller) {
    const itemsTotal = sellerItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const orderTotal = parseFloat((itemsTotal + deliveryFee).toFixed(2))
    const commission = parseFloat((orderTotal * COMMISSION_RATE).toFixed(2))

    const order = await prisma.order.create({
      data: {
        buyerId,
        sellerId,
        totalAmount:    orderTotal,
        deliveryFee,
        deliveryTier:   opts.deliveryTier as never,
        deliveryAddress: opts.deliveryAddress,
        deliveryCityId:  opts.deliveryCityId,
        status:         'PENDING',
        paymentRef:     opts.paymentRef ?? null,
        commission,
        firstThreeMarketId,
        items: {
          create: sellerItems.map(i => ({
            productId: i.productId,
            quantity:  i.quantity,
            price:     i.unitPrice,
          })),
        },
      },
      include: { items: true },
    })

    // Guarded decrement — only succeeds if stock is still sufficient, so two
    // simultaneous checkouts can't push stock negative
    for (const i of sellerItems) {
      await prisma.product.updateMany({
        where: { id: i.productId, stock: { gte: i.quantity } },
        data:  { stock: { decrement: i.quantity } },
      })
    }

    orders.push(order)
  }

  return { orders }
}

/**
 * Harvest pre-order reservation — the heart of "money moves on a harvest,
 * never on a promise". Creates a RESERVED order with NO payment due.
 * When the farmer marks the crop HARVEST_READY, reservations flip to
 * PENDING and the normal EFT + proof flow takes over.
 */
export async function reserveHarvest(
  buyerId: string,
  productId: string,
  quantity: number,
  deliveryAddress: string,
) {
  if (!Number.isFinite(quantity) || quantity < 1) return { error: 'Quantity must be at least 1.' }
  if (!deliveryAddress?.trim()) return { error: 'Please give a delivery address so the farmer knows where your share goes.' }

  const [product, buyer] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true, name: true, price: true, status: true, sellerId: true, locationId: true,
        bulkMinQty: true, bulkPrice: true,
        isHarvestPreOrder: true, harvestStatus: true, estimatedYield: true, yieldUnit: true,
      },
    }),
    prisma.user.findUnique({ where: { id: buyerId }, select: { locationId: true } }),
  ])

  if (!product || product.status !== 'ACTIVE') return { error: 'This listing is not available.' }
  if (!product.isHarvestPreOrder || product.harvestStatus !== 'GROWING') {
    return { error: 'This harvest is no longer open for reservations.' }
  }

  // Yield accounting: everything reserved or carried through to sale counts
  // against the estimated yield. Cancelled orders release their share.
  const reserved = await prisma.orderItem.aggregate({
    where: { productId, order: { status: { not: 'CANCELLED' } } },
    _sum: { quantity: true },
  })
  const taken = reserved._sum?.quantity ?? 0
  const available = (product.estimatedYield ?? 0) - taken
  if (quantity > available) {
    return {
      error: available > 0
        ? `Only ${available} ${product.yieldUnit ?? 'units'} of this harvest are still open for reservation.`
        : 'This harvest is fully reserved.',
    }
  }

  // Bulk pricing honours the same rule as normal orders
  const unitPrice = product.bulkMinQty && product.bulkPrice && quantity >= product.bulkMinQty
    ? product.bulkPrice
    : product.price
  const totalAmount = parseFloat((unitPrice * quantity).toFixed(2))
  const commission  = parseFloat((totalAmount * COMMISSION_RATE).toFixed(2))

  const order = await prisma.order.create({
    data: {
      buyerId,
      sellerId:        product.sellerId,
      totalAmount,
      deliveryFee:     0,
      deliveryTier:    'SELLER_ARRANGED',
      deliveryAddress: deliveryAddress.trim(),
      deliveryCityId:  buyer?.locationId ?? product.locationId,
      status:          'RESERVED',
      commission,
      items: {
        create: [{ productId, quantity, price: unitPrice }],
      },
    },
    include: { items: true },
  })

  return { order }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  RESERVED:   ['CANCELLED'],   // buyers/sellers can release a reservation; payment flow starts only via harvest-ready
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PACKED', 'CANCELLED'],
  PACKED:     ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED'],
}

export async function updateOrderStatus(
  orderId: string,
  sellerId: string,
  newStatus: string,
) {
  const order = await prisma.order.findFirst({ where: { id: orderId, sellerId } })
  if (!order) return { error: 'Order not found' }

  const allowed = VALID_TRANSITIONS[order.status] ?? []
  if (!allowed.includes(newStatus)) {
    return { error: `Cannot move order from ${order.status} to ${newStatus}` }
  }

  // Gate: moving PENDING → CONFIRMED requires the buyer to have submitted proof of payment
  // and the seller to have verified it. Cancelling is always allowed.
  if (order.status === 'PENDING' && newStatus === 'CONFIRMED') {
    if (!order.paymentVerifiedAt) {
      return { error: 'You must verify the buyer’s proof of payment before confirming this order.' }
    }
  }

  const updated = await prisma.order.update({ where: { id: orderId }, data: { status: newStatus as never } })
  return { order: updated }
}

export async function submitPaymentProof(
  orderId: string,
  buyerId: string,
  proofUrl: string,
  paymentRef?: string,
) {
  const order = await prisma.order.findFirst({ where: { id: orderId, buyerId } })
  if (!order) return { error: 'Order not found.' }
  if (order.status !== 'PENDING') return { error: 'Proof of payment can only be added to a pending order.' }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentProofUrl:    proofUrl,
      paymentSubmittedAt: new Date(),
      paymentRef:         paymentRef?.trim() || order.paymentRef,
    },
  })
  return { order: updated }
}

export async function verifyPaymentReceived(
  orderId: string,
  sellerId: string,
) {
  const order = await prisma.order.findFirst({ where: { id: orderId, sellerId } })
  if (!order) return { error: 'Order not found.' }
  if (order.status !== 'PENDING') return { error: 'Only pending orders can be verified.' }
  if (!order.paymentProofUrl) return { error: 'Buyer has not submitted proof of payment yet.' }
  if (order.paymentVerifiedAt) return { error: 'Payment is already verified.' }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data:  { paymentVerifiedAt: new Date() },
  })
  return { order: updated }
}

export async function getBuyerOrderForPayment(orderId: string, buyerId: string) {
  return prisma.order.findFirst({
    where:   { id: orderId, buyerId },
    include: {
      items: {
        include: {
          product: { select: { name: true, images: true, category: { select: { icon: true } } } },
        },
      },
      seller: {
        select: {
          id:            true,
          brandName:     true,
          email:         true,
          phone:         true,
          bankName:      true,
          accountHolder: true,
          accountNumber: true,
          accountType:   true,
          branchCode:    true,
        },
      },
    },
  })
}

export async function getSellerOrders(sellerId: string) {
  return prisma.order.findMany({
    where: { sellerId },
    orderBy: { createdAt: 'desc' },
    include: {
      buyer: { select: { name: true, email: true, phone: true } },
      items: { include: { product: { select: { name: true, images: true } } } },
    },
  })
}

export async function getBuyerOrders(buyerId: string) {
  return prisma.order.findMany({
    where: { buyerId },
    orderBy: { createdAt: 'desc' },
    include: {
      seller: { select: { brandName: true } },
      items: {
        include: {
          product: {
            select: { name: true, images: true, category: { select: { icon: true } } },
          },
        },
      },
    },
  })
}

export async function getBuyerStats(buyerId: string) {
  const [totalOrders, delivered, pending, totalSpent] = await Promise.all([
    prisma.order.count({ where: { buyerId } }),
    prisma.order.count({ where: { buyerId, status: 'DELIVERED' } }),
    prisma.order.count({
      where: { buyerId, status: { in: ['PENDING', 'CONFIRMED', 'PACKED', 'IN_TRANSIT'] } },
    }),
    prisma.order.aggregate({
      where: { buyerId, status: 'DELIVERED' },
      _sum: { totalAmount: true },
    }),
  ])

  return {
    totalOrders,
    delivered,
    pending,
    totalSpent: totalSpent._sum.totalAmount ?? 0,
  }
}
