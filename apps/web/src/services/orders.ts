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
  const sellerGroups: Record<string, CartItem[]> = {}
  for (const item of items) {
    if (!sellerGroups[item.sellerId]) sellerGroups[item.sellerId] = []
    sellerGroups[item.sellerId].push(item)
  }

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

  for (const [sellerId, sellerItems] of Object.entries(sellerGroups)) {
    const itemsTotal = sellerItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const orderTotal = itemsTotal + opts.deliveryFee
    const commission = parseFloat((orderTotal * COMMISSION_RATE).toFixed(2))

    const order = await prisma.order.create({
      data: {
        buyerId,
        sellerId,
        totalAmount:    orderTotal,
        deliveryFee:    opts.deliveryFee,
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
            price:     i.price,
          })),
        },
      },
      include: { items: true },
    })

    for (const item of sellerItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    orders.push(order)
  }

  return orders
}

const VALID_TRANSITIONS: Record<string, string[]> = {
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
