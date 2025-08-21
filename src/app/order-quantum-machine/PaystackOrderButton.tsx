"use client";
import dynamic from 'next/dynamic';
import { FaCheckCircle } from 'react-icons/fa';
const PaystackButton = dynamic(() => import('./PaystackButton'), { ssr: false });

type Props = {
  form: {
    name: string;
    phone: string;
    email: string;
    whatsapp: string;
    street: string;
    area: string;
    region?: string;
    country?: string;
    postalCode?: string;
    lagosArea?: string;
    landmark: string;
    paymentOption: string;
    paymentMethod: string;
    deliveryPref: string;
    specialRequests: string;
    pickupLocation?: string;
  };
  loading: boolean;
  setLoading: (b: boolean) => void;
};

export default function PaystackOrderButton({ form, loading, setLoading }: Props) {
  const paystackConfig = {
    email: form.email || 'test@example.com',
    amount: form.paymentOption === 'plan' ? 400000 * 100 : 900000 * 100, // kobo
    metadata: {
      custom_fields: [
        { display_name: 'Full Name', variable_name: 'name', value: form.name },
        { display_name: 'Phone', variable_name: 'phone', value: form.phone },
        { display_name: 'Street', variable_name: 'street', value: form.street },
        { display_name: 'City / Town', variable_name: 'area', value: form.area },
        { display_name: 'State / Province / Region', variable_name: 'region', value: form.region || '' },
        { display_name: 'Country', variable_name: 'country', value: form.country || '' },
        { display_name: 'Postal Code', variable_name: 'postalCode', value: form.postalCode || '' },
        { display_name: 'Landmark', variable_name: 'landmark', value: form.landmark },
        { display_name: 'Payment Option', variable_name: 'paymentOption', value: form.paymentOption },
        { display_name: 'Payment Method', variable_name: 'paymentMethod', value: form.paymentMethod },
        { display_name: 'Delivery Pref', variable_name: 'deliveryPref', value: form.deliveryPref },
        { display_name: 'Pickup Location', variable_name: 'pickupLocation', value: form.pickupLocation || '' },
        { display_name: 'Special Requests', variable_name: 'specialRequests', value: form.specialRequests },
      ],
    },
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        onSuccess: () => {
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/thank-you-premium';
      }
    },
    onClose: () => setLoading(false),
    disabled: loading,
  };

  return (
    <PaystackButton
      {...paystackConfig}
      className="w-full md:w-auto bg-transparent p-0 border-0 shadow-none mt-4"
      disabled={loading}
    >
      <span className="inline-flex items-center justify-center px-10 py-5 text-xl font-extrabold rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white shadow-2xl hover:scale-105 hover:shadow-amber-400/40 transition-transform duration-200 drop-shadow-lg font-sans w-full md:w-auto select-none">
        <FaCheckCircle className="mr-2 text-white/90" />
        {loading ? 'Processing...' : 'Secure My Quantum Machine Now'}
      </span>
    </PaystackButton>
  );
}
