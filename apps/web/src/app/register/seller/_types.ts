export interface Category { id: string; name: string; icon: string; slug: string }
export interface Location { id: string; name: string }

export interface SellerFormState {
  name:            string
  email:           string
  password:        string
  confirmPassword: string
  phone:           string
  brandName:       string
  bio:             string
  categoryId:      string
  customCategory:  string
  provinceId:      string
  districtId:      string
  locationId:      string
  suburb:          string
  socialMediaLink: string
}

export const CATEGORY_DESC: Record<string, string> = {
  fashion:     'Clothing, accessories, traditional dress',
  art:         'Paintings, prints and visual art',
  furniture:   'Handmade furniture and wood pieces',
  food:        'Prepared foods, spices and pantry goods',
  livestock:   'Live animals — cattle, sheep, goats, pigs, poultry',
  produce:     'Fresh harvests, vegetables, eggs, milk and amasi',
  beauty:      'Skincare, haircare and beauty products',
  sculpture:   'Carved sculptures and craft objects',
  electronics: 'Handbuilt electronics and tech items',
  books:       'Books, poetry and written works',
  homeware:    'Home décor, kitchenware and interiors',
  textiles:    'Beadwork, weaving, fabrics and fibre',
  metalwork:   'Gates, ironwork, welding and metalcraft',
  wellness:    'Herbal remedies and holistic wellness',
  drawings:    'Illustrations, sketches and prints',
  photography: 'Photography prints and visual work',
  other:       'Something else — tell us what you make',
}

export const EMPTY_FORM: SellerFormState = {
  name: '', email: '', password: '', confirmPassword: '',
  phone: '', brandName: '', bio: '',
  categoryId: '', customCategory: '',
  provinceId: '', districtId: '', locationId: '', suburb: '',
  socialMediaLink: '',
}
