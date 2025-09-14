"use client";
import { useEffect, useState } from "react";
import { supabase } from '../../../supabaseClient';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);
  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/customers?limit=${pageSize}&offset=${(page - 1) * pageSize}&sort=newest`);
      const data = await res.json();
      let arr: Customer[] = [];
      if (Array.isArray(data)) arr = data;
      else if (Array.isArray(data?.data)) arr = data.data;
      if (typeof data?.meta?.total === 'number') setTotal(data.meta.total);
      // normalize fields
      const normalized = arr.map((c: any) => ({
        id: c.id,
        name: c.name || c.full_name || c.customer_name,
        email: c.email,
        phone: c.phone || c.phone_number || c.mobile,
        joined_at: c.joined_at || c.joinedAt || c.created_at || null,
        orders_count: c.orders_count ?? c.ordersCount ?? 0,
        last_order_at: c.last_order_at || c.lastOrderAt || null,
        is_active: c.is_active !== false
      }));
      setCustomers(normalized as Customer[]);
    } catch (err) {
      setError("Failed to fetch customers");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  // Realtime: refresh the customers list when updates occur
  useEffect(() => {
    let mounted = true;
    const channel = supabase.channel('public:customers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, (payload: any) => {
        if (mounted) fetchCustomers();
      })
      .subscribe();
    return () => {
      mounted = false;
      try { supabase.removeChannel(channel); } catch (e) {}
    };
  }, []);

// Define the Customer type
type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joined_at?: string;
  orders_count?: number;
  last_order_at?: string;
  is_active?: boolean;
};



  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-black tracking-wide">Customer Management</h1>
      <div className="bg-baby_powder-900 rounded-xl shadow p-2 md:p-6 border border-blue_gray-100 overflow-x-auto">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div className="text-gray-900 text-base">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="text-gray-900 text-base">No customers found.</div>
        ) : (
          <>
            <table className="min-w-full text-left text-sm text-gray-900">
              <thead>
                <tr>
                  <th className="py-2 font-bold">Name</th>
                  <th className="py-2 font-bold">Email</th>
                  <th className="py-2 font-bold">Phone</th>
                  <th className="py-2 font-bold">Joined</th>
                  <th className="py-2 font-bold">Orders</th>
                  <th className="py-2 font-bold">Last Order</th>
                  <th className="py-2 font-bold">Status</th>
                  <th className="py-2 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id} className="border-t font-semibold">
                    <td className="py-2">
                      <button className="underline text-blue-700 hover:text-blue-900" onClick={() => setSelected(customer)}>{customer.name}</button>
                    </td>
                    <td className="py-2">
                      <button className="underline text-blue-700 hover:text-blue-900" onClick={() => setSelected(customer)}>{customer.email}</button>
                    </td>
                    <td className="py-2">{customer.phone || '-'}</td>
                    <td className="py-2">{customer.joined_at ? new Date(customer.joined_at).toLocaleDateString() : '-'}</td>
                    <td className="py-2">{customer.orders_count ?? 0}</td>
                    <td className="py-2">{customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString() : '-'}</td>
                    <td className="py-2">
                      {customer.is_active !== false ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Inactive</span>
                      )}
                    </td>
                    <td className="py-2">
                      <button className="underline text-blue-700 hover:text-blue-900" onClick={() => setSelected(customer)}>View</button>
                    </td>
                  </tr>
                ))}
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
          </>
        )}
      </div>
      {/* Customer Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2 sm:px-0">
          <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-black text-2xl font-bold"
              onClick={() => setSelected(null)}
              aria-label="Close customer details"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-black">Customer Details</h2>
            <div className="mb-2 text-gray-900 text-sm sm:text-base">
              <strong>Name:</strong> {selected.name}<br />
              <strong>Email:</strong> {selected.email}<br />
              <strong>Phone:</strong> {selected.phone || '-'}<br />
              <strong>Joined:</strong> {selected.joined_at ? new Date(selected.joined_at).toLocaleString() : '-'}<br />
              <strong>Status:</strong> {selected.is_active !== false ? 'Active' : 'Inactive'}<br />
              <strong>Orders:</strong> {selected.orders_count ?? 0}<br />
              <strong>Last Order:</strong> {selected.last_order_at ? new Date(selected.last_order_at).toLocaleString() : '-'}<br />
            </div>
            {/* Order History */}
            <div className="mb-4">
              <strong>Order History:</strong>
              {detailsLoading ? (
                <div className="text-gray-700 text-sm">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-gray-700 text-sm">No orders found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[400px] w-full text-left text-xs sm:text-sm text-gray-900 mt-2">
                    <thead>
                      <tr>
                        <th className="py-1 font-bold">Order ID</th>
                        <th className="py-1 font-bold">Date</th>
                        <th className="py-1 font-bold">Status</th>
                        <th className="py-1 font-bold">Total</th>
                        <th className="py-1 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order: any) => (
                        <tr key={order.id} className="border-t">
                          <td className="py-1">
                            <a href={`/admin/orders?search=${order.id}`} className="underline text-blue-700 hover:text-blue-900">{order.id}</a>
                          </td>
                          <td className="py-1">{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                          <td className="py-1 capitalize">{order.status}</td>
                          <td className="py-1">₦{order.total?.toLocaleString()}</td>
                          <td className="py-1">
                            <a href={`/admin/orders?search=${order.id}`} className="underline text-blue-700 hover:text-blue-900">View</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Payment History */}
            <div className="mb-2">
              <strong>Payment History:</strong>
              {detailsLoading ? (
                <div className="text-gray-700 text-sm">Loading payments...</div>
              ) : payments.length === 0 ? (
                <div className="text-gray-700 text-sm">No payments found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[400px] w-full text-left text-xs sm:text-sm text-gray-900 mt-2">
                    <thead>
                      <tr>
                        <th className="py-1 font-bold">Reference</th>
                        <th className="py-1 font-bold">Amount</th>
                        <th className="py-1 font-bold">Status</th>
                        <th className="py-1 font-bold">Date</th>
                        <th className="py-1 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((pay: any) => (
                        <tr key={pay.reference} className="border-t">
                          <td className="py-1">{pay.reference}</td>
                          <td className="py-1">₦{Number(pay.amount).toLocaleString()}</td>
                          <td className="py-1 capitalize">{pay.status}</td>
                          <td className="py-1">{pay.created_at ? new Date(pay.created_at).toLocaleDateString() : '-'}</td>
                          <td className="py-1">
                            <a href={`/admin/payments?search=${pay.reference}`} className="underline text-blue-700 hover:text-blue-900">View</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
