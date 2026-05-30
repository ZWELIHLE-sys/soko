export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  sellerName: string
  categoryIcon: string
  quantity: number
  sellerId: string
}

export interface Location { id: string; name: string }

export interface DeliveryFormState {
  firstName:  string
  lastName:   string
  phone:      string
  address:    string
  provinceId: string
  districtId: string
  cityId:     string
}
