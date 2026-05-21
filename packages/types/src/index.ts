// Shared TypeScript types for Vuna apps
// Add shared interfaces here as the platform grows

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
