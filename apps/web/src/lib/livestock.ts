/**
 * Livestock domain reference — the three axes every animal listing respects:
 * species → breed → purpose. Breeds are the REAL names buyers use at sales,
 * including the cultural distinction between traditional hardbody chickens
 * and commercial broilers (lamuthuthus). Breed stays free text in the DB;
 * these lists power the suggestions in the listing form.
 */

export const SPECIES = [
  { value: 'CATTLE',  label: 'Cattle' },
  { value: 'SHEEP',   label: 'Sheep' },
  { value: 'GOAT',    label: 'Goats' },
  { value: 'PIG',     label: 'Pigs' },
  { value: 'POULTRY', label: 'Poultry' },
] as const

export type Species = (typeof SPECIES)[number]['value']

export const BREED_SUGGESTIONS: Record<Species, string[]> = {
  CATTLE: [
    'Nguni',
    'Boran',
    'Brahman',
    'Bonsmara',
    'Afrikaner',
    'Drakensberger',
    'Beefmaster',
    'Holstein (dairy)',
    'Jersey (dairy)',
    'Mixed / Cross',
  ],
  SHEEP: [
    'Dorper',
    'Merino (wool)',
    'Döhne Merino (dual purpose)',
    'Meatmaster',
    'Damara',
    'Van Rooy',
    'Mixed / Cross',
  ],
  GOAT: [
    'Boer (meat)',
    'Kalahari Red',
    'Savanna',
    'Saanen (milk)',
    'Toggenburg (milk)',
    'Indigenous veld goat',
    'Mixed / Cross',
  ],
  PIG: [
    'Large White',
    'Landrace',
    'Duroc',
    'Kolbroek (indigenous)',
    'Mixed / Cross',
  ],
  POULTRY: [
    'Traditional chicken (hardbody)',
    'Broiler (Lamuthuthu)',
    'Layer hen',
    'Rooster',
    'Potchefstroom Koekoek',
    'Boschveld',
    'Venda chicken',
    'Mixed / Cross',
  ],
}

export const PURPOSES = [
  { value: 'MEAT',         label: 'Meat' },
  { value: 'MILK',         label: 'Milk / Dairy' },
  { value: 'WOOL',         label: 'Wool / Fibre' },
  { value: 'EGGS',         label: 'Eggs' },
  { value: 'BREEDING',     label: 'Breeding stock' },
  { value: 'DUAL_PURPOSE', label: 'Dual purpose — does everything' },
] as const

export type Purpose = (typeof PURPOSES)[number]['value']

// Which purposes make sense per species — keeps the form honest
export const SPECIES_PURPOSES: Record<Species, Purpose[]> = {
  CATTLE:  ['MEAT', 'MILK', 'BREEDING', 'DUAL_PURPOSE'],
  SHEEP:   ['MEAT', 'WOOL', 'BREEDING', 'DUAL_PURPOSE'],
  GOAT:    ['MEAT', 'MILK', 'BREEDING', 'DUAL_PURPOSE'],
  PIG:     ['MEAT', 'BREEDING'],
  POULTRY: ['MEAT', 'EGGS', 'BREEDING', 'DUAL_PURPOSE'],
}

export const SEXES = [
  { value: 'MALE',      label: 'Male' },
  { value: 'FEMALE',    label: 'Female' },
  { value: 'CASTRATED', label: 'Castrated' },
] as const

// Units for harvest pre-orders (Farm Produce category)
export const YIELD_UNITS = [
  'bunches',
  'kg',
  'crates',
  'bags',
  'heads',
  'dozens',
  'litres',
  'punnets',
] as const
