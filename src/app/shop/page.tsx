"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const PaystackButton = dynamic(() => import("react-paystack").then(mod => mod.PaystackButton), { ssr: false });

export default function ShopPage() {
  // Example product for demo
  const [product] = useState({
    name: "Sample Product",
    price: 5000, // in Naira
    id: "demo1",
  });
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email,
    amount: product.price * 100, // Paystack expects kobo
    publicKey,
    metadata: {
      productId: product.id,
      productName: product.name,
      custom_fields: [
        { display_name: "Product ID", variable_name: "product_id", value: product.id },
        { display_name: "Product Name", variable_name: "product_name", value: product.name },
        { display_name: "Customer Email", variable_name: "customer_email", value: email },
      ],
    },
  };

  const handleSuccess = async (ref: unknown) => {
    setSuccess(true);
    setError("");
    // Save transaction to backend
    // Type guard for ref
    const reference = typeof ref === 'object' && ref && 'reference' in ref ? (ref as { reference: string }).reference : undefined;
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        email,
        amount: product.price,
        productId: product.id,
        status: "success",
      }),
    });
  };

  const handleClose = () => {
    setError("Payment was not completed.");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Shop</h1>
      <div className="mb-4">
        <div className="font-semibold">{product.name}</div>
        <div className="text-sunglow-700 font-bold">₦{product.price.toLocaleString()}</div>
      </div>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border rounded px-3 py-2 w-full mb-4"
        required
      />
      <PaystackButton
        {...paystackConfig}
        text="Pay Now"
        onSuccess={handleSuccess}
        onClose={handleClose}
        className="bg-sunglow-600 hover:bg-sunglow-700 text-white font-bold rounded px-4 py-2 w-full"
        disabled={!email}
      />
      {success && <div className="text-green-600 mt-4">Payment successful!</div>}
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
}
