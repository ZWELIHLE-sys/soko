export interface Location { id: string; name: string }

export interface BuyerFormState {
  name:            string
  email:           string
  password:        string
  confirmPassword: string
  phone:           string
  countryId:       string
  provinceId:      string
  districtId:      string
  locationId:      string
  suburb:          string
}

export const EMPTY_FORM: BuyerFormState = {
  name: '', email: '', password: '', confirmPassword: '',
  phone: '',
  countryId: '', provinceId: '', districtId: '', locationId: '', suburb: '',
}
