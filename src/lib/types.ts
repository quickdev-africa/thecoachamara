// Backend Architecture Standards & Types
// This file defines the standardized data models and API patterns

// ============================================================================
// CORE DATA MODELS
// ============================================================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  images: string[];
  stock: number;
  isActive: boolean;
  featured: boolean;
  metadata: {
    weight?: number;
    dimensions?: string;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  metadata: {
    productCount: number;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  // Aggregated product names for list views (optional)
  productNames?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  delivery: DeliveryInfo;
  metadata: {
    source: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface DeliveryInfo {
  method: 'pickup' | 'shipping';
  pickupLocation?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode?: string;
  };
  deliveryZone?: string;
  estimatedDelivery?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberType: 'free' | 'paid';
  joinDate: string;
  orderHistory: string[];
  analytics: {
    totalSpent: number;
    totalOrders: number;
    lastOrderDate?: string;
    preferredDelivery?: 'pickup' | 'shipping';
    location?: {
      state: string;
      city: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export const DELIVERY_ZONES = {
  "Lagos Zone": { cost: 3000, states: ["Lagos", "Ogun"] },
  "Abuja Zone": { cost: 4000, states: ["FCT", "Niger", "Kaduna", "Nasarawa", "Kogi"] },
  "Other States": { cost: 5000, states: ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kano", "Katsina", "Kebbi", "Kwara", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"] }
} as const;

export const PICKUP_LOCATIONS = [
  "10 Ajibodu Street Karaole Estate College Road Ogba, Lagos"
] as const;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function calculateDeliveryFee(state: string): number {
  const zones = {
    "Lagos Zone": { cost: 3000, states: ["Lagos", "Ogun"] },
    "Abuja Zone": { cost: 4000, states: ["FCT", "Niger", "Kaduna", "Nasarawa", "Kogi"] },
    "Other States": { cost: 5000, states: ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kano", "Katsina", "Kebbi", "Kwara", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"] }
  };
  
  // Normalize input: trim and capitalize first letter of each word
  const normalizedState = state.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  
  for (const [_, zoneData] of Object.entries(zones)) {
    if (zoneData.states.includes(normalizedState)) {
      return zoneData.cost;
    }
  }
  
  // Default to "Other States" cost if state is not empty but not found
  // Return 0 only if state is empty (for pickup scenarios)
  return normalizedState ? 5000 : 0;
}

export function getDeliveryZone(state: string): string | null {
  const zones = {
    "Lagos Zone": { cost: 3000, states: ["Lagos", "Ogun"] },
    "Abuja Zone": { cost: 4000, states: ["FCT", "Niger", "Kaduna", "Nasarawa", "Kogi"] },
    "Other States": { cost: 5000, states: ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kano", "Katsina", "Kebbi", "Kwara", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"] }
  };
  
  // Normalize input: trim and capitalize first letter of each word
  const normalizedState = state.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  
  for (const [zoneName, zoneData] of Object.entries(zones)) {
    if (zoneData.states.includes(normalizedState)) {
      return zoneName;
    }
  }
  
  // Return "Other States" for any non-empty state not in the list
  return normalizedState ? "Other States" : null;
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

export function validateEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1);
    return /^\d{7,14}$/.test(digits);
  }
  return /^\d{7,15}$/.test(cleaned);
}
