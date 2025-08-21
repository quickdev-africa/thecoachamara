"use client";
import { useQuery } from "@tanstack/react-query";


const fetchPayments = async () => {
  const response = await fetch("/api/payments");
  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }
  return response.json();
};


export default function PaymentsPage() {
  const { data: payments, error, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: fetchPayments,
  });

  if (isLoading) return <div>Loading payments...</div>;
  if (error) return <div className="text-red-600">Failed to load payments</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">Payment Management</h1>
      <p className="mb-4 text-gray-700">Here you can view and manage payment transactions.</p>
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        {payments && payments.length > 0 ? (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="py-2">Reference</th>
                <th className="py-2">Email</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Product ID</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: unknown) => {
                if (typeof p === 'object' && p !== null) {
                  const pay = p as { reference: string; email: string; amount: number; productId: string; status: string; createdAt?: string };
                  return (
                    <tr key={pay.reference} className="border-t">
                      <td className="py-2">{pay.reference}</td>
                      <td className="py-2">{pay.email}</td>
                      <td className="py-2">₦{Number(pay.amount).toLocaleString()}</td>
                      <td className="py-2">{pay.productId}</td>
                      <td className="py-2">{pay.status}</td>
                      <td className="py-2">{pay.createdAt ? new Date(pay.createdAt).toLocaleString() : "-"}</td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        ) : (
          <div>No payments found.</div>
        )}
      </div>
    </div>
  );
}
