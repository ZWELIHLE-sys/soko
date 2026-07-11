export interface Location { id: string; name: string }

export interface BuyerFormState {
  name:            string
  email:           string
  password:        string
  confirmPassword: string
  phone:           string
  provinceId:      string
  districtId:      string
  locationId:      string
  suburb:          string
}

export const EMPTY_FORM: BuyerFormState = {
  name: '', email: '', password: '', confirmPassword: '',
  phone: '',
  provinceId: '', districtId: '', locationId: '', suburb: '',
}
