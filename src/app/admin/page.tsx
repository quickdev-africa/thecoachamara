"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { ApiResponse, Product, Order } from "@/lib/types";

// SWR fetcher for our APIs
const fetcher = async (url: string): Promise<ApiResponse<any>> => {
  const response = await fetch(url);
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
  const { data: ordersResponse, error: ordersError, isLoading: ordersLoading } = useSWR<ApiResponse<Order[]>>("/api/orders", fetcher);
  const { data: productsResponse, error: productsError, isLoading: productsLoading } = useSWR<ApiResponse<Product[]>>("/api/products", fetcher);

  // Extract data from API responses
  const orders = ordersResponse?.data || [];
  const products = productsResponse?.data || [];

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  // Calculate sales summary
  let todayTotal = 0, weekTotal = 0, monthTotal = 0;
  if (orders && Array.isArray(orders)) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const month = now.toISOString().slice(0, 7);
    orders.forEach((order: unknown) => {
      if (typeof order === 'object' && order !== null) {
        const o = order as { createdAt?: string; amount?: number };
        const created = o.createdAt?.slice(0, 10);
        const amount = Number(o.amount) || 0;
        if (created === today) todayTotal += amount;
        if (created && created >= weekStartStr) weekTotal += amount;
        if (created?.startsWith(month)) monthTotal += amount;
      }
    });
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
        {/* Sales Summary Widget */}
        <section className="col-span-1 md:col-span-2 bg-white rounded-lg shadow p-6 flex flex-col justify-between">
          <h2 className="text-lg font-normal text-black mb-2">Sales Summary</h2>
          {ordersLoading ? (
            <div className="text-blue_gray-500">Loading...</div>
          ) : ordersError ? (
            <div className="text-red-500">Failed to load sales data</div>
          ) : (
            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[120px]">
                <div className="text-2xl font-normal text-black">₦{todayTotal.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
              <div className="flex-1 min-w-[120px]">
                <div className="text-2xl font-normal text-black">₦{weekTotal.toLocaleString()}</div>
                <div className="text-sm text-gray-500">This Week</div>
              </div>
              <div className="flex-1 min-w-[120px]">
                <div className="text-2xl font-normal text-black">₦{monthTotal.toLocaleString()}</div>
                <div className="text-sm text-gray-500">This Month</div>
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

        {/* Recent Orders Widget */}
        <section className="col-span-1 md:col-span-2 bg-white rounded-lg shadow p-6 mt-0 md:mt-6">
          <h2 className="text-lg font-normal text-black mb-2">Recent Orders</h2>
          {ordersLoading ? (
            <div className="text-blue_gray-500">Loading...</div>
          ) : ordersError ? (
            <div className="text-red-500">Failed to load orders</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-blue_gray-500 border-b">
                  <th className="py-2">Order #</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order: unknown) => {
                    if (typeof order === 'object' && order !== null) {
                      const o = order as { id: string; customer?: string; amount?: number; status?: string };
                      return (
                        <tr key={o.id} className="border-b last:border-0">
                          <td className="py-2">{o.id.slice(-6).toUpperCase()}</td>
                          <td className="py-2">{o.customer || '-'}</td>
                          <td className="py-2">₦{Number(o.amount).toLocaleString()}</td>
                          <td className="py-2">{o.status || '-'}</td>
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
          )}
        </section>

        {/* Analytics Widget */}
        <section className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-lg font-normal text-black mb-2">Traffic Analytics</h2>
          <div className="text-gray-700 text-sm">No data yet</div>
        </section>


        {/* Notifications Widget */}
        <section className="bg-white rounded-lg shadow p-6 flex flex-col col-span-1 md:col-span-3">
          <h2 className="text-lg font-normal text-black mb-2">Notifications</h2>
          <ul className="text-blue_gray-600 text-sm">
            <li>No new notifications</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
