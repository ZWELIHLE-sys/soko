import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { LocationType } from '../src/generated/prisma/enums'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding Vuna database...')

  // CONTINENT
  const africa = await prisma.location.upsert({
    where: { id: 'continent-africa' },
    update: {},
    create: { id: 'continent-africa', name: 'Africa', type: LocationType.CONTINENT, code: 'AF' }
  })

  // COUNTRY — South Africa (unlocked — primary market)
  const southAfrica = await prisma.location.upsert({
    where: { id: 'country-za' },
    update: {},
    create: { id: 'country-za', name: 'South Africa', type: LocationType.COUNTRY, code: 'ZA', parent: { connect: { id: africa.id } } }
  })

  // ALL OTHER AFRICAN COUNTRIES — seeded but locked until admin unlocks
  const africanCountries = [
    { id: 'country-dz', name: 'Algeria',                        code: 'DZ' },
    { id: 'country-ao', name: 'Angola',                         code: 'AO' },
    { id: 'country-bj', name: 'Benin',                          code: 'BJ' },
    { id: 'country-bw', name: 'Botswana',                       code: 'BW' },
    { id: 'country-bf', name: 'Burkina Faso',                   code: 'BF' },
    { id: 'country-bi', name: 'Burundi',                        code: 'BI' },
    { id: 'country-cv', name: 'Cabo Verde',                     code: 'CV' },
    { id: 'country-cm', name: 'Cameroon',                       code: 'CM' },
    { id: 'country-cf', name: 'Central African Republic',       code: 'CF' },
    { id: 'country-td', name: 'Chad',                           code: 'TD' },
    { id: 'country-km', name: 'Comoros',                        code: 'KM' },
    { id: 'country-cd', name: 'DR Congo',                       code: 'CD' },
    { id: 'country-cg', name: 'Republic of Congo',              code: 'CG' },
    { id: 'country-dj', name: 'Djibouti',                       code: 'DJ' },
    { id: 'country-eg', name: 'Egypt',                          code: 'EG' },
    { id: 'country-gq', name: 'Equatorial Guinea',              code: 'GQ' },
    { id: 'country-er', name: 'Eritrea',                        code: 'ER' },
    { id: 'country-sz', name: 'Eswatini',                       code: 'SZ' },
    { id: 'country-et', name: 'Ethiopia',                       code: 'ET' },
    { id: 'country-ga', name: 'Gabon',                          code: 'GA' },
    { id: 'country-gm', name: 'Gambia',                         code: 'GM' },
    { id: 'country-gh', name: 'Ghana',                          code: 'GH' },
    { id: 'country-gn', name: 'Guinea',                         code: 'GN' },
    { id: 'country-gw', name: 'Guinea-Bissau',                  code: 'GW' },
    { id: 'country-ci', name: "Côte d'Ivoire",                  code: 'CI' },
    { id: 'country-ke', name: 'Kenya',                          code: 'KE' },
    { id: 'country-ls', name: 'Lesotho',                        code: 'LS' },
    { id: 'country-lr', name: 'Liberia',                        code: 'LR' },
    { id: 'country-ly', name: 'Libya',                          code: 'LY' },
    { id: 'country-mg', name: 'Madagascar',                     code: 'MG' },
    { id: 'country-mw', name: 'Malawi',                         code: 'MW' },
    { id: 'country-ml', name: 'Mali',                           code: 'ML' },
    { id: 'country-mr', name: 'Mauritania',                     code: 'MR' },
    { id: 'country-mu', name: 'Mauritius',                      code: 'MU' },
    { id: 'country-ma', name: 'Morocco',                        code: 'MA' },
    { id: 'country-mz', name: 'Mozambique',                     code: 'MZ' },
    { id: 'country-na', name: 'Namibia',                        code: 'NA' },
    { id: 'country-ne', name: 'Niger',                          code: 'NE' },
    { id: 'country-ng', name: 'Nigeria',                        code: 'NG' },
    { id: 'country-rw', name: 'Rwanda',                         code: 'RW' },
    { id: 'country-st', name: 'São Tomé and Príncipe',          code: 'ST' },
    { id: 'country-sn', name: 'Senegal',                        code: 'SN' },
    { id: 'country-sl', name: 'Sierra Leone',                   code: 'SL' },
    { id: 'country-so', name: 'Somalia',                        code: 'SO' },
    { id: 'country-sd', name: 'Sudan',                          code: 'SD' },
    { id: 'country-ss', name: 'South Sudan',                    code: 'SS' },
    { id: 'country-tz', name: 'Tanzania',                       code: 'TZ' },
    { id: 'country-tg', name: 'Togo',                           code: 'TG' },
    { id: 'country-tn', name: 'Tunisia',                        code: 'TN' },
    { id: 'country-ug', name: 'Uganda',                         code: 'UG' },
    { id: 'country-zm', name: 'Zambia',                         code: 'ZM' },
    { id: 'country-zw', name: 'Zimbabwe',                       code: 'ZW' },
  ]
  for (const c of africanCountries) {
    await prisma.location.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, name: c.name, type: LocationType.COUNTRY, code: c.code, parent: { connect: { id: africa.id } } }
    })
  }

  // PROVINCES (9 SA Provinces)
  const provinces = [
    { id: 'prov-kzn', name: 'KwaZulu-Natal',  code: 'KZN' },
    { id: 'prov-gp',  name: 'Gauteng',          code: 'GP'  },
    { id: 'prov-wc',  name: 'Western Cape',     code: 'WC'  },
    { id: 'prov-ec',  name: 'Eastern Cape',     code: 'EC'  },
    { id: 'prov-fs',  name: 'Free State',       code: 'FS'  },
    { id: 'prov-lp',  name: 'Limpopo',          code: 'LP'  },
    { id: 'prov-mp',  name: 'Mpumalanga',       code: 'MP'  },
    { id: 'prov-nw',  name: 'North West',       code: 'NW'  },
    { id: 'prov-nc',  name: 'Northern Cape',    code: 'NC'  },
  ]
  for (const p of provinces) {
    await prisma.location.upsert({
      where: { id: p.id }, update: {},
      create: { id: p.id, name: p.name, type: LocationType.PROVINCE, code: p.code, parent: { connect: { id: southAfrica.id } } }
    })
  }

  // DISTRICTS — KZN
  const kznDistricts = [
    { id: 'dist-ethekwini',      name: 'eThekwini',            code: 'ETH' },
    { id: 'dist-umgungundlovu',  name: 'uMgungundlovu',        code: 'UMG' },
    { id: 'dist-uthukela',       name: 'uThukela',             code: 'UTH' },
    { id: 'dist-ilembe',         name: 'iLembe',               code: 'ILM' },
    { id: 'dist-zululand',       name: 'Zululand',             code: 'ZUL' },
    { id: 'dist-umkhanyakude',   name: 'uMkhanyakude',         code: 'UMK' },
    { id: 'dist-harry-gwala',    name: 'Harry Gwala',          code: 'HGW' },
    { id: 'dist-king-cetshwayo', name: 'King Cetshwayo',       code: 'KCT' },
    { id: 'dist-amajuba',        name: 'Amajuba',              code: 'AMJ' },
    { id: 'dist-ugu',            name: 'uGu',                  code: 'UGU' },
    { id: 'dist-umzinyathi',     name: 'uMzinyathi',           code: 'UMZ' },
  ]
  for (const d of kznDistricts) {
    await prisma.location.upsert({
      where: { id: d.id }, update: {},
      create: { id: d.id, name: d.name, type: LocationType.DISTRICT, code: d.code, parent: { connect: { id: 'prov-kzn' } } }
    })
  }

  // DISTRICTS — Gauteng
  const gpDistricts = [
    { id: 'dist-city-tshwane', name: 'City of Tshwane',      code: 'TSH' },
    { id: 'dist-city-joburg',  name: 'City of Johannesburg',  code: 'JHB' },
    { id: 'dist-ekurhuleni',   name: 'Ekurhuleni',            code: 'EKU' },
    { id: 'dist-sedibeng',     name: 'Sedibeng',              code: 'SED' },
    { id: 'dist-westrand',     name: 'West Rand',             code: 'WRD' },
  ]
  for (const d of gpDistricts) {
    await prisma.location.upsert({
      where: { id: d.id }, update: {},
      create: { id: d.id, name: d.name, type: LocationType.DISTRICT, code: d.code, parent: { connect: { id: 'prov-gp' } } }
    })
  }

  // DISTRICTS — Western Cape
  const wcDistricts = [
    { id: 'dist-city-cape-town', name: 'City of Cape Town', code: 'CPT' },
    { id: 'dist-stellenbosch',   name: 'Stellenbosch',      code: 'STB' },
    { id: 'dist-george',         name: 'George',            code: 'GEO' },
  ]
  for (const d of wcDistricts) {
    await prisma.location.upsert({
      where: { id: d.id }, update: {},
      create: { id: d.id, name: d.name, type: LocationType.DISTRICT, code: d.code, parent: { connect: { id: 'prov-wc' } } }
    })
  }

  // CITIES — KZN eThekwini
  const ethekwiniCities = [
    { id: 'city-durban',     name: 'Durban'     },
    { id: 'city-umlazi',     name: 'Umlazi'     },
    { id: 'city-pinetown',   name: 'Pinetown'   },
    { id: 'city-chatsworth', name: 'Chatsworth' },
    { id: 'city-phoenix',    name: 'Phoenix'    },
    { id: 'city-inanda',     name: 'Inanda'     },
    { id: 'city-kwamashu',   name: 'KwaMashu'   },
  ]
  for (const c of ethekwiniCities) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-ethekwini' } } }
    })
  }

  // CITIES — KZN uMgungundlovu
  for (const c of [
    { id: 'city-pmb',      name: 'Pietermaritzburg' },
    { id: 'city-howick',   name: 'Howick'           },
    { id: 'city-richmond', name: 'Richmond'         },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-umgungundlovu' } } }
    })
  }

  // CITIES — Gauteng Johannesburg
  for (const c of [
    { id: 'city-soweto',       name: 'Soweto'          },
    { id: 'city-sandton',      name: 'Sandton'         },
    { id: 'city-alexandra',    name: 'Alexandra'       },
    { id: 'city-johannesburg', name: 'Johannesburg CBD' },
    { id: 'city-roodepoort',   name: 'Roodepoort'      },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-city-joburg' } } }
    })
  }

  // CITIES — Gauteng Tshwane
  for (const c of [
    { id: 'city-pretoria',        name: 'Pretoria'       },
    { id: 'city-mamelodi',        name: 'Mamelodi'       },
    { id: 'city-atteridgeville',  name: 'Atteridgeville' },
    { id: 'city-centurion',       name: 'Centurion'      },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-city-tshwane' } } }
    })
  }

  // CITIES — Western Cape Cape Town
  for (const c of [
    { id: 'city-cape-town',  name: 'Cape Town CBD' },
    { id: 'city-mitchells',  name: "Mitchell's Plain" },
    { id: 'city-bellville',  name: 'Bellville'     },
    { id: 'city-khayelitsha',name: 'Khayelitsha'   },
    { id: 'city-gugulethu',  name: 'Gugulethu'     },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-city-cape-town' } } }
    })
  }

  // CITIES — Western Cape Stellenbosch
  for (const c of [
    { id: 'city-stellenbosch', name: 'Stellenbosch' },
    { id: 'city-paarl',        name: 'Paarl'         },
    { id: 'city-somerset-west',name: 'Somerset West' },
    { id: 'city-franschhoek',  name: 'Franschhoek'   },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-stellenbosch' } } }
    })
  }

  // CITIES — Western Cape George
  for (const c of [
    { id: 'city-george',      name: 'George'      },
    { id: 'city-knysna',      name: 'Knysna'      },
    { id: 'city-mossel-bay',  name: 'Mossel Bay'  },
    { id: 'city-oudtshoorn',  name: 'Oudtshoorn'  },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-george' } } }
    })
  }

  // CITIES — Gauteng Ekurhuleni
  for (const c of [
    { id: 'city-benoni',       name: 'Benoni'       },
    { id: 'city-kempton-park', name: 'Kempton Park' },
    { id: 'city-germiston',    name: 'Germiston'    },
    { id: 'city-boksburg',     name: 'Boksburg'     },
    { id: 'city-brakpan',      name: 'Brakpan'      },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-ekurhuleni' } } }
    })
  }

  // CITIES — Gauteng Sedibeng
  for (const c of [
    { id: 'city-vereeniging',     name: 'Vereeniging'     },
    { id: 'city-vanderbijlpark',  name: 'Vanderbijlpark'  },
    { id: 'city-meyerton',        name: 'Meyerton'        },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-sedibeng' } } }
    })
  }

  // CITIES — Gauteng West Rand
  for (const c of [
    { id: 'city-krugersdorp',  name: 'Krugersdorp'  },
    { id: 'city-randfontein',  name: 'Randfontein'  },
    { id: 'city-westonaria',   name: 'Westonaria'   },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-westrand' } } }
    })
  }

  // CITIES — KZN uThukela
  for (const c of [
    { id: 'city-ladysmith',  name: 'Ladysmith'  },
    { id: 'city-estcourt',   name: 'Estcourt'   },
    { id: 'city-bergville',  name: 'Bergville'  },
    { id: 'city-colenso',    name: 'Colenso'    },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-uthukela' } } }
    })
  }

  // CITIES — KZN iLembe
  for (const c of [
    { id: 'city-ballito',    name: 'Ballito'           },
    { id: 'city-stanger',    name: 'Stanger (KwaDukuza)' },
    { id: 'city-tongaat',    name: 'Tongaat'           },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-ilembe' } } }
    })
  }

  // CITIES — KZN Zululand
  for (const c of [
    { id: 'city-ulundi',    name: 'Ulundi'    },
    { id: 'city-vryheid',   name: 'Vryheid'   },
    { id: 'city-nongoma',   name: 'Nongoma'   },
    { id: 'city-paulpietersburg', name: 'Paulpietersburg' },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-zululand' } } }
    })
  }

  // CITIES — KZN uMkhanyakude
  for (const c of [
    { id: 'city-hluhluwe', name: 'Hluhluwe' },
    { id: 'city-jozini',   name: 'Jozini'   },
    { id: 'city-mkuze',    name: 'Mkuze'    },
    { id: 'city-ingwavuma',name: 'Ingwavuma' },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-umkhanyakude' } } }
    })
  }

  // CITIES — KZN Harry Gwala
  for (const c of [
    { id: 'city-kokstad',     name: 'Kokstad'     },
    { id: 'city-ixopo',       name: 'Ixopo'       },
    { id: 'city-creighton',   name: 'Creighton'   },
    { id: 'city-underberg',   name: 'Underberg'   },
    { id: 'city-highflats',   name: 'Highflats'   },
    { id: 'city-umzimkhulu',  name: 'Umzimkhulu'  },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-harry-gwala' } } }
    })
  }

  // CITIES — KZN King Cetshwayo
  for (const c of [
    { id: 'city-richardsbay',  name: 'Richards Bay' },
    { id: 'city-empangeni',    name: 'Empangeni'    },
    { id: 'city-eshowe',       name: 'Eshowe'       },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-king-cetshwayo' } } }
    })
  }

  // CITIES — KZN Amajuba
  for (const c of [
    { id: 'city-newcastle',   name: 'Newcastle'   },
    { id: 'city-dannhauser',  name: 'Dannhauser'  },
    { id: 'city-utrecht',     name: 'Utrecht'     },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-amajuba' } } }
    })
  }

  // CITIES — KZN uGu
  for (const c of [
    { id: 'city-port-shepstone', name: 'Port Shepstone' },
    { id: 'city-margate',        name: 'Margate'        },
    { id: 'city-scottburgh',     name: 'Scottburgh'     },
    { id: 'city-harding',        name: 'Harding'        },
    { id: 'city-umzinto',        name: 'Umzinto'        },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-ugu' } } }
    })
  }

  // CITIES — KZN uMzinyathi
  for (const c of [
    { id: 'city-dundee',  name: 'Dundee'  },
    { id: 'city-nqutu',   name: 'Nqutu'   },
    { id: 'city-msinga',  name: 'Msinga'  },
    { id: 'city-greytown',name: 'Greytown' },
  ]) {
    await prisma.location.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: 'dist-umzinyathi' } } }
    })
  }

  // ── EASTERN CAPE ──────────────────────────────────────────────────────────
  const ecDistricts = [
    { id: 'dist-bufcity',      name: 'Buffalo City',         code: 'BUF' },
    { id: 'dist-nmbm',         name: 'Nelson Mandela Bay',   code: 'NMA' },
    { id: 'dist-ortambo',      name: 'OR Tambo',             code: 'ORT' },
    { id: 'dist-amathole',     name: 'Amathole',             code: 'AMT' },
    { id: 'dist-chrishani',    name: 'Chris Hani',           code: 'CHI' },
    { id: 'dist-sarahbaartman',name: 'Sarah Baartman',       code: 'SAR' },
    { id: 'dist-alfredNzo',    name: 'Alfred Nzo',           code: 'ALF' },
    { id: 'dist-joegqabi',     name: 'Joe Gqabi',            code: 'JOE' },
  ]
  for (const d of ecDistricts) {
    await prisma.location.upsert({
      where: { id: d.id }, update: {},
      create: { id: d.id, name: d.name, type: LocationType.DISTRICT, code: d.code, parent: { connect: { id: 'prov-ec' } } }
    })
  }
  for (const [parentId, cities] of [
    ['dist-bufcity',       [{ id: 'city-east-london', name: 'East London' }, { id: 'city-mdantsane', name: 'Mdantsane' }, { id: 'city-bhisho', name: 'Bhisho' }]],
    ['dist-nmbm',          [{ id: 'city-gqeberha', name: 'Gqeberha (Port Elizabeth)' }, { id: 'city-uitenhage', name: 'Uitenhage' }]],
    ['dist-ortambo',       [{ id: 'city-mthatha', name: 'Mthatha' }, { id: 'city-port-st-johns', name: 'Port St Johns' }, { id: 'city-ngqeleni', name: 'Ngqeleni' }]],
    ['dist-amathole',      [{ id: 'city-king-williams-town', name: "King William's Town" }, { id: 'city-stutterheim', name: 'Stutterheim' }, { id: 'city-berlin-ec', name: 'Berlin' }]],
    ['dist-chrishani',     [{ id: 'city-komani', name: 'Komani (Queenstown)' }, { id: 'city-cofimvaba', name: 'Cofimvaba' }]],
    ['dist-sarahbaartman', [{ id: 'city-makhanda', name: 'Makhanda (Grahamstown)' }, { id: 'city-kariega', name: 'Kariega' }]],
    ['dist-alfredNzo',     [{ id: 'city-mount-ayliff', name: 'Mount Ayliff' }, { id: 'city-bizana', name: 'Bizana' }]],
    ['dist-joegqabi',      [{ id: 'city-aliwal-north', name: 'Aliwal North' }, { id: 'city-burgersdorp', name: 'Burgersdorp' }]],
  ] as [string, { id: string; name: string }[]][]) {
    for (const c of cities) {
      await prisma.location.upsert({
        where: { id: c.id }, update: {},
        create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: parentId } } }
      })
    }
  }

  // ── FREE STATE ────────────────────────────────────────────────────────────
  const fsDistricts = [
    { id: 'dist-mangaung',      name: 'Mangaung',            code: 'MAN' },
    { id: 'dist-lejweleputswa', name: 'Lejweleputswa',       code: 'LEJ' },
    { id: 'dist-fezile-dabi',   name: 'Fezile Dabi',         code: 'FEZ' },
    { id: 'dist-xhariep',       name: 'Xhariep',             code: 'XHA' },
    { id: 'dist-thabo-mof',     name: 'Thabo Mofutsanyana',  code: 'THA' },
  ]
  for (const d of fsDistricts) {
    await prisma.location.upsert({
      where: { id: d.id }, update: {},
      create: { id: d.id, name: d.name, type: LocationType.DISTRICT, code: d.code, parent: { connect: { id: 'prov-fs' } } }
    })
  }
  for (const [parentId, cities] of [
    ['dist-mangaung',      [{ id: 'city-bloemfontein', name: 'Bloemfontein' }, { id: 'city-botshabelo', name: 'Botshabelo' }, { id: 'city-thaba-nchu', name: 'Thaba Nchu' }]],
    ['dist-lejweleputswa', [{ id: 'city-welkom', name: 'Welkom' }, { id: 'city-odendaalsrus', name: 'Odendaalsrus' }, { id: 'city-virginia-fs', name: 'Virginia' }]],
    ['dist-fezile-dabi',   [{ id: 'city-sasolburg', name: 'Sasolburg' }, { id: 'city-parys', name: 'Parys' }]],
    ['dist-xhariep',       [{ id: 'city-springfontein', name: 'Springfontein' }, { id: 'city-trompsburg', name: 'Trompsburg' }]],
    ['dist-thabo-mof',     [{ id: 'city-phuthaditjhaba', name: 'Phuthaditjhaba' }, { id: 'city-harrismith', name: 'Harrismith' }, { id: 'city-bethlehem', name: 'Bethlehem' }]],
  ] as [string, { id: string; name: string }[]][]) {
    for (const c of cities) {
      await prisma.location.upsert({
        where: { id: c.id }, update: {},
        create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: parentId } } }
      })
    }
  }

  // ── LIMPOPO ───────────────────────────────────────────────────────────────
  const lpDistricts = [
    { id: 'dist-capricorn',   name: 'Capricorn',        code: 'CAP' },
    { id: 'dist-mopani',      name: 'Mopani',           code: 'MOP' },
    { id: 'dist-sekhukhune',  name: 'Sekhukhune',       code: 'SEK' },
    { id: 'dist-vhembe',      name: 'Vhembe',           code: 'VHE' },
    { id: 'dist-waterberg',   name: 'Waterberg',        code: 'WAT' },
  ]
  for (const d of lpDistricts) {
    await prisma.location.upsert({
      where: { id: d.id }, update: {},
      create: { id: d.id, name: d.name, type: LocationType.DISTRICT, code: d.code, parent: { connect: { id: 'prov-lp' } } }
    })
  }
  for (const [parentId, cities] of [
    ['dist-capricorn',  [{ id: 'city-polokwane', name: 'Polokwane' }, { id: 'city-seshego', name: 'Seshego' }, { id: 'city-mokopane', name: 'Mokopane' }]],
    ['dist-mopani',     [{ id: 'city-tzaneen', name: 'Tzaneen' }, { id: 'city-giyani', name: 'Giyani' }, { id: 'city-phalaborwa', name: 'Phalaborwa' }]],
    ['dist-sekhukhune', [{ id: 'city-jane-furse', name: 'Jane Furse' }, { id: 'city-burgersfort', name: 'Burgersfort' }, { id: 'city-groblersdal', name: 'Groblersdal' }]],
    ['dist-vhembe',     [{ id: 'city-thohoyandou', name: 'Thohoyandou' }, { id: 'city-makhado', name: 'Makhado (Louis Trichardt)' }, { id: 'city-musina', name: 'Musina' }]],
    ['dist-waterberg',  [{ id: 'city-bela-bela', name: 'Bela-Bela' }, { id: 'city-modimolle', name: 'Modimolle' }, { id: 'city-lephalale', name: 'Lephalale' }]],
  ] as [string, { id: string; name: string }[]][]) {
    for (const c of cities) {
      await prisma.location.upsert({
        where: { id: c.id }, update: {},
        create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: parentId } } }
      })
    }
  }

  // ── MPUMALANGA ────────────────────────────────────────────────────────────
  const mpDistricts = [
    { id: 'dist-ehlanzeni',    name: 'Ehlanzeni',     code: 'EHL' },
    { id: 'dist-gertsibande',  name: 'Gert Sibande',  code: 'GER' },
    { id: 'dist-nkangala',     name: 'Nkangala',      code: 'NKA' },
  ]
  for (const d of mpDistricts) {
    await prisma.location.upsert({
      where: { id: d.id }, update: {},
      create: { id: d.id, name: d.name, type: LocationType.DISTRICT, code: d.code, parent: { connect: { id: 'prov-mp' } } }
    })
  }
  for (const [parentId, cities] of [
    ['dist-ehlanzeni',   [{ id: 'city-mbombela', name: 'Mbombela (Nelspruit)' }, { id: 'city-bushbuckridge', name: 'Bushbuckridge' }, { id: 'city-white-river', name: 'White River' }]],
    ['dist-gertsibande', [{ id: 'city-ermelo', name: 'Ermelo' }, { id: 'city-secunda', name: 'Secunda' }, { id: 'city-standerton', name: 'Standerton' }]],
    ['dist-nkangala',    [{ id: 'city-emalahleni', name: 'eMalahleni (Witbank)' }, { id: 'city-middelburg-mp', name: 'Middelburg' }, { id: 'city-kwamhlanga', name: 'KwaMhlanga' }]],
  ] as [string, { id: string; name: string }[]][]) {
    for (const c of cities) {
      await prisma.location.upsert({
        where: { id: c.id }, update: {},
        create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: parentId } } }
      })
    }
  }

  // ── NORTH WEST ────────────────────────────────────────────────────────────
  const nwDistricts = [
    { id: 'dist-bojanala',       name: 'Bojanala Platinum',        code: 'BOJ' },
    { id: 'dist-dr-kkds',        name: 'Dr Kenneth Kaunda',        code: 'DKK' },
    { id: 'dist-nmmolema',       name: 'Ngaka Modiri Molema',      code: 'NGM' },
    { id: 'dist-dr-rsmompati',   name: 'Dr Ruth Segomotsi Mompati',code: 'DRS' },
  ]
  for (const d of nwDistricts) {
    await prisma.location.upsert({
      where: { id: d.id }, update: {},
      create: { id: d.id, name: d.name, type: LocationType.DISTRICT, code: d.code, parent: { connect: { id: 'prov-nw' } } }
    })
  }
  for (const [parentId, cities] of [
    ['dist-bojanala',     [{ id: 'city-rustenburg', name: 'Rustenburg' }, { id: 'city-brits', name: 'Brits' }, { id: 'city-phokeng', name: 'Phokeng' }]],
    ['dist-dr-kkds',      [{ id: 'city-klerksdorp', name: 'Klerksdorp' }, { id: 'city-potchefstroom', name: 'Potchefstroom' }, { id: 'city-stilfontein', name: 'Stilfontein' }]],
    ['dist-nmmolema',     [{ id: 'city-mafikeng', name: 'Mahikeng (Mafikeng)' }, { id: 'city-zeerust', name: 'Zeerust' }, { id: 'city-lichtenburg', name: 'Lichtenburg' }]],
    ['dist-dr-rsmompati', [{ id: 'city-vryburg', name: 'Vryburg' }, { id: 'city-taung', name: 'Taung' }, { id: 'city-schweizer', name: 'Schweizer-Reneke' }]],
  ] as [string, { id: string; name: string }[]][]) {
    for (const c of cities) {
      await prisma.location.upsert({
        where: { id: c.id }, update: {},
        create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: parentId } } }
      })
    }
  }

  // ── NORTHERN CAPE ─────────────────────────────────────────────────────────
  const ncDistricts = [
    { id: 'dist-francesbaard', name: 'Frances Baard',        code: 'FRB' },
    { id: 'dist-johntaolo',    name: 'John Taolo Gaetsewe',  code: 'JTG' },
    { id: 'dist-namakwa',      name: 'Namakwa',              code: 'NAM' },
    { id: 'dist-pixley',       name: 'Pixley ka Seme',       code: 'PIX' },
    { id: 'dist-zfmgcawu',     name: 'ZF Mgcawu',            code: 'ZFM' },
  ]
  for (const d of ncDistricts) {
    await prisma.location.upsert({
      where: { id: d.id }, update: {},
      create: { id: d.id, name: d.name, type: LocationType.DISTRICT, code: d.code, parent: { connect: { id: 'prov-nc' } } }
    })
  }
  for (const [parentId, cities] of [
    ['dist-francesbaard', [{ id: 'city-kimberley', name: 'Kimberley' }, { id: 'city-hartswater', name: 'Hartswater' }, { id: 'city-jan-kempdorp', name: 'Jan Kempdorp' }]],
    ['dist-johntaolo',    [{ id: 'city-kuruman', name: 'Kuruman' }, { id: 'city-hotazel', name: 'Hotazel' }]],
    ['dist-namakwa',      [{ id: 'city-springbok', name: 'Springbok' }, { id: 'city-port-nolloth', name: 'Port Nolloth' }, { id: 'city-calvinia', name: 'Calvinia' }]],
    ['dist-pixley',       [{ id: 'city-de-aar', name: 'De Aar' }, { id: 'city-victoria-west', name: 'Victoria West' }, { id: 'city-colesberg', name: 'Colesberg' }]],
    ['dist-zfmgcawu',     [{ id: 'city-upington', name: 'Upington' }, { id: 'city-keimoes', name: 'Keimoes' }, { id: 'city-kakamas', name: 'Kakamas' }]],
  ] as [string, { id: string; name: string }[]][]) {
    for (const c of cities) {
      await prisma.location.upsert({
        where: { id: c.id }, update: {},
        create: { id: c.id, name: c.name, type: LocationType.CITY, parent: { connect: { id: parentId } } }
      })
    }
  }

  // CATEGORIES (product categories + Other)
  // Agriculture split (2026-07-12): 'livestock' = live animals (breed/purpose detail form),
  // 'produce' = crops incl. harvest pre-orders + farm products (milk, amasi, eggs).
  // 'food' remains for prepared/processed food.
  const categories = [
    { id: 'cat-fashion',     name: 'Fashion & Clothing', slug: 'fashion',     icon: '👗' },
    { id: 'cat-art',         name: 'Art & Paintings',    slug: 'art',         icon: '🎨' },
    { id: 'cat-furniture',   name: 'Furniture',          slug: 'furniture',   icon: '🪑' },
    { id: 'cat-food',        name: 'Food',               slug: 'food',        icon: '🌽' },
    { id: 'cat-livestock',   name: 'Livestock',          slug: 'livestock',   icon: '🐄' },
    { id: 'cat-produce',     name: 'Farm Produce',       slug: 'produce',     icon: '🥬' },
    { id: 'cat-beauty',      name: 'Beauty & Skincare',  slug: 'beauty',      icon: '💄' },
    { id: 'cat-sculpture',   name: 'Sculpture & Crafts', slug: 'sculpture',   icon: '🗿' },
    { id: 'cat-electronics', name: 'Electronics',        slug: 'electronics', icon: '🔌' },
    { id: 'cat-books',       name: 'Books & Literature', slug: 'books',       icon: '📚' },
    { id: 'cat-homeware',    name: 'Homeware & Decor',   slug: 'homeware',    icon: '🏺' },
    { id: 'cat-textiles',    name: 'Textiles & Fabric',  slug: 'textiles',    icon: '🧵' },
    { id: 'cat-music',       name: 'Artisan & Metalwork', slug: 'metalwork',   icon: '⚒️' },
    { id: 'cat-wellness',    name: 'Wellness & Herbal',  slug: 'wellness',    icon: '🌿' },
    { id: 'cat-drawings',    name: 'Drawings & Prints',  slug: 'drawings',    icon: '✏️' },
    { id: 'cat-photography', name: 'Photography',        slug: 'photography', icon: '📸' },
    { id: 'cat-other',       name: 'Other',              slug: 'other',       icon: '💡' },
  ]
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, slug: cat.slug, icon: cat.icon },
      create: { id: cat.id, name: cat.name, slug: cat.slug, icon: cat.icon }
    })
  }

  /* ── TEST SELLERS & PRODUCTS removed ─────────────────────────────────────
     Real sellers register via /register/seller and are verified by the admin.
     Real products are listed by verified sellers via the seller dashboard.
  ── */

  /*
  const testSellers = [
    {
      id: 'seller-nomvula',
      email: 'nomvula@vuna.test',
      name: 'Nomvula Dlamini',
      brandName: "Nomvula's Beadwork",
      phone: '0721234001',
      password: '$SEED_PLACEHOLDER',
      bio: 'I have been making Zulu beadwork since I was 12, learning from my grandmother in KwaMashu. Every colour in my work carries meaning from my heritage.',
      avatar: 'https://images.pexels.com/photos/3774253/pexels-photo-3774253.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
      banner: 'https://images.pexels.com/photos/9130275/pexels-photo-9130275.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1',
      locationId: 'city-kwamashu',
      categoryId: 'cat-textiles',
      status: SellerStatus.VERIFIED,
      isVerified: true,
    },
    {
      id: 'seller-sipho',
      email: 'sipho@vuna.test',
      name: 'Sipho Ndlovu',
      brandName: 'Sipho Wood Studio',
      phone: '0731234002',
      password: '$SEED_PLACEHOLDER',
      bio: 'Born in Soweto, I carve traditional African figures and home décor from reclaimed wood. Each piece takes days of careful work and is signed by hand.',
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
      banner: 'https://images.pexels.com/photos/15859553/pexels-photo-15859553.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1',
      locationId: 'city-soweto',
      categoryId: 'cat-sculpture',
      status: SellerStatus.VERIFIED,
      isVerified: true,
    },
    {
      id: 'seller-zanele',
      email: 'zanele@vuna.test',
      name: 'Zanele Mokoena',
      brandName: "Zanele's Kitchen",
      phone: '0711234003',
      password: '$SEED_PLACEHOLDER',
      bio: "I produce small-batch traditional condiments, teas and dried goods from my home kitchen in Cape Town. Everything is made using my grandmother's recipes from Limpopo.",
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
      banner: 'https://images.pexels.com/photos/36319633/pexels-photo-36319633.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1',
      locationId: 'city-cape-town',
      categoryId: 'cat-food',
      status: SellerStatus.VERIFIED,
      isVerified: true,
    },
    {
      id: 'seller-thabo',
      email: 'thabo@vuna.test',
      name: 'Thabo Mthembu',
      brandName: 'Thabo Prints',
      phone: '0741234004',
      password: '$SEED_PLACEHOLDER',
      bio: 'I design and hand-print streetwear that blends traditional patterns with Joburg township culture. Every hoodie and tee I make is one of a kind.',
      avatar: 'https://images.pexels.com/photos/2741701/pexels-photo-2741701.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
      banner: 'https://images.pexels.com/photos/36720360/pexels-photo-36720360.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1',
      locationId: 'city-johannesburg',
      categoryId: 'cat-fashion',
      status: SellerStatus.VERIFIED,
      isVerified: true,
    },
    {
      id: 'seller-lindiwe',
      email: 'lindiwe@vuna.test',
      name: 'Lindiwe Khumalo',
      brandName: 'Lindiwe Pottery',
      phone: '0761234005',
      password: '$SEED_PLACEHOLDER',
      bio: 'I make hand-thrown pottery inspired by the shapes and colours of KwaZulu-Natal. I fire each piece in a wood kiln outside my home in PMB.',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
      banner: 'https://images.pexels.com/photos/15859553/pexels-photo-15859553.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1',
      locationId: 'city-pmb',
      categoryId: 'cat-art',
      status: SellerStatus.VERIFIED,
      isVerified: true,
    },
  ]

  for (const seller of testSellers) {
    await prisma.seller.upsert({ where: { id: seller.id }, update: {}, create: seller })
  }

  const testProducts = [
    {
      id: 'prod-beads-1',
      name: 'Zulu Beaded Necklace',
      description: 'Hand-made Zulu beaded necklace in traditional patterns. Uses glass seed beads sourced from Durban. Each piece takes approximately 8 hours to complete.',
      price: 285,
      stock: 4,
      status: ProductStatus.ACTIVE,
      images: ['https://images.pexels.com/photos/9130275/pexels-photo-9130275.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&dpr=1'],
      sellerId: 'seller-nomvula',
      categoryId: 'cat-textiles',
      locationId: 'city-kwamashu',
    },
    {
      id: 'prod-beads-2',
      name: 'Beaded Bracelet Set — 3 Pieces',
      description: 'A set of three matching beaded bracelets in different widths. Colours represent the Zulu royal lineage. Suitable for men and women.',
      price: 165,
      stock: 8,
      status: ProductStatus.ACTIVE,
      images: ['https://images.pexels.com/photos/36319633/pexels-photo-36319633.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&dpr=1'],
      sellerId: 'seller-nomvula',
      categoryId: 'cat-textiles',
      locationId: 'city-kwamashu',
    },
    {
      id: 'prod-wood-1',
      name: 'Hand-Carved Serving Board',
      description: 'Carved from a single piece of African mahogany. Food-safe finish using natural beeswax. No two boards are identical.',
      price: 550,
      stock: 2,
      status: ProductStatus.ACTIVE,
      images: ['https://images.pexels.com/photos/15859553/pexels-photo-15859553.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&dpr=1'],
      sellerId: 'seller-sipho',
      categoryId: 'cat-sculpture',
      locationId: 'city-soweto',
    },
    {
      id: 'prod-wood-2',
      name: 'African Elephant Figurine',
      description: 'Hand-carved elephant in reclaimed wood. Stands 18cm tall. Signed and dated on the base. Ready to ship within 3 days.',
      price: 380,
      stock: 5,
      status: ProductStatus.ACTIVE,
      images: ['https://images.pexels.com/photos/36720360/pexels-photo-36720360.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&dpr=1'],
      sellerId: 'seller-sipho',
      categoryId: 'cat-sculpture',
      locationId: 'city-soweto',
    },
    {
      id: 'prod-food-1',
      name: 'Moringa Powder — 100g',
      description: 'Sun-dried and stone-ground moringa from Limpopo. No additives. Rich in iron, calcium and antioxidants. Resealable pouch.',
      price: 95,
      stock: 20,
      status: ProductStatus.ACTIVE,
      images: ['https://images.pexels.com/photos/36319633/pexels-photo-36319633.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&dpr=1'],
      sellerId: 'seller-zanele',
      categoryId: 'cat-food',
      locationId: 'city-cape-town',
    },
    {
      id: 'prod-food-2',
      name: 'Umngqusho — Samp & Beans 500g',
      description: "Traditional samp and beans blend, slow-dried and hand-packaged. Made the old way from my grandmother's Limpopo recipe. Serves 4–6.",
      price: 65,
      stock: 15,
      status: ProductStatus.ACTIVE,
      images: ['https://images.pexels.com/photos/9130275/pexels-photo-9130275.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&dpr=1'],
      sellerId: 'seller-zanele',
      categoryId: 'cat-food',
      locationId: 'city-cape-town',
    },
    {
      id: 'prod-fashion-1',
      name: 'Kente-Print Oversized Hoodie',
      description: 'Hand screen-printed using water-based inks. Design fuses traditional patterns with Johannesburg township typography. Unisex sizing S–XL.',
      price: 620,
      stock: 3,
      status: ProductStatus.ACTIVE,
      images: ['https://images.pexels.com/photos/36720360/pexels-photo-36720360.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&dpr=1'],
      sellerId: 'seller-thabo',
      categoryId: 'cat-fashion',
      locationId: 'city-johannesburg',
    },
    {
      id: 'prod-pottery-1',
      name: 'Hand-Thrown Rondavel Bowl',
      description: 'Inspired by the shape of a traditional rondavel hut. Made from local red clay, glazed in ochre and charcoal. Oven and dishwasher safe.',
      price: 320,
      stock: 3,
      status: ProductStatus.ACTIVE,
      images: ['https://images.pexels.com/photos/15859553/pexels-photo-15859553.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&dpr=1'],
      sellerId: 'seller-lindiwe',
      categoryId: 'cat-art',
      locationId: 'city-pmb',
    },
  ]

  for (const product of testProducts) {
    await prisma.product.upsert({ where: { id: product.id }, update: {}, create: product })
  }
  */

  // Admin user
  await prisma.user.upsert({
    where:  { email: 'admin@vuna.co.za' },
    update: { role: 'ADMIN', isVerified: true },
    create: {
      id:         'user-admin',
      email:      'admin@vuna.co.za',
      name:       'Vuna Admin',
      password:   '$2b$10$acmv/Z92MhpVEpCR4LZtRuoWvBugcOWEEUvCtdjo9NDrpKK2MvjCm',
      role:       'ADMIN',
      isVerified: true,
    },
  })

  console.log('Vuna database seeded successfully!')
  console.log('Locations: Africa -> SA -> 9 Provinces -> Districts -> Cities')
  console.log('Categories: 14 African + Other (15 total) ready')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
