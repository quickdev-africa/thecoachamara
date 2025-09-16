"use client";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '../../../supabaseClient';

function normalizePayment(p: any) {
  if (!p) return p;
  return {
  reference: p.reference || p.ref || p.payment_reference || p.paymentReference || null,
  order_id: p.order_id || p.orderId || p.order_id || (p.orders && p.orders.id) || null,
  email: p.email || p.customer_email || p.customerEmail || p.paystack_data?.customer?.email || p.orders?.customerEmail || null,
  amount: p.amount ?? p.total ?? p.value ?? (p.amount_paid || null) ?? 0,
  method: p.method || p.payment_method || p.gateway || p.payment_provider || null,
  status: p.status || p.state || null,
  created_at: p.created_at || p.createdAt || p.created || p.initiated_at || null,
  metadata: p.metadata || p.paystack_data || p.meta || null,
    // keep original for debugging
    __raw: p
  };
}

const fetchPayments = async (params: Record<string, string>) => {
  const url = new URL("/api/payments", window.location.origin);
  Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to fetch payments");
  const data = await response.json();
  return Array.isArray(data.data) ? data.data : data;
};

export default function PaymentsPage() {
  const [filter, setFilter] = useState({ status: "", email: "" });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);

  const { data: payments = [], error, isLoading, refetch } = useQuery({
    queryKey: ["payments", filter, search, page],
    queryFn: async () => {
      const data = await fetchPayments({ ...filter, email: search, limit: String(pageSize), offset: String((page - 1) * pageSize) });
      if ((data as any)?.meta?.total != null) setTotal((data as any).meta.total);
      return (data as any)?.data || data;
    },
  });

  // normalize fetched payments when the query updates
  useEffect(() => {
    if (Array.isArray(payments) && payments.length > 0) {
      try {
        // mutate in place for local consumption: map to normalized shape
      } catch (e) {}
    }
  }, [payments]);

  // Realtime subscription: update payments list when backend writes occur
  useEffect(() => {
    let mounted = true;
    const channel = supabase.channel('public:payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, payload => {
        try {
          // simple strategy: refetch list on any change
          if (mounted) refetch();
        } catch (e) {
          // ignore
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      try { supabase.removeChannel(channel); } catch (e) {}
    };
  }, [refetch]);

    const analytics = useMemo(() => {
    let total = 0, byStatus: Record<string, number> = {}, byMethod: Record<string, number> = {}, topCustomers: Record<string, number> = {};
    payments.forEach((raw: any) => {
      const p = normalizePayment(raw);
      total += Number(p.amount) || 0;
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      byMethod[p.method || "other"] = (byMethod[p.method || "other"] || 0) + 1;
      if (p.email) topCustomers[p.email] = (topCustomers[p.email] || 0) + 1;
    });
    const topCustomersArr = Object.entries(topCustomers).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { total, byStatus, byMethod, topCustomersArr };
  }, [payments]);

  return (
    <div className="px-1 sm:px-2 md:px-4">
      <h1 className="text-2xl font-bold mb-2 text-black">Payment Management</h1>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border">
          <div className="text-xs text-gray-700">Total Payments</div>
          <div className="text-xl font-bold text-green-700">₦{analytics.total.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border">
          <div className="text-xs text-gray-700">By Status</div>
          <ul className="text-sm text-gray-700">
            {Object.entries(analytics.byStatus).map(([status, count]) => (
              <li key={status}><span className="capitalize">{status}</span>: <span className="font-bold">{count}</span></li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border">
          <div className="text-xs text-gray-700">By Method</div>
          <ul className="text-sm text-gray-700">
            {Object.entries(analytics.byMethod).map(([method, count]) => (
              <li key={method}><span className="capitalize">{method}</span>: <span className="font-bold">{count}</span></li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border">
          <div className="text-xs text-gray-700">Top Customers</div>
          <ul className="text-sm text-gray-700">
            {analytics.topCustomersArr.map(([email, count]) => (
              <li key={email}>{email}: <span className="font-bold">{count}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-4">
        <input
          type="text"
          placeholder="Search by email, reference, or order ID"
          className="border rounded-lg px-3 py-2 text-gray-900 bg-white placeholder:text-gray-600 w-full sm:w-72"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded-lg px-3 py-2 text-gray-900 bg-white w-full sm:w-48"
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow p-2 sm:p-4 md:p-6 border border-blue_gray-100 overflow-x-auto">
        {isLoading ? (
          <div className="text-gray-900 text-base">Loading payments...</div>
        ) : error ? (
          <div className="text-red-600 mb-2">Failed to load payments</div>
        ) : payments.length === 0 ? (
          <div className="text-gray-700">No payments found.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[700px] w-full text-left text-sm text-gray-900">
              <thead>
                <tr>
                  <th className="py-2 font-bold">Reference</th>
                  <th className="py-2 font-bold">Order</th>
                  <th className="py-2 font-bold">Customer</th>
                  <th className="py-2 font-bold">Amount</th>
                  <th className="py-2 font-bold">Method</th>
                  <th className="py-2 font-bold">Status</th>
                  <th className="py-2 font-bold">Date</th>
                  <th className="py-2 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((rawPay: any) => {
                  const pay = normalizePayment(rawPay);
                  return (
                  <tr key={pay.reference} className="border-t">
                    <td className="py-2">{pay.reference}</td>
                    <td className="py-2">
                      {pay.order_id ? (
                        <a href={`/admin/orders?search=${pay.order_id}`} className="underline text-blue-700 hover:text-blue-900" title="View order">{pay.order_id}</a>
                      ) : "-"}
                    </td>
                    <td className="py-2">
                      {pay.email ? (
                        <a href={`/admin/customers?search=${pay.email}`} className="underline text-blue-700 hover:text-blue-900" title="View customer">{pay.email}</a>
                      ) : "-"}
                    </td>
                    <td className="py-2">₦{Number(pay.amount).toLocaleString()}</td>
                    <td className="py-2">{pay.method || "-"}</td>
                    <td className="py-2 capitalize">{pay.status}</td>
                    <td className="py-2">{pay.created_at ? new Date(pay.created_at).toLocaleString() : "-"}</td>
                    <td className="py-2">
                      <button className="underline text-blue-700 hover:text-blue-900" onClick={() => setSelected(pay)}>View</button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mt-3">
              <button
                className="px-3 py-1 rounded border bg-white text-gray-900 disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="text-sm">Page {page} of {Math.ceil(total / pageSize) || 1}</span>
              <button
                className="px-3 py-1 rounded border bg-white text-gray-900 disabled:opacity-50"
                disabled={page * pageSize >= total}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2 sm:px-0">
          <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6 w-full max-w-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-black text-2xl font-bold"
              onClick={() => setSelected(null)}
              aria-label="Close payment details"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-black">Payment Details</h2>
            <div className="mb-2 text-gray-900 text-sm sm:text-base">
              <strong>Reference:</strong> {selected.reference}<br />
              <strong>Order:</strong> {selected.order_id ? (
                <a href={`/admin/orders?search=${selected.order_id}`} className="underline text-blue-700 hover:text-blue-900">{selected.order_id}</a>
              ) : "-"}<br />
              <strong>Customer:</strong> {selected.email ? (
                <a href={`/admin/customers?search=${selected.email}`} className="underline text-blue-700 hover:text-blue-900">{selected.email}</a>
              ) : "-"}<br />
              <strong>Amount:</strong> ₦{Number(selected.amount).toLocaleString()}<br />
              <strong>Method:</strong> {selected.method || "-"}<br />
              <strong>Status:</strong> <span className="capitalize">{selected.status}</span><br />
              <strong>Date:</strong> {selected.created_at ? new Date(selected.created_at).toLocaleString() : "-"}<br />
              {selected.metadata && (
                <>
                  <strong>Metadata:</strong> <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(selected.metadata, null, 2)}</pre>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
