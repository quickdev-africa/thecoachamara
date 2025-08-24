// Customer type for shared use
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joined_at?: string;
  orders_count?: number;
  last_order_at?: string;
  is_active?: boolean;
};
