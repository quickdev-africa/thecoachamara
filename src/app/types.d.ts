declare global {
  interface Window {
    __NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?: string;
    __NEXT_PUBLIC_BASE_URL?: string;
    __paystack_loader_added?: boolean;
  }
}

export {};
