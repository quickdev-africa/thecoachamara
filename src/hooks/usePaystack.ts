// Custom hook for Paystack payment. All original logic preserved.
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createOrderAndInitPayment } from '../lib/paystackService';
import type { Product } from '../lib/types';

export function usePaystack({
  form,
  loading,
  setLoading,
  cartSessionId,
  total,
  subtotal,
  shipping,
  quantity,
  products
}: {
  form: any;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  cartSessionId: string;
  total: number;
  subtotal: number;
  shipping: number;
  quantity: number;
  products: Product[];
}) {
  const router = useRouter();
  const handlePayment = useCallback((overrideForm?: any) => {
    setLoading(true);
    return createOrderAndInitPayment({
      form: overrideForm || form,
      cartSessionId,
      total,
      subtotal,
      shipping,
      quantity,
      products,
      setLoading,
      router
    });
  }, [form, cartSessionId, total, subtotal, shipping, quantity, products, setLoading, router]);

  return { handlePayment };
}
