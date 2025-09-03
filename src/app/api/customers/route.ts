import { NextRequest, NextResponse } from 'next/server';
import serverSupabase from '@/lib/serverSupabase';
import { requireAdminApi } from '@/lib/requireAdmin';

// GET all customers (members and buyers)
export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (auth) return auth;
    try {
      // Check query param to optionally return only leads (customers with no orders)
      const leadsOnly = req.nextUrl.searchParams.get('leads_only') === 'true';

      // Try to fetch user profiles using server role client (RLS-safe)
      let users: any[] | null = null;
      try {
        // include fields we may use for filtering/flags
        const { data, error } = await serverSupabase
          .from('user_profiles')
          .select('id, name, email, phone, joined_at, is_active, auto_created');
        if (error) throw error;
        users = data as any[];
      } catch (e) {
        console.warn('Unable to read user_profiles with anon client, will fallback to orders-derived customers', e);
        users = null;
      }

    // Fetch order counts and last order date for each user/email. Select all columns
    // to be resilient to snake_case vs camelCase column naming in different deployments.
    const { data: orders, error: orderError } = await serverSupabase
      .from('orders')
      .select('*');
    if (orderError) {
      console.error('Orders query failed in customers API:', orderError);
      throw orderError;
    }

    type User = { id: string; name: string; email: string; phone?: string; joined_at?: string; is_active?: boolean };
    type Order = { user_id: string; created_at: string };

    // Map orders to user
    const orderMap = new Map<string, string[]>();
    (orders as Order[] || []).forEach(order => {
      if (!orderMap.has(order.user_id)) orderMap.set(order.user_id, []);
      orderMap.get(order.user_id)!.push(order.created_at);
    });

    let customers: any[] = [];

    if (users && users.length > 0) {
      customers = (users as User[]).map(user => {
        const userOrders = orderMap.get(user.id) || [];
        return {
          ...user,
          orders_count: userOrders.length,
          last_order_at: userOrders.length > 0 ? userOrders.sort().reverse()[0] : null,
        };
      });
    } else {
      // Fallback: derive customers from orders table (group by email)
      const byEmail = new Map<string, any>();
      (orders as any[] || []).forEach((o: any) => {
        const email = (o.customer_email || '').toString();
        const name = o.customer_name || o.customerName || 'Unknown';
        const phone = o.customer_phone || o.customerPhone || null;
        const created = o.created_at || null;
        const keyBase = email || name || 'unknown';
        const key = keyBase.toLowerCase();
        if (!byEmail.has(key)) {
          byEmail.set(key, {
            id: key + '-' + (created || ''),
            name,
            email,
            phone,
            joined_at: created,
            orders_count: 0,
            last_order_at: null,
            is_active: true
          });
        }
        const entry = byEmail.get(key);
        entry.orders_count = (entry.orders_count || 0) + 1;
        if (!entry.last_order_at || (created && created > entry.last_order_at)) entry.last_order_at = created;
      });
      customers = Array.from(byEmail.values());
    }

    // If requested, only return leads.
    // Prefer explicit `auto_created` flag when present (less noisy).
    if (leadsOnly) {
      const hasAutoCreatedFlag = customers.some(c => c.auto_created === true || c.autoCreated === true);
      if (hasAutoCreatedFlag) {
        customers = customers.filter(c => c.auto_created === true || c.autoCreated === true);
      } else {
        // Fallback: treat zero-orders as leads
        customers = customers.filter(c => (c.orders_count || 0) === 0);
      }
    }

    // Compute summary counts to avoid client-side counting for large datasets
    const total = customers.length;
    const leads = customers.filter(c => {
      // auto_created flag when present indicates a lead; also treat zero-orders as lead
      return (c.auto_created === true) || ((c.orders_count || 0) === 0);
    }).length;

    return NextResponse.json({ success: true, data: customers, summary: { total, leads } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to fetch customers' }, { status: 500 });
  }
}
