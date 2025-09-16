"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { ApiResponse, Product, Order } from "@/lib/types";
import CopyIcon from '@/components/CopyIcon';
import Tooltip from '@/components/Tooltip';

// SWR fetcher for our APIs
const fetcher = async (url: string): Promise<ApiResponse<any>> => {
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  return response.json();
};

export default function AdminDashboard() {

  const { data: session, status } = useSession();
  const router = useRouter();

  // Debug log for session and status
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[AdminDashboard] Session:", session, "Status:", status);
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router, session]);

  // Fetch orders and products from our new backend APIs
  // Disable automatic refresh to avoid short-interval page refreshes; rely on realtime or visibility-triggered fetches
  const { data: ordersResponse, error: ordersError, isLoading: ordersLoading } = useSWR<ApiResponse<Order[]>>("/api/orders", fetcher, { refreshInterval: 0, revalidateOnFocus: true });
  const { data: productsResponse, error: productsError, isLoading: productsLoading } = useSWR<ApiResponse<Product[]>>("/api/products", fetcher, { refreshInterval: 0, revalidateOnFocus: true });

  const [ordersLastUpdated, setOrdersLastUpdated] = useState<number | null>(null);
  const [productsLastUpdated, setProductsLastUpdated] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (fullId: string) => {
    try {
      await navigator.clipboard.writeText(fullId);
      setCopiedId(fullId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  // Extract data from API responses
  const orders = ordersResponse?.data || [];
  const products = productsResponse?.data || [];

  // Product management has been moved to the full product manager page.
  // Use the dedicated product manager at /admin/products

  // do not return early here; render after hooks are registered to avoid hooks order mismatch

  // Calculate sales summary (use total/amount from any common field)
  let todayTotal = 0, weekTotal = 0, monthTotal = 0;
  const extractTotal = (o: any) => {
    if (!o) return 0;
    return Number(o.total ?? o.amount ?? o.order_total ?? o.total_price ?? 0) || 0;
  };
  if (orders && Array.isArray(orders)) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const month = now.toISOString().slice(0, 7);
    orders.forEach((order: any) => {
      const created = (order.createdAt || order.created_at || order.created || '').toString().slice(0, 10);
      const amount = extractTotal(order);
      if (created === today) todayTotal += amount;
      if (created && created >= weekStartStr) weekTotal += amount;
      if (created?.startsWith(month)) monthTotal += amount;
    });
  }

  // update last-updated timestamps when SWR responses change
  useEffect(() => {
    if (ordersResponse) setOrdersLastUpdated(Date.now());
  }, [ordersResponse]);
  useEffect(() => {
    if (productsResponse) setProductsLastUpdated(Date.now());
  }, [productsResponse]);

  function timeAgo(ts: number | null) {
    if (!ts) return '-';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  // show loading state after hooks are registered
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full bg-white py-6 px-4 shadow-md flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200">
        <h1 className="text-2xl font-normal text-black">Admin Dashboard</h1>
        <div className="flex gap-4 mt-4 md:mt-0">
          <span className="text-black font-normal">Welcome, {session?.user?.name || "Admin"}!</span>
          <button
            className="py-2 px-4 bg-gray-900 hover:bg-black text-white font-normal rounded-lg transition duration-200"
            onClick={() => signOut({ callbackUrl: "/signin" })}
          >
            Sign Out
          </button>
        </div>
      </div>
      <main className="flex-1 p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto w-full bg-white">
        {/* Notifications moved to the top for higher visibility */}
        <section className="col-span-1 md:col-span-3 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-normal text-black mb-2">Notifications</h2>
          <ul className="text-sm text-gray-800">
            <li>No new notifications</li>
          </ul>
        </section>
        {/* Sales Summary Widget */}
        <section className="col-span-1 md:col-span-2 bg-white rounded-lg shadow p-6 flex flex-col justify-between">
          <h2 className="text-lg font-normal text-gray-900 mb-2">Sales Summary</h2>
          {ordersLoading ? (
            <div className="text-blue_gray-500">Loading...</div>
          ) : ordersError ? (
            <div className="text-red-500">Failed to load sales data</div>
          ) : (
            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[120px]">
                <div className="text-2xl font-normal text-gray-900">₦{todayTotal.toLocaleString()}</div>
                <div className="text-sm text-gray-700">Today</div>
              </div>
              <div className="flex-1 min-w-[120px]">
                <div className="text-2xl font-normal text-gray-900">₦{weekTotal.toLocaleString()}</div>
                <div className="text-sm text-gray-700">This Week</div>
              </div>
              <div className="flex-1 min-w-[120px]">
                <div className="text-2xl font-normal text-gray-900">₦{monthTotal.toLocaleString()}</div>
                <div className="text-sm text-gray-700">This Month</div>
              </div>
            </div>
          )}
        </section>


        {/* Inventory Alerts Widget */}
        <section className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-lg font-normal text-black mb-2">Inventory Alerts</h2>
          {productsLoading ? (
            <div className="text-blue_gray-500">Loading...</div>
          ) : productsError ? (
            <div className="text-red-500">Failed to load products</div>
          ) : (
            <ul className="text-blue_gray-600 text-sm">
              {products && products.length > 0 ? (
                products.filter((p: unknown) => typeof p === 'object' && p !== null && typeof (p as { stock?: number }).stock === 'number' && (p as { stock: number }).stock === 0).length > 0 ? (
                  products.filter((p: unknown) => typeof p === 'object' && p !== null && typeof (p as { stock?: number }).stock === 'number' && (p as { stock: number }).stock === 0).map((p: unknown) => {
                    const prod = p as { id: string; name: string; stock: number };
                    return (
                      <li key={prod.id} className="text-red-600 font-semibold">
                        {prod.name} — Only 0 left!
                      </li>
                    );
                  })
                ) : (
                  <li>No out of stock products 🎉</li>
                )
              ) : (
                  <li className="text-gray-700">No products found</li>
              )}
            </ul>
          )}
        </section>

        {/* Product Management moved to the full manager */}
        <section className="col-span-1 md:col-span-3 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-normal text-black">Product Management</h2>
            <div className="flex gap-2">
              <button className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => router.push('/admin/products')}>Open Full Product Manager</button>
            </div>
          </div>
          <p className="text-sm text-gray-600">The full product management surface is available at <span className="font-semibold">/admin/products</span>. Click the button to manage products, upload images, and edit metadata.</p>
        </section>

        {/* Recent Orders Widget */}
        <section className="col-span-1 md:col-span-2 bg-white rounded-lg shadow p-6 mt-0 md:mt-6">
          <h2 className="text-lg font-normal text-black mb-2">Recent Orders</h2>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">{ordersLoading ? 'Loading orders...' : `Showing ${orders?.length || 0}`}</div>
            <div className="text-xs text-gray-500">Last updated: {timeAgo(ordersLastUpdated)}</div>
          </div>
          {ordersLoading ? (
            <div className="text-blue_gray-500">Loading...</div>
          ) : ordersError ? (
            <div className="text-red-500">Failed to load orders</div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-sm text-gray-900">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2">Order #</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order: any) => {
                    if (typeof order === 'object' && order !== null) {
                      const o = order as any;
                      const customer = o.customerName || o.customer_name || o.customer || '-';
                      const amountVal = extractTotal(o);
                      const shortId = (o.id || '').replace(/-/g, '').slice(-5).toUpperCase();
                      return (
                        <tr key={o.id} className="border-b last:border-0">
                          <td className="py-2 text-gray-900">
                            <a
                              role="link"
                              className="font-mono text-sm text-blue-700 underline"
                              onClick={() => router.push(`/admin/orders?openOrder=${encodeURIComponent(o.id)}`)}
                            >{shortId}</a>
                            <Tooltip tip="Copy full ID">
                              <button
                                aria-label={`Copy full ID ${o.id}`}
                                className="inline-flex items-center gap-1 font-mono text-sm hover:underline focus:outline-none group ml-2"
                                onClick={() => copyToClipboard(o.id)}
                              >
                                <CopyIcon className="h-3 w-3" />
                              </button>
                            </Tooltip>
                            {copiedId === o.id && <span className="ml-2 text-xs text-green-700">Copied!</span>}
                          </td>
                          <td className="py-2 text-gray-900">{customer}</td>
                          <td className="py-2 text-gray-900">₦{amountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-2 text-gray-900">{o.status || '-'}</td>
                        </tr>
                      );
                    }
                    return null;
                  })
                ) : (
                  <tr>
                    <td className="py-2 text-gray-700" colSpan={4}>No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          )}
        </section>

        {/* Analytics Widget */}
        <section className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-lg font-normal text-black mb-2">Traffic Analytics</h2>
          <div className="text-gray-700 text-sm">No data yet</div>
        </section>


  {/* duplicate Notifications removed; kept top notifications for visibility */}
      </main>
  {/* Toasts are handled in the full product manager when needed */}
    </div>
  );
}
