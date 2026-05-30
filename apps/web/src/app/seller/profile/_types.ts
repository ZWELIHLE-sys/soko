export interface SellerProfile {
  name: string
  email: string
  brandName: string
  phone: string
  bio: string | null
  suburb: string | null
  avatar: string | null
  banner: string | null
  status: string
  isVerified: boolean
  location: { name: string }
  category: { name: string }
  bankName: string | null
  accountHolder: string | null
  accountNumber: string | null
  accountType: string | null
  branchCode: string | null
}

export interface BankFields {
  bankName: string
  accountHolder: string
  accountNumber: string
  accountType: string
  branchCode: string
}
