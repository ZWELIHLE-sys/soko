import { prisma, tickEventLifecycle } from '@vuna/db'

export async function listMarkets() {
  await tickEventLifecycle()
  return prisma.market.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      makerInResident: { select: { id: true, brandName: true } },
      _count: { select: { listings: true } },
      listings: { where: { status: 'PENDING' }, select: { id: true } },
    },
  })
}

export async function createMarket(data: {
  marketType?: string
  title: string
  description?: string
  theme?: string
  startDate: string
  endDate: string
  applicationDeadline: string
  maxListings?: number | null
  welcomeVideoUrl?: string | null
}) {
  return prisma.market.create({
    data: {
      marketType:          (data.marketType || 'SUNDAY_MARKET') as never,
      title:               data.title,
      description:         data.description || null,
      theme:               data.theme || null,
      startDate:           new Date(data.startDate),
      endDate:             new Date(data.endDate),
      applicationDeadline: new Date(data.applicationDeadline),
      maxListings:         data.maxListings ?? null,
      welcomeVideoUrl:     data.welcomeVideoUrl || null,
    },
  })
}

export async function getMarket(marketId: string) {
  await tickEventLifecycle()
  return prisma.market.findUnique({
    where: { id: marketId },
    include: {
      makerInResident: { select: { id: true, brandName: true } },
      listings: {
        include: {
          seller: {
            select: {
              brandName: true, email: true,
              locationId: true,
              location: { select: { name: true } },
              _count: { select: { products: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export async function updateMarket(
  marketId: string,
  data: Partial<{ makerInResidenceId: string | null; isActive: boolean }>,
) {
  return prisma.market.update({
    where: { id: marketId },
    data,
    include: { makerInResident: { select: { id: true, brandName: true } } },
  })
}

export async function updateMarketListing(
  listingId: string,
  data: { status: string; adminNote?: string; stallNumber?: number | null },
) {
  return prisma.marketListing.update({
    where: { id: listingId },
    data: {
      status:      data.status as never,
      adminNote:   data.adminNote ?? null,
      stallNumber: data.stallNumber ?? null,
      approvedAt:  data.status === 'APPROVED' ? new Date() : null,
    },
  })
}
