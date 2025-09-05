"use client"

import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { Input } from '@nextui-org/input';
import { toast } from 'react-toastify';



const schema = z.object({
    email: z.string().email("Invalid email address"),
    amount: z
        .number()
        .min(100, "Minimum amount is 100")
        .max(1000000, "Maximum amount is 1000000")
});
type FormData = z.infer<typeof schema>;

export default function PayStackPayment() {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
    const hostedCheckoutUrl = process.env.NEXT_PUBLIC_PAYSTACK_HOSTED_CHECKOUT || '';

    const [paystackAvailable, setPaystackAvailable] = useState<boolean | null>(null);

    useEffect(() => {
        // Detect whether the Paystack inline script has loaded
        if (typeof window === 'undefined') {
            setPaystackAvailable(false);
            return;
        }
        // window.PaystackPop is injected by https://js.paystack.co/v1/inline.js
        const available = !!(window as any).PaystackPop;
        setPaystackAvailable(available);
    }, []);

    if (!publicKey) {
        toast.error("PayStack public key is not set");
    }

    const { 
        register,
        handleSubmit,
        formState: { errors }, 
        reset, 
        watch } = useForm<FormData>({
            resolver: zodResolver(schema)
        });

        const email = watch('email');
        const amount = watch('amount');

        const paystackConfig = {
            email,
            amount: amount * 100,
            publicKey,
            currency: 'NGN',
            metadata: {
               custom_fields: [
                     {
                          display_name: 'Email',
                          variable_name: 'email',
                          value: email
                     },
                     {
                          display_name: 'Amount',
                          variable_name: 'amount',
                          value: amount
                     }
                ]

            },
            onSuccess: () => {
                toast.success('Payment successful');
                reset({
                    email: '',
                    amount: undefined
                });
            },
            onClose: () => {
                toast.error('Payment cancelled');
            },
            onError: () => {
                toast.error('Payment failed');
            }

        };

    // no react-paystack ref needed when using PaystackPop directly

    const openHosted = () => {
        const openUrl = async () => {
            let url = hostedCheckoutUrl;
            if (!url) {
                // call server to initialize hosted checkout
                try {
                    const resp = await fetch('/api/paystack/hosted', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: Math.round((amount || 0) * 100), email: email || '' })
                    });
                    const data = await resp.json();
                    if (resp.ok && data.url) url = data.url;
                    else throw new Error(data.error || 'no url');
                } catch (e: any) {
                    toast.error('Failed to create hosted checkout: ' + (e?.message || e));
                    return;
                }
            }
            // open hosted checkout in a new tab as a fallback
            const w = window.open(url, '_blank', 'noopener,noreferrer');
            if (!w) {
                toast.error('Popup blocked. Please allow popups for this site or copy the link: ' + url);
            }
        };
        openUrl();
    };

    const handlePayClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // quick test: try to open a small blank window to detect popup blockers
        let testWin: Window | null = null;
        try {
            testWin = window.open('', '_blank', 'width=100,height=100');
        } catch (err) {
            testWin = null;
        }

        if (!testWin) {
            // popup blocked -> fallback to hosted checkout
            openHosted();
            return;
        }

        // popup allowed: close test window and trigger Paystack flow
        try { testWin.close(); } catch (err) { /* ignore */ }

        // use PaystackPop directly
        const PaystackPop = (window as any).PaystackPop;
        if (PaystackPop) {
            try {
                const handler = PaystackPop.setup(paystackConfig);
                if (handler) {
                    try {
                        if (typeof handler.open === 'function') { handler.open(); return; }
                        if (typeof handler.openIframe === 'function') { try { handler.openIframe(); return; } catch (e) { /* continue to hosted fallback */ } }
                        if (typeof handler.newTransaction === 'function') { handler.newTransaction(); return; }
                    } catch (innerErr) {
                        // proceed to hosted fallback
                    }
                }
                // if we reach here nothing worked - fallback to hosted checkout
                openHosted();
                return;
            } catch (err) {
                openHosted();
                return;
            }
        }

        // nothing worked: fallback
        openHosted();
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className='w-full max-w-md shadow-xl bg-white p-6'>
                <CardHeader className='text-center py-6'>
                    <h2 className='text-2xl font-bold text-gray-800'>Pay with PayStack</h2>
                </CardHeader>
                <CardBody>
                    <div className='flex flex-col space-y-4 text-gray-600'>
                        <Input
                            {...register('email')}
                            label='Email Address'
                            type='email'
                            variant='faded'
                            size='lg'
                            isRequired
                        />
                        {errors.email && <p className='text-sm text-red-500'>{errors.email.message}</p>}
                        <Input
                            {...register('amount')}
                            label='Amount (NGN)'
                            type='number'
                            variant='faded'
                            size='lg'
                            isRequired
                        />
                        {errors.amount && <p className='text-sm text-red-500'>{errors.amount.message}</p>}
                   {paystackAvailable === false && (
                       <div className="p-4 border border-yellow-300 bg-yellow-50 rounded">
                           <p className="text-sm text-yellow-800">Paystack inline checkout appears to be blocked or unavailable in this browser.</p>
                           <p className="text-xs text-yellow-700 mt-2">Try disabling adblock/privacy extensions, use an incognito window, or try another network. As a fallback you can open the hosted checkout.</p>
                           <div className="mt-3 flex space-x-2">
                               <button onClick={openHosted} className="bg-blue-600 text-white py-2 px-3 rounded">Open hosted checkout</button>
                               <button onClick={() => { navigator.clipboard?.writeText(hostedCheckoutUrl || ''); toast.info('Hosted checkout URL copied'); }} className="bg-gray-200 text-gray-800 py-2 px-3 rounded">Copy link</button>
                           </div>
                       </div>
                   )}

                   {paystackAvailable !== false && email && amount !== undefined && (
                       <button onClick={handlePayClick} className='bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200'>
                               Pay Now
                           </button>
                   )}
                    </div>
                </CardBody>
            </Card>

        </div>
    )
}
