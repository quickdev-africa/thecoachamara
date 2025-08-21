import dynamic from 'next/dynamic';

// Dynamically import PaystackButton for SSR safety
const PaystackButton = dynamic(() => import('react-paystack').then(mod => mod.PaystackButton), { ssr: false });

export default PaystackButton;
