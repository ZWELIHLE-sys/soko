import { prisma } from './index'
import type { OrderStatus } from './generated/prisma/enums'

/**
 * Vuna commission ledger.
 *
 * Per Order: `commission` is captured at order creation (10% of totalAmount).
 * `commissionStatus` walks PENDING → INVOICED → PAID.
 *
 * Monthly flow:
 *  1. Admin generates a CommissionInvoice for a seller covering a period.
 *  2. All eligible orders in that period get `commissionInvoiceId` set + status INVOICED.
 *  3. Seller pays Vuna via EFT, uploads proof.
 *  4. Admin marks invoice PAID → linked orders flip to PAID.
 */

const PAYABLE_ORDER_STATUSES: OrderStatus[] = ['CONFIRMED', 'PACKED', 'IN_TRANSIT', 'DELIVERED']

export async function getSellerCommissionSummary(sellerId: string) {
  const [pendingAgg, invoiced, paid] = await Promise.all([
    prisma.order.aggregate({
      where: {
        sellerId,
        status:           { in: PAYABLE_ORDER_STATUSES },
        commissionStatus: 'PENDING',
        commission:       { not: null },
      },
      _sum:   { commission: true },
      _count: true,
    }),
    prisma.commissionInvoice.aggregate({
      where: { sellerId, status: 'OUTSTANDING' },
      _sum:  { amount: true },
      _count: true,
    }),
    prisma.commissionInvoice.aggregate({
      where: { sellerId, status: 'PAID' },
      _sum:  { amount: true },
      _count: true,
    }),
  ])

  return {
    pendingAmount:       pendingAgg._sum?.commission ?? 0,
    pendingOrders:       pendingAgg._count ?? 0,
    outstandingAmount:   invoiced._sum?.amount ?? 0,
    outstandingInvoices: invoiced._count ?? 0,
    paidAmount:          paid._sum?.amount ?? 0,
    paidInvoices:        paid._count ?? 0,
  }
}

export async function getSellerInvoices(sellerId: string) {
  return prisma.commissionInvoice.findMany({
    where:   { sellerId },
    orderBy: { generatedAt: 'desc' },
    include: {
      _count: { select: { orders: true } },
    },
  })
}

export async function listAllSellersWithCommission() {
  // Aggregate per seller — useful for admin overview
  const sellers = await prisma.seller.findMany({
    where: { status: { in: ['VERIFIED', 'SUSPENDED'] } },
    select: {
      id: true, brandName: true, email: true,
      bankName: true, accountNumber: true,
      location: { select: { name: true } },
    },
    orderBy: { brandName: 'asc' },
  })

  const ids = sellers.map(s => s.id)

  const [pendings, outstandings, paids] = await Promise.all([
    prisma.order.groupBy({
      by: ['sellerId'],
      where: {
        sellerId: { in: ids },
        status:           { in: PAYABLE_ORDER_STATUSES },
        commissionStatus: 'PENDING',
        commission:       { not: null },
      },
      _sum:   { commission: true },
      _count: true,
    }),
    prisma.commissionInvoice.groupBy({
      by: ['sellerId'],
      where: { sellerId: { in: ids }, status: 'OUTSTANDING' },
      _sum:  { amount: true },
    }),
    prisma.commissionInvoice.groupBy({
      by: ['sellerId'],
      where: { sellerId: { in: ids }, status: 'PAID' },
      _sum:  { amount: true },
    }),
  ])

  const pMap = new Map(pendings.map(p => [p.sellerId, p]))
  const oMap = new Map(outstandings.map(o => [o.sellerId, o]))
  const pdMap = new Map(paids.map(p => [p.sellerId, p]))

  return sellers.map(s => ({
    ...s,
    pendingAmount:     pMap.get(s.id)?._sum?.commission ?? 0,
    pendingOrders:     pMap.get(s.id)?._count          ?? 0,
    outstandingAmount: oMap.get(s.id)?._sum?.amount     ?? 0,
    paidAmount:        pdMap.get(s.id)?._sum?.amount    ?? 0,
  }))
}

export async function generateInvoice(
  sellerId: string,
  periodStart: Date,
  periodEnd: Date,
  adminNote?: string,
) {
  // Find all PENDING-commission orders for this seller delivered/in-flight within the period
  const eligible = await prisma.order.findMany({
    where: {
      sellerId,
      status:           { in: PAYABLE_ORDER_STATUSES },
      commissionStatus: 'PENDING',
      commission:       { not: null },
      createdAt:        { gte: periodStart, lt: periodEnd },
    },
    select: { id: true, commission: true },
  })

  if (eligible.length === 0) {
    return { error: 'No pending commission for this seller in the selected period.' }
  }

  const total = eligible.reduce((sum, o) => sum + (o.commission ?? 0), 0)

  const invoice = await prisma.$transaction(async (tx) => {
    const inv = await tx.commissionInvoice.create({
      data: {
        sellerId,
        periodStart,
        periodEnd,
        amount:    parseFloat(total.toFixed(2)),
        status:    'OUTSTANDING',
        adminNote: adminNote ?? null,
      },
    })
    await tx.order.updateMany({
      where: { id: { in: eligible.map(e => e.id) } },
      data:  { commissionStatus: 'INVOICED', commissionInvoiceId: inv.id },
    })
    return inv
  })

  return { invoice }
}

export async function markInvoicePaid(invoiceId: string, proofUrl?: string) {
  const inv = await prisma.commissionInvoice.findUnique({ where: { id: invoiceId } })
  if (!inv) return { error: 'Invoice not found.' }
  if (inv.status !== 'OUTSTANDING') return { error: 'Only outstanding invoices can be marked paid.' }

  const updated = await prisma.$transaction(async (tx) => {
    const paid = await tx.commissionInvoice.update({
      where: { id: invoiceId },
      data:  { status: 'PAID', paidAt: new Date(), paidProofUrl: proofUrl ?? inv.paidProofUrl },
    })
    await tx.order.updateMany({
      where: { commissionInvoiceId: invoiceId },
      data:  { commissionStatus: 'PAID' },
    })
    return paid
  })

  return { invoice: updated }
}

export async function getInvoiceDetail(invoiceId: string) {
  return prisma.commissionInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      seller: {
        select: {
          id: true, brandName: true, email: true,
          bankName: true, accountHolder: true, accountNumber: true, branchCode: true,
        },
      },
      orders: {
        select: {
          id: true, orderNumber: true, totalAmount: true, commission: true, createdAt: true,
          buyer: { select: { name: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}
