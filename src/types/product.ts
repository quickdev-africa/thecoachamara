export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  sku?: string;
  inventory?: number;
  metadata?: Record<string, any>;
}
