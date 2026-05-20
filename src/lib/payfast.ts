import crypto from 'crypto'

const SANDBOX = process.env.PAYFAST_SANDBOX === 'true'

export const PAYFAST_URL = SANDBOX
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process'

export interface PayFastData {
  merchant_id: string
  merchant_key: string
  return_url: string
  cancel_url: string
  notify_url: string
  name_first: string
  name_last: string
  email_address: string
  m_payment_id: string
  amount: string
  item_name: string
  item_description?: string
}

export function generateSignature(data: Record<string, string>, passphrase?: string): string {
  // Sort keys and build query string
  let queryString = Object.keys(data)
    .filter(key => data[key] !== '')
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&')

  // Append passphrase
  if (passphrase) {
    queryString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
  }

  return crypto.createHash('md5').update(queryString).digest('hex')
}

export function buildPayFastForm(data: PayFastData): Record<string, string> {
  const fields: Record<string, string> = {
    merchant_id:    process.env.PAYFAST_MERCHANT_ID!,
    merchant_key:   process.env.PAYFAST_MERCHANT_KEY!,
    return_url:     data.return_url,
    cancel_url:     data.cancel_url,
    notify_url:     data.notify_url,
    name_first:     data.name_first,
    name_last:      data.name_last,
    email_address:  data.email_address,
    m_payment_id:   data.m_payment_id,
    amount:         data.amount,
    item_name:      data.item_name,
  }

  if (data.item_description) {
    fields.item_description = data.item_description
  }

  fields.signature = generateSignature(fields, process.env.PAYFAST_PASSPHRASE)

  return fields
}