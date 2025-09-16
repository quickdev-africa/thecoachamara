
import React from 'react';
import { usePaystack } from '../../hooks/usePaystack';
import PaystackButton from '../../components/PaystackButton';

interface PaystackOrderButtonProps {
	form: any;
	loading: boolean;
	setLoading: (loading: boolean) => void;
	cartSessionId: string;
	total: number;
	subtotal: number;
	shipping: number;
	quantity: number;
	canPay: boolean;
	paystackReady: boolean;
	products: any[];
}

const PaystackOrderButton: React.FC<PaystackOrderButtonProps> = ({
	form,
	loading,
	setLoading,
	cartSessionId,
	total,
	subtotal,
	shipping,
	quantity,
	canPay,
	paystackReady,
	products
}) => {
	const { handlePayment } = usePaystack({
		form,
		loading,
		setLoading,
		cartSessionId,
		total,
		subtotal,
		shipping,
		quantity,
		products
	});

	return (
		<PaystackButton
			loading={loading}
			canPay={canPay}
			paystackReady={paystackReady}
			total={total}
			onClick={handlePayment}
		/>
	);
};

export default PaystackOrderButton;