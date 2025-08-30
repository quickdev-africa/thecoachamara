// UI button only, calls payment handler from hook. All options preserved.
import React from 'react';

interface PaystackButtonProps {
  loading: boolean;
  canPay: boolean;
  paystackReady?: boolean;
  total: number;
  onClick: () => void;
}

export default function PaystackButton({ loading, canPay, paystackReady, total, onClick }: PaystackButtonProps) {
  return (
    <button
      type="button"
      className={`w-full py-4 px-6 rounded-xl text-lg md:text-xl font-bold transition-all duration-200 ${
        canPay && !loading && paystackReady
          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      disabled={!canPay || loading || !paystackReady}
      onClick={onClick}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing Payment...
        </div>
      ) : !paystackReady ? (
        'Loading payment system...'
      ) : (
        `Pay Now - ₦${total.toLocaleString()}`
      )}
    </button>
  );
}
