import { prisma, LivestockSpecies, LivestockPurpose, LivestockSex } from '@vuna/db'
import type { ProductStatus } from '@vuna/db'

export interface LivestockInput {
  species: LivestockSpecies
  breed: string
  purpose: LivestockPurpose
  sex?: LivestockSex | null
  approxAgeMonths?: number | null
  weightKg?: number | null
  colour?: string | null
  brandMark?: string | null
  vaccinations?: string | null
  dipRecords?: string | null
  breedingHistory?: string | null
}

export interface HarvestInput {
  isHarvestPreOrder: boolean
  plantedAt?: Date | null
  expectedHarvestDate?: Date | null
  estimatedYield?: number | null
  yieldUnit?: string | null
}

/**
 * Reads the agri fields out of a listing form submission and validates them
 * against the category: livestock listings must carry species/breed/purpose;
 * produce pre-orders must carry a harvest date, yield and unit.
 * Non-agri categories return empty — the rest of the platform is untouched.
 */
export async function parseAgriInput(
  categoryId: string,
  body: Record<string, unknown>,
): Promise<{ error?: string; harvest?: HarvestInput; livestock?: LivestockInput }> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { slug: true },
  })
  if (!category) return { error: 'Category not found.' }

  if (category.slug === 'livestock') {
    const species = String(body.lsSpecies ?? '')
    const breed   = String(body.lsBreed ?? '').trim()
    const purpose = String(body.lsPurpose ?? '')
    const sex     = String(body.lsSex ?? '')

    if (!Object.keys(LivestockSpecies).includes(species)) return { error: 'Please select the animal species.' }
    if (!breed) return { error: 'Please enter the breed — buyers ask for it first.' }
    if (!Object.keys(LivestockPurpose).includes(purpose)) return { error: 'Please select what the animal is for (meat, milk, wool, breeding...).' }
    if (sex && !Object.keys(LivestockSex).includes(sex)) return { error: 'Invalid sex value.' }

    return {
      livestock: {
        species: species as LivestockSpecies,
        breed,
        purpose: purpose as LivestockPurpose,
        sex: sex ? (sex as LivestockSex) : null,
        approxAgeMonths: body.lsAgeMonths ? parseInt(String(body.lsAgeMonths)) : null,
        weightKg:        body.lsWeightKg  ? parseFloat(String(body.lsWeightKg)) : null,
        colour:          String(body.lsColour ?? '').trim() || null,
        brandMark:       String(body.lsBrandMark ?? '').trim() || null,
        vaccinations:    String(body.lsVaccinations ?? '').trim() || null,
        dipRecords:      String(body.lsDipRecords ?? '').trim() || null,
        breedingHistory: String(body.lsBreedingHistory ?? '').trim() || null,
      },
    }
  }

  if (category.slug === 'produce') {
    if (!body.isHarvestPreOrder) return { harvest: { isHarvestPreOrder: false } }

    const expected = body.expectedHarvestDate ? new Date(String(body.expectedHarvestDate)) : null
    const yieldQty = body.estimatedYield ? parseInt(String(body.estimatedYield)) : null
    const unit     = String(body.yieldUnit ?? '').trim()

    if (!expected || isNaN(expected.getTime())) return { error: 'Please set the expected harvest date.' }
    if (expected.getTime() < Date.now() - 24 * 60 * 60 * 1000) return { error: 'The expected harvest date must be in the future.' }
    if (!yieldQty || yieldQty < 1) return { error: 'Please estimate the yield you are offering for pre-order.' }
    if (!unit) return { error: 'Please choose a unit for the yield (bunches, kg, crates...).' }

    return {
      harvest: {
        isHarvestPreOrder: true,
        plantedAt: body.plantedAt ? new Date(String(body.plantedAt)) : null,
        expectedHarvestDate: expected,
        estimatedYield: yieldQty,
        yieldUnit: unit,
      },
    }
  }

  return {}
}

export async function getSellerProducts(sellerId: string) {
  return prisma.product.findMany({
    where: { sellerId, status: { not: 'SUSPENDED' } },
    include: {
      category: { select: { name: true, slug: true } },
      livestockDetail: true,
      // Open reservations against this harvest — the card shows the tally
      orderItems: {
        where:  { order: { status: 'RESERVED' } },
        select: { quantity: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSellerProductForOwner(sellerId: string, productId: string) {
  return prisma.product.findFirst({ where: { id: productId, sellerId } })
}

export async function createProduct(
  sellerId: string,
  locationId: string,
  data: {
    name: string
    description: string
    price: number
    stock: number
    categoryId: string
    images: string[]
    bulkMinQty?: number | null
    bulkPrice?: number | null
  },
  agri?: {
    harvest?: HarvestInput
    livestock?: LivestockInput
  },
) {
  return prisma.product.create({
    data: {
      ...data,
      sellerId,
      locationId,
      status: 'ACTIVE',
      ...(agri?.harvest?.isHarvestPreOrder && {
        isHarvestPreOrder:   true,
        plantedAt:           agri.harvest.plantedAt ?? null,
        expectedHarvestDate: agri.harvest.expectedHarvestDate ?? null,
        estimatedYield:      agri.harvest.estimatedYield ?? null,
        yieldUnit:           agri.harvest.yieldUnit ?? null,
        harvestStatus:       'GROWING' as const,
      }),
      ...(agri?.livestock && {
        livestockDetail: { create: agri.livestock },
      }),
    },
  })
}

export async function updateProduct(
  productId: string,
  data: Partial<{
    name: string
    description: string
    price: number
    stock: number
    images: string[]
    status: ProductStatus
    bulkMinQty: number | null
    bulkPrice: number | null
  }>,
  agri?: {
    harvest?: HarvestInput
    livestock?: LivestockInput | null
  },
) {
  return prisma.product.update({
    where: { id: productId },
    data: {
      ...data,
      ...(agri?.harvest && (
        agri.harvest.isHarvestPreOrder
          ? {
              isHarvestPreOrder:   true,
              plantedAt:           agri.harvest.plantedAt ?? null,
              expectedHarvestDate: agri.harvest.expectedHarvestDate ?? null,
              estimatedYield:      agri.harvest.estimatedYield ?? null,
              yieldUnit:           agri.harvest.yieldUnit ?? null,
            }
          : {
              // Toggled off — clear the pre-order plan entirely
              isHarvestPreOrder: false,
              plantedAt: null, expectedHarvestDate: null,
              estimatedYield: null, yieldUnit: null, harvestStatus: null,
            }
      )),
      ...(agri?.livestock && {
        livestockDetail: {
          upsert: { create: agri.livestock, update: agri.livestock },
        },
      }),
    },
  })
}

/**
 * Harvest day. READY: the product opens for normal buying and every RESERVED
 * order flips to PENDING — payment is now due, buyers get emailed the pay link.
 * FAILED: reservations cancel cleanly and buyers are told they owe nothing.
 * Returns the affected orders (with buyer contact) so the route can send mail.
 */
export async function resolveHarvest(
  sellerId: string,
  productId: string,
  outcome: 'READY' | 'FAILED',
) {
  const product = await prisma.product.findFirst({
    where: { id: productId, sellerId },
    select: { id: true, name: true, isHarvestPreOrder: true, harvestStatus: true },
  })
  if (!product) return { error: 'Product not found.' }
  if (!product.isHarvestPreOrder) return { error: 'This is not a harvest pre-order listing.' }
  if (product.harvestStatus !== 'GROWING') return { error: 'This harvest has already been resolved.' }

  const reservations = await prisma.order.findMany({
    where: {
      status: 'RESERVED',
      items: { some: { productId } },
    },
    select: {
      id: true,
      orderNumber: true,
      buyer: { select: { name: true, email: true } },
    },
  })

  const orderIds = reservations.map(r => r.id)

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data:  { harvestStatus: outcome === 'READY' ? 'HARVEST_READY' : 'FAILED' },
    }),
    prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data:  { status: outcome === 'READY' ? 'PENDING' : 'CANCELLED' },
    }),
  ])

  return { product, reservations }
}

export async function softDeleteProduct(productId: string) {
  return prisma.product.update({
    where: { id: productId },
    data: { status: 'SUSPENDED' },
  })
}

export async function getSellerProductStats(sellerId: string) {
  const items = await prisma.orderItem.findMany({
    where: { product: { sellerId } },
    select: {
      productId: true,
      quantity: true,
      price: true,
      order: { select: { status: true } },
    },
  })

  const statsMap: Record<string, { orderCount: number; revenue: number }> = {}
  for (const item of items) {
    if (!statsMap[item.productId]) statsMap[item.productId] = { orderCount: 0, revenue: 0 }
    statsMap[item.productId].orderCount += 1
    if (item.order.status === 'DELIVERED') {
      statsMap[item.productId].revenue += item.price * item.quantity
    }
  }
  return statsMap
}
