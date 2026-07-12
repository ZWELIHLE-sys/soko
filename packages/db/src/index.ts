import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

type PrismaClientType = InstanceType<typeof PrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined
}

function createPrismaClient(): PrismaClientType {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

function getPrisma(): PrismaClientType {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

export const prisma: PrismaClientType = new Proxy({} as PrismaClientType, {
  get(_target, prop) {
    return (getPrisma() as unknown as Record<string, unknown>)[prop as string]
  },
})

export { tickEventLifecycle } from './lifecycle'
export {
  LivestockSpecies,
  LivestockPurpose,
  LivestockSex,
  HarvestStatus,
  ProductStatus,
} from './generated/prisma/enums'
export {
  assignPieceToMarket,
  movePieceToAuction,
  movePieceToFeatured,
  movePieceToShop,
  markPieceSold,
  retirePiece,
} from './pieces'
export {
  getSellerCommissionSummary,
  getSellerInvoices,
  listAllSellersWithCommission,
  generateInvoice,
  markInvoicePaid,
  getInvoiceDetail,
} from './commissions'
