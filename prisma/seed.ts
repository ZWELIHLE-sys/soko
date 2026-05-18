import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { LocationType } from '../src/generated/prisma/enums'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {

  console.log('🌍 Seeding Soko database...')

  // ================================
  // CONTINENT
  // ================================
  const africa = await prisma.location.upsert({
    where: { id: 'continent-africa' },
    update: {},
    create: {
      id: 'continent-africa',
      name: 'Africa',
      type: LocationType.CONTINENT,
      code: 'AF',
    }
  })

  // ================================
  // COUNTRY
  // ================================
  const southAfrica = await prisma.location.upsert({
    where: { id: 'country-za' },
    update: {},
    create: {
      id: 'country-za',
      name: 'South Africa',
      type: LocationType.COUNTRY,
      code: 'ZA',
      parentId: africa.id,
    }
  })

  // ================================
  // PROVINCES (9 SA Provinces)
  // ================================
  const provinces = [
    { id: 'prov-kzn', name: 'KwaZulu-Natal',   code: 'KZN' },
    { id: 'prov-gp',  name: 'Gauteng',           code: 'GP'  },
    { id: 'prov-wc',  name: 'Western Cape',      code: 'WC'  },
    { id: 'prov-ec',  name: 'Eastern Cape',      code: 'EC'  },
    { id: 'prov-fs',  name: 'Free State',        code: 'FS'  },
    { id: 'prov-lp',  name: 'Limpopo',           code: 'LP'  },
    { id: 'prov-mp',  name: 'Mpumalanga',        code: 'MP'  },
    { id: 'prov-nw',  name: 'North West',        code: 'NW'  },
    { id: 'prov-nc',  name: 'Northern Cape',     code: 'NC'  },
  ]

  for (const p of provinces) {
    await prisma.location.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        type: LocationType.PROVINCE,
        code: p.code,
        parentId: southAfrica.id,
      }
    })
  }

  // ================================
  // DISTRICTS — KZN (Your Home!)
  // ================================
  const kznDistricts = [
    { id: 'dist-ethekwini',     name: 'eThekwini',              code: 'ETH' },
    { id: 'dist-umgungundlovu', name: 'uMgungundlovu',          code: 'UMG' },
    { id: 'dist-uthukela',      name: 'uThukela',               code: 'UTH' },
    { id: 'dist-ilembe',        name: 'iLembe',                 code: 'ILM' },
    { id: 'dist-zululand',      name: 'Zululand',               code: 'ZUL' },
    { id: 'dist-umkhanyakude',  name: 'uMkhanyakude',           code: 'UMK' },
    { id: 'dist-harry-gwala',   name: 'Harry Gwala',            code: 'HGW' },
    { id: 'dist-king-cetshwayo',name: 'King Cetshwayo',         code: 'KCT' },
    { id: 'dist-amajuba',       name: 'Amajuba',                code: 'AMJ' },
    { id: 'dist-ugu',           name: 'uGu',                    code: 'UGU' },
    { id: 'dist-umzinyathi',    name: 'uMzinyathi',             code: 'UMZ' },
  ]

  for (const d of kznDistricts) {
    await prisma.location.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id,
        name: d.name,
        type: LocationType.DISTRICT,
        code: d.code,
        parentId: 'prov-kzn',
      }
    })
  }

  // ================================
  // DISTRICTS — Gauteng
  // ================================
  const gpDistricts = [
    { id: 'dist-city-tshwane',  name: 'City of Tshwane',        code: 'TSH' },
    { id: 'dist-city-joburg',   name: 'City of Johannesburg',   code: 'JHB' },
    { id: 'dist-ekurhuleni',    name: 'Ekurhuleni',             code: 'EKU' },
    { id: 'dist-sedibeng',      name: 'Sedibeng',               code: 'SED' },
    { id: 'dist-westrand',      name: 'West Rand',              code: 'WRD' },
  ]

  for (const d of gpDistricts) {
    await prisma.location.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id,
        name: d.name,
        type: LocationType.DISTRICT,
        code: d.code,
        parentId: 'prov-gp',
      }
    })
  }

  // ================================
  // CITIES — KZN eThekwini
  // ================================
  const ethekwiniCities = [
    { id: 'city-durban',        name: 'Durban'          },
    { id: 'city-umlazi',        name: 'Umlazi'          },
    { id: 'city-pinetown',      name: 'Pinetown'        },
    { id: 'city-chatsworth',    name: 'Chatsworth'      },
    { id: 'city-phoenix',       name: 'Phoenix'         },
    { id: 'city-inanda',        name: 'Inanda'          },
    { id: 'city-kwamashu',      name: 'KwaMashu'        },
    { id: 'city-umbilo',        name: 'Umbilo'          },
  ]

  for (const c of ethekwiniCities) {
    await prisma.location.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        type: LocationType.CITY,
        parentId: 'dist-ethekwini',
      }
    })
  }

  // ================================
  // CITIES — KZN uMgungundlovu
  // ================================
  const umgungundlovuCities = [
    { id: 'city-pmb',           name: 'Pietermaritzburg' },
    { id: 'city-howick',        name: 'Howick'           },
    { id: 'city-richmond',      name: 'Richmond'         },
  ]

  for (const c of umgungundlovuCities) {
    await prisma.location.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        type: LocationType.CITY,
        parentId: 'dist-umgungundlovu',
      }
    })
  }

  // ================================
  // CITIES — Gauteng Johannesburg
  // ================================
  const joburgCities = [
    { id: 'city-soweto',        name: 'Soweto'           },
    { id: 'city-sandton',       name: 'Sandton'          },
    { id: 'city-alexandra',     name: 'Alexandra'        },
    { id: 'city-johannesburg',  name: 'Johannesburg CBD' },
    { id: 'city-roodepoort',    name: 'Roodepoort'       },
  ]

  for (const c of joburgCities) {
    await prisma.location.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        type: LocationType.CITY,
        parentId: 'dist-city-joburg',
      }
    })
  }

  // ================================
  // CITIES — Gauteng Tshwane
  // ================================
  const tshwaneCities = [
    { id: 'city-pretoria',      name: 'Pretoria'         },
    { id: 'city-mamelodi',      name: 'Mamelodi'         },
    { id: 'city-atteridgeville',name: 'Atteridgeville'   },
    { id: 'city-centurion',     name: 'Centurion'        },
  ]

  for (const c of tshwaneCities) {
    await prisma.location.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        type: LocationType.CITY,
        parentId: 'dist-city-tshwane',
      }
    })
  }

  // ================================
  // CATEGORIES
  // ================================
  const categories = [
    { id: 'cat-fashion',    name: 'Fashion & Clothing', slug: 'fashion',    icon: '👗' },
    { id: 'cat-art',        name: 'Art & Paintings',    slug: 'art',        icon: '🎨' },
    { id: 'cat-furniture',  name: 'Furniture',          slug: 'furniture',  icon: '🪑' },
    { id: 'cat-food',       name: 'Food & Agriculture', slug: 'food',       icon: '🌽' },
    { id: 'cat-beauty',     name: 'Beauty & Skincare',  slug: 'beauty',     icon: '💄' },
    { id: 'cat-sculpture',  name: 'Sculpture & Crafts', slug: 'sculpture',  icon: '🗿' },
    { id: 'cat-electronics',name: 'Electronics',        slug: 'electronics',icon: '🔌' },
    { id: 'cat-books',      name: 'Books & Literature', slug: 'books',      icon: '📚' },
    { id: 'cat-homeware',   name: 'Homeware & Decor',   slug: 'homeware',   icon: '🏺' },
    { id: 'cat-textiles',   name: 'Textiles & Fabric',  slug: 'textiles',   icon: '🧵' },
    { id: 'cat-music',      name: 'Music & Audio',      slug: 'music',      icon: '🎵' },
    { id: 'cat-wellness',   name: 'Wellness & Herbal',  slug: 'wellness',   icon: '🌿' },
    { id: 'cat-drawings',   name: 'Drawings & Prints',  slug: 'drawings',   icon: '✏️' },
    { id: 'cat-photography',name: 'Photography',        slug: 'photography',icon: '📸' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
      }
    })
  }

  console.log('✅ Soko database seeded successfully!')
  console.log('📍 Locations: Africa → SA → 9 Provinces → Districts → Cities')
  console.log('🛍️  Categories: 14 African product categories ready')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })