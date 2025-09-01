"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from '../../../supabaseClient';
import { Order, OrderStatus, PaymentStatus } from "@/lib/types";

// Helper to normalize snake_case DB rows to camelCase expected by the UI
function normalizeDelivery(del: any) {
  if (!del) return null;
  const shipping = del.shipping_address || del.shippingAddress || null;
  const pickup = del.pickup_location || del.pickupLocation || null;
  // shipping may be an object or a simple string captured from a payment form
  const normalizedShipping = shipping
    ? (typeof shipping === 'string'
        ? { street: shipping }
        : {
            street: shipping.street || shipping.street_address || shipping.street_address_line || shipping.address || null,
            city: shipping.city || shipping.town || null,
            state: shipping.state || shipping.region || null,
            country: shipping.country || null,
            postalCode: shipping.postal_code || shipping.postalCode || null,
            landmark: shipping.landmark || null,
          })
    : null;
  return {
    method: del.delivery_method || del.method || del.deliveryMethod || null,
    pickupLocation: pickup || del.pickupLocation || null,
    shippingAddress: normalizedShipping,
    ...del,
  };
}

function normalizeOrder(o: any): any {
  if (!o) return o;
  // prefer nested delivery JSON but fall back to top-level delivery columns
  const topLevelDelivery = {
    method: o.deliveryMethod || o.delivery_method || null,
    shippingAddress: o.shippingAddress || o.shipping_address || null,
    pickupLocation: o.pickupLocation || o.pickup_location || null,
    state: o.shippingState || o.shipping_state || null,
  };
  return {
    ...o,
    id: o.id || o.order_id || o.orderId,
    order_number: o.order_number || o.orderNumber || o.orderNumber,
    customerName: o.customer_name || o.customerName || o.customer || null,
    customerEmail: o.customer_email || o.customerEmail || o.customer_email_address || null,
    customerPhone: o.customer_phone || o.customerPhone || o.phone || null,
    createdAt: o.created_at || o.createdAt || o.created || null,
    updatedAt: o.updated_at || o.updatedAt || o.updated || null,
    deliveryFee: o.delivery_fee ?? o.deliveryFee ?? 0,
    delivery: normalizeDelivery(o.delivery || o.delivery_info || topLevelDelivery || {}),
    // Normalize items coming either from client payload (items) or DB (order_items)
    items: (function() {
      const orderItems = o.order_items;
      const clientItems = o.items;
      if (Array.isArray(orderItems) && orderItems.length > 0) {
        return orderItems.map((it: any) => ({
          id: it.id || it.order_item_id || null,
          productId: it.product_id || it.productId || (it.products && it.products.id) || null,
          productName: it.product_name || it.productName || it.products?.name || (it.product_snapshot?.productName) || null,
          quantity: it.quantity ?? it.qty ?? (it.product_snapshot?.quantity) ?? 1,
          price: it.product_price ?? it.productPrice ?? it.unitPrice ?? it.products?.price ?? null,
          total: it.total_price ?? it.totalPrice ?? it.total ?? (it.product_snapshot?.totalPrice) ?? null,
          productSnapshot: it.product_snapshot || it.productSnapshot || null,
        }));
      }
      if (Array.isArray(clientItems) && clientItems.length > 0) {
        return clientItems.map((it: any) => ({
          id: it.id || it.productId || null,
          productId: it.productId || it.product_id || null,
          productName: it.productName || it.product_name || it.name || null,
          quantity: it.quantity ?? it.qty ?? 1,
          price: it.unitPrice ?? it.price ?? it.product_price ?? null,
          total: it.totalPrice ?? it.total ?? ( (it.unitPrice ?? it.price) * (it.quantity ?? 1) ),
          productSnapshot: it.productSnapshot || it.product_snapshot || null,
        }));
      }
      return [];
    })(),
    metadata: o.metadata || o.meta || o.metadata || null,
  };
}

// Build a concise delivery summary for table rows and small UI
function formatDeliverySummary(o: any) {
  if (!o) return '-';
  const so: any = o;
  // prefer explicit nested delivery object, otherwise check for top-level delivery fields on the order
  const d = so.delivery || so.delivery_info || so || {};
  const method = (d.method || so.deliveryMethod || so.delivery_method || d.delivery_method || '').toString().toLowerCase();
  if (!method) return '-';
  if (method === 'pickup' || method.includes('pick')) {
    const loc = d.pickupLocation || so.pickupLocation || so.pickup_location || d.pickup_location || d.location || '-';
    return (<span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">Pickup — {loc || '-'}</span>);
  }
  if (method === 'shipping' || method === 'ship' || method.includes('ship') || method.includes('deliver')) {
    const addr = d.shippingAddress || so.shippingAddress || so.shipping_address || d.shipping_address || {};
    if (typeof addr === 'string') {
      return (<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">Shipping — {addr}</span>);
    }
    const street = addr.street || addr.street_address || addr.address || addr.line1 || '';
    const city = addr.city || addr.town || '';
    const state = addr.state || addr.region || addr.shipping_state || '';
    const parts = [street, city, state].filter(Boolean);
    return (<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">Shipping — {parts.join(', ') || '-'}</span>);
  }
  return String(method);
}

export default function OrdersAdminPage() {
  // Bulk status update handler
  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrderIds.length === 0) return;
    setBulkLoading(true);
    setBulkMsg("");
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedOrderIds, status: bulkStatus }),
      });
      const data = await res.json();
      if (!data.success) setBulkMsg(data.error || "Bulk update failed");
      else {
        setBulkMsg("Bulk status updated");
        setSelectedOrderIds([]);
        fetchOrders();
      }
    } catch {
      setBulkMsg("Bulk update failed");
    }
    setBulkLoading(false);
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState("");
  const [filter, setFilter] = useState({ status: "", customer: "" });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Analytics useMemo after orders state
  const analytics = useMemo(() => {
    let totalSales = 0;
    let statusCounts: Record<string, number> = {};
    let topCustomers: Record<string, number> = {};
    let topProducts: Record<string, number> = {};
    orders.forEach((order: Order) => {
      totalSales += order.total || 0;
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      if (order.customerName) topCustomers[order.customerName] = (topCustomers[order.customerName] || 0) + 1;
      order.items?.forEach((item: any) => {
        if (item.productName) topProducts[item.productName] = (topProducts[item.productName] || 0) + item.quantity;
      });
    });
    // Sort top customers/products
    const topCustomersArr: [string, number][] = Object.entries(topCustomers).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const topProductsArr: [string, number][] = Object.entries(topProducts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { totalSales, statusCounts, topCustomersArr, topProductsArr };
  }, [orders]);
  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    setUpdateError("");
    try {
      const res = await fetch(`/api/orders`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status }),
      });
      const data = await res.json();
      if (!data.success) setUpdateError(data.error || "Failed to update status");
      else fetchOrders();
    } catch {
      setUpdateError("Failed to update status");
    }
    setUpdating(false);
  };

  // Update payment status
  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    setUpdating(true);
    setUpdateError("");
    try {
      const res = await fetch(`/api/orders`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, paymentStatus }),
      });
      const data = await res.json();
      if (!data.success) setUpdateError(data.error || "Failed to update payment status");
      else fetchOrders();
    } catch {
      setUpdateError("Failed to update payment status");
    }
    setUpdating(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
  let url = `/api/orders?limit=${pageSize}&offset=${(page - 1) * pageSize}`;
      const params = [];
      if (filter.status) params.push(`status=${filter.status}`);
      if (params.length) url += `&${params.join("&")}`;
      const res = await fetch(url);
      const data = await res.json();
  let arr: any[] = [];
  if (Array.isArray(data)) arr = data;
  else if (Array.isArray(data?.data)) arr = data.data;
  // normalize snake_case -> camelCase for UI
  const normalized = arr.map(normalizeOrder);
  setOrders(normalized);
  setTotalOrders(data?.meta?.total || arr.length);
      // Client-side filter by customer
      if (filter.customer) {
        const filtered = normalized.filter(o =>
          (o.customerName || o.customerEmail || '').toString().toLowerCase().includes(filter.customer.toLowerCase()) ||
          (o.customerEmail || '').toString().toLowerCase().includes(filter.customer.toLowerCase()) ||
          (o.customerPhone || '').toString().includes(filter.customer)
        );
        setOrders(filtered);
      }
    } catch (err) {
      setError("Failed to fetch orders");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedOrderIds.length === 0) return;
    if (!confirm(`Delete ${selectedOrderIds.length} selected order(s)? This cannot be undone.`)) return;
    try {
      const ids = selectedOrderIds.join(',');
      const res = await fetch(`/api/orders?ids=${encodeURIComponent(ids)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data?.success) {
        setSelectedOrderIds([]);
        fetchOrders();
      } else {
        alert(data?.error || 'Failed to delete orders');
      }
    } catch (e) {
      alert('Failed to delete orders');
    }
  };

  // Realtime subscription to refresh orders when changes occur
  useEffect(() => {
    let mounted = true;
    const channel = supabase.channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload: any) => {
        if (mounted) fetchOrders();
      })
      .subscribe();
    return () => {
      mounted = false;
      try { supabase.removeChannel(channel); } catch (e) {}
    };
  }, []);

  // Fetch order status history when modal opens
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedOrder) return setOrderHistory([]);
      const res = await fetch(`/api/orders/history?orderId=${selectedOrder.id}`);
      const data = await res.json();
      setOrderHistory(Array.isArray(data?.data) ? data.data : []);
    };
    fetchHistory();
  }, [selectedOrder]);

  return (
    <div className="px-1 sm:px-2 md:px-4">
      <h1 className="text-2xl font-bold mb-2 text-black">Order Management</h1>
      {/* Analytics Summary */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border">
          <div className="text-xs text-gray-500">Total Sales</div>
          <div className="text-xl font-bold text-green-700">₦{analytics.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border">
          <div className="text-xs text-gray-500">Orders by Status</div>
          <ul className="text-sm">
            {Object.entries(analytics.statusCounts).map(([status, count]: [string, number]) => (
              <li key={status}><span className="capitalize">{status}</span>: <span className="font-bold">{count}</span></li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border">
          <div className="text-xs text-gray-500">Top Customers</div>
          <ul className="text-sm">
            {analytics.topCustomersArr.map(([name, count]: [string, number]) => (
              <li key={name}>{name}: <span className="font-bold">{count}</span></li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border">
          <div className="text-xs text-gray-500">Top Products</div>
          <ul className="text-sm">
            {analytics.topProductsArr.map(([name, count]: [string, number]) => (
              <li key={name}>{name}: <span className="font-bold">{count}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-4">
        <input
          type="text"
          placeholder="Search by customer name, email, or phone"
          className="border rounded-lg px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400 w-full sm:w-72"
          value={filter.customer}
          onChange={e => setFilter(f => ({ ...f, customer: e.target.value }))}
        />
        <select
          className="border rounded-lg px-3 py-2 text-gray-900 bg-white w-full sm:w-48"
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow p-2 sm:p-4 md:p-6 border border-blue_gray-100 overflow-x-auto">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div className="text-gray-900 text-base">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-900 text-base">No orders found.</div>
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault();
              handleBulkStatusUpdate();
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={selectedOrderIds.length === orders.length && orders.length > 0}
                onChange={e => setSelectedOrderIds(e.target.checked ? orders.map(o => o.id) : [])}
              />
              <span className="text-sm">Select All</span>
              <select
                className="border rounded px-2 py-1 text-xs"
                value={bulkStatus}
                onChange={e => setBulkStatus(e.target.value)}
                disabled={bulkLoading}
              >
                <option value="">Bulk Status Update</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                type="submit"
                className="px-2 py-1 rounded bg-sunglow-400 text-black border border-sunglow-400 text-xs font-bold disabled:opacity-50"
                disabled={bulkLoading || !bulkStatus || selectedOrderIds.length === 0}
              >
                {bulkLoading ? "Updating..." : "Apply"}
              </button>
              <button
                type="button"
                className="px-2 py-1 rounded bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-50"
                onClick={handleBulkDelete}
                disabled={selectedOrderIds.length === 0}
              >
                Delete
              </button>
              {bulkMsg && <span className="ml-2 text-xs text-green-700">{bulkMsg}</span>}
            </div>
            <div className="w-full overflow-x-auto">
              <table className="min-w-[700px] w-full text-left text-sm text-gray-900">
              <thead>
                <tr>
                  <th className="py-2 font-bold"></th>
                  <th className="py-2 font-bold">Order ID</th>
                  <th className="py-2 font-bold">Date</th>
                  <th className="py-2 font-bold">Customer</th>
                  <th className="py-2 font-bold">Phone</th>
                  <th className="py-2 font-bold">Total</th>
                  <th className="py-2 font-bold">Delivery</th>
                  <th className="py-2 font-bold">Products</th>
                  <th className="py-2 font-bold">Status</th>
                  <th className="py-2 font-bold">Payment</th>
                  <th className="py-2 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-t font-semibold">
                    <td className="py-2">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={e => {
                          setSelectedOrderIds(ids =>
                            e.target.checked
                              ? [...ids, order.id]
                              : ids.filter(id => id !== order.id)
                          );
                        }}
                      />
                    </td>
                    <td className="py-2">{order.id}</td>
                    <td className="py-2">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="py-2">
                      <a
                        href={`/admin/customers?search=${encodeURIComponent(order.customerEmail || order.customerName)}`}
                        className="underline text-blue-700 hover:text-blue-900"
                        title="View customer profile"
                      >
                        {order.customerName}
                      </a>
                    </td>
                    <td className="py-2">{order.customerPhone}</td>
                    <td className="py-2">₦{order.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-2">{formatDeliverySummary(order)}</td>
                    <td className="py-2 text-sm text-gray-700">{(order as any).productNames || (order.items?.map((i:any)=>i.productName).join(', ') || '-')}</td>
                    <td className="py-2">
                      <select
                        className="px-2 py-1 rounded text-xs font-bold border"
                        value={order.status}
                        disabled={updating}
                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                        style={{
                          backgroundColor: order.status === 'delivered' ? '#dcfce7' : order.status === 'shipped' ? '#fef9c3' : order.status === 'cancelled' ? '#fee2e2' : '#f3f4f6',
                          color: order.status === 'delivered' ? '#166534' : order.status === 'shipped' ? '#92400e' : order.status === 'cancelled' ? '#991b1b' : '#334155',
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <select
                        className="px-2 py-1 rounded text-xs font-bold border"
                        value={order.paymentStatus}
                        disabled={updating}
                        onChange={e => updatePaymentStatus(order.id, e.target.value)}
                        style={{
                          backgroundColor: order.paymentStatus === 'completed' ? '#dcfce7' : order.paymentStatus === 'pending' ? '#fef9c3' : order.paymentStatus === 'failed' ? '#fee2e2' : '#f3f4f6',
                          color: order.paymentStatus === 'completed' ? '#166534' : order.paymentStatus === 'pending' ? '#92400e' : order.paymentStatus === 'failed' ? '#991b1b' : '#334155',
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
    {updateError && <div className="text-red-600 mt-2">{updateError}</div>}
                    <td className="py-2">
                      <button
                        className="underline text-blue-700 hover:text-blue-900"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </form>
        )}
      </div>
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2 sm:px-0">
          <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-black text-2xl font-bold"
              onClick={() => setSelectedOrder(null)}
              aria-label="Close order details"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-black">Order Details</h2>
            {/* Print/Download Invoice & Resend Notification */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mb-2">
              <button
                className="bg-sunglow-400 hover:bg-mustard-400 text-gray-900 font-bold rounded-lg px-4 py-2 shadow border border-sunglow-400 transition-colors duration-200"
                onClick={() => window.print()}
              >
                Print Invoice
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-lg px-4 py-2 shadow border border-blue-500 transition-colors duration-200"
                disabled={notifyLoading}
                onClick={async () => {
                  setNotifyLoading(true);
                  setNotifyMsg("");
                  const res = await fetch("/api/orders/notify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId: selectedOrder.id })
                  });
                  const data = await res.json();
                  setNotifyMsg(data?.message || data?.error || "");
                  setNotifyLoading(false);
                }}
              >
                {notifyLoading ? "Sending..." : "Resend Notification"}
              </button>
              {notifyMsg && <span className="ml-2 text-xs text-green-700">{notifyMsg}</span>}
            </div>
            <div className="mb-2 text-gray-900 text-sm sm:text-base">
              <strong>Order ID:</strong> {selectedOrder.id}<br />
              <strong>Date:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '-'}<br />
              <strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerEmail})<br />
              <strong>Phone:</strong> {selectedOrder.customerPhone}<br />
              <strong>Status:</strong> {selectedOrder.status}<br />
              <strong>Payment:</strong> {selectedOrder.paymentStatus}<br />
              <strong>Total:</strong> ₦{selectedOrder.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}<br />
              <strong>Delivery:</strong> {(() => {
                const so: any = selectedOrder as any;
                const d = (so.delivery || so.delivery_info || so || {}) as any;
                const method = d.method || so.deliveryMethod || so.delivery_method || d.delivery_method || null;
                if (!method) return '-';
                const m = method.toString().toLowerCase();
                if (m === 'pickup') {
                  const loc = d.pickupLocation || so.pickupLocation || so.pickup_location || d.pickup_location || d.location || '-';
                  return `Pickup — ${loc || '-'}`;
                }
                if (m === 'shipping' || m === 'ship' || m === 'delivery') {
                  const addr = d.shippingAddress || so.shippingAddress || so.shipping_address || d.shipping_address || {};
                  if (typeof addr === 'string') return `Shipping — ${addr}`;
                  const street = addr.street || addr.street_address || addr.address || addr.line1 || '';
                  const city = addr.city || addr.town || '';
                  const state = addr.state || addr.region || addr.shipping_state || '';
                  const postal = addr.postalCode || addr.postal_code || '';
                  const parts = [street, city, state, postal].filter(Boolean);
                  return `Shipping — ${parts.join(', ') || '-'}`;
                }
                // fallback: show raw method
                return String(method);
              })()}<br />
              <strong>Delivery Fee:</strong> ₦{selectedOrder.deliveryFee?.toLocaleString()}<br />
              <strong>Notes:</strong> {selectedOrder.metadata?.notes || '-'}
            </div>
            {/* Order Timeline/History */}
            <div className="mb-2 text-sm sm:text-base">
              <strong>Order Timeline:</strong>
              <ul className="text-sm mt-1 ml-2 list-disc">
                <li>Created: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '-'}</li>
                {orderHistory.map((h, i) => (
                  <li key={i}>
                    Status: <span className="capitalize">{h.status}</span> ({h.changed_at ? new Date(h.changed_at).toLocaleString() : '-'})
                    {h.changed_by && <span> by {h.changed_by}</span>}
                  </li>
                ))}
                <li>Current: <span className="capitalize">{selectedOrder.status}</span> (last updated: {selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString() : '-'})</li>
              </ul>
            </div>
      {/* Pagination Controls */}
  <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mt-4">
        <button
          className="px-3 py-1 rounded border bg-white text-gray-900 disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span className="text-sm">Page {page} of {Math.ceil(totalOrders / pageSize) || 1}</span>
        <button
          className="px-3 py-1 rounded border bg-white text-gray-900 disabled:opacity-50"
          disabled={page * pageSize >= totalOrders}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
            <div className="mb-2">
              <strong>Order Items:</strong>
              <div className="overflow-x-auto">
                <table className="min-w-[400px] w-full text-left text-sm text-gray-900 mt-2">
                  <thead>
                    <tr>
                      <th className="py-1 font-bold">Product</th>
                      <th className="py-1 font-bold">Qty</th>
                      <th className="py-1 font-bold">Price</th>
                      <th className="py-1 font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map(item => (
                      <tr key={item.productId} className="border-t">
                        <td className="py-1">{item.productName}</td>
                        <td className="py-1">{item.quantity}</td>
                        <td className="py-1">₦{item.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-1">₦{item.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
