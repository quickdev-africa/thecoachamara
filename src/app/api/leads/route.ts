import { NextRequest, NextResponse } from 'next/server';
import serverSupabase from '@/lib/serverSupabase';
import { requireAdminApi } from '@/lib/requireAdmin';

// Public endpoint to capture lightweight leads when users join without buying.
// This inserts into user_profiles if an email is provided, otherwise stores into signups as fallback.
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const name = (data.name || '').toString().trim();
    const email = (data.email || '').toString().trim().toLowerCase();
    const phone = (data.phone || '').toString().trim();

    const payload: any = {
      name: name || null,
      email: email || null,
      phone: phone || null,
      joined_at: new Date().toISOString(),
      is_active: true,
    };
    // note: older deployments may not have a `meta` JSON column on user_profiles;
    // avoid adding it here to keep the endpoint tolerant.

    // If email exists, upsert into user_profiles to avoid duplicates by email
    if (email) {
      const { data: existing } = await serverSupabase.from('user_profiles').select('id,auto_created').eq('email', email).maybeSingle();
      if (existing && existing.id) {
        // update existing record with latest phone/name if provided
        // Do NOT set `auto_created` here to avoid misclassifying existing customers as leads.
        await serverSupabase.from('user_profiles').update({ name: payload.name, phone: payload.phone }).eq('id', existing.id);
        return NextResponse.json({ success: true, id: existing.id, upserted: false });
      }
      // mark inserted leads as auto_created so admin filters show them as leads
      const insertPayload = { ...payload, auto_created: true };
      const { data: ins, error } = await serverSupabase.from('user_profiles').insert([insertPayload]).select('id').maybeSingle();
      if (error) {
        console.warn('user_profiles insert failed, falling back to signups table', error.message || error);
        // fallback to signups so lead isn't lost
        const { data: s, error: signErr } = await serverSupabase.from('signups').insert([{ ...payload, source: 'lead_insert_fallback' }]).select('id').maybeSingle();
        if (signErr) throw signErr;
        return NextResponse.json({ success: true, id: s?.id || null, fallback: true });
      }
      return NextResponse.json({ success: true, id: ins?.id || null });
    }

    // If there's no email but a phone is provided, upsert into user_profiles by phone
    if (!email && phone) {
      const { data: existingByPhone } = await serverSupabase.from('user_profiles').select('id').eq('phone', phone).maybeSingle();
      if (existingByPhone && existingByPhone.id) {
        await serverSupabase.from('user_profiles').update({ name: payload.name }).eq('id', existingByPhone.id);
        return NextResponse.json({ success: true, id: existingByPhone.id, upserted: false, note: 'matched_by_phone' });
      }
      // Build a safe email placeholder because user_profiles.email is NOT NULL in many deployments
      const phoneDigits = phone.replace(/\D/g, '') || `noemail${Date.now()}`;
      const placeholderEmail = `${phoneDigits}@no-reply.thecoachamara.local`;
      const insertPayload = { ...payload, email: placeholderEmail, auto_created: true };
      const { data: insPhone, error: insPhoneErr } = await serverSupabase.from('user_profiles').insert([insertPayload]).select('id').maybeSingle();
      if (insPhoneErr) {
        console.warn('user_profiles insert by phone failed, falling back to signups table', insPhoneErr.message || insPhoneErr);
      } else {
        return NextResponse.json({ success: true, id: insPhone?.id || null, note: 'inserted_by_phone' });
      }
    }

    // Final fallback: always insert into `user_profiles`. We do NOT use a separate `signups` table.
    // Ensure a non-null email for DB constraints by creating a harmless placeholder when needed.
    try {
      const fallbackEmail = email || (phone ? `${phone.replace(/\D/g,'')}@no-reply.thecoachamara.local` : `noemail${Date.now()}@no-reply.thecoachamara.local`);
      const insertPayload = { ...payload, email: fallbackEmail, auto_created: true };
      const { data: ins, error: insErr } = await serverSupabase.from('user_profiles').insert([insertPayload]).select('id').maybeSingle();
      if (insErr) {
        console.error('user_profiles insert failed', insErr);
        return NextResponse.json({ success: false, error: 'failed to store lead' }, { status: 500 });
      }
      return NextResponse.json({ success: true, id: ins?.id || null, source: 'user_profiles' });
    } catch (err: any) {
      console.error('user_profiles insert unexpected error', err?.message || err);
      return NextResponse.json({ success: false, error: 'failed to store lead' }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

// Admin-only: list leads (from user_profiles where auto_created or zero orders), with pagination and optional CSV export
export async function GET(req: NextRequest) {
  // ensure only admins can list leads
  const auth = await requireAdminApi(req);
  if (auth) return auth;

  try {
    const url = req.nextUrl;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(10, parseInt(url.searchParams.get('limit') || '50')));
    const offset = (page - 1) * limit;
    const csv = url.searchParams.get('csv') === 'true';

    // Try to read user_profiles and join with orders counts
    const { data: users, error: userErr } = await serverSupabase.from('user_profiles').select('id, name, email, phone, joined_at, is_active, auto_created').order('joined_at', { ascending: false }).range(offset, offset + limit - 1);
    if (userErr) throw userErr;

    // For each user, fetch orders_count via a lightweight query grouping by user_id
    const ids = (users || []).map((u: any) => u.id).filter(Boolean);
    let ordersMap: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: ords } = await serverSupabase.from('orders').select('user_id').in('user_id', ids).maybeSingle();
      // If ords is null or not array, skip; otherwise build map
      if (Array.isArray(ords)) {
        ords.forEach((o: any) => { ordersMap[o.user_id] = (ordersMap[o.user_id] || 0) + 1; });
      }
    }

    const leads = (users || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      joined_at: u.joined_at,
      is_active: u.is_active,
      auto_created: u.auto_created === true,
      orders_count: ordersMap[u.id] || 0
    }));

    // If csv requested, stream a CSV response
    if (csv) {
      const header = 'id,name,email,phone,joined_at,is_active,auto_created,orders_count\n';
      const rows = leads.map((l: any) => `${l.id},"${(l.name||'').replace(/"/g,'""')}","${(l.email||'')}","${(l.phone||'')}",${l.joined_at || ''},${l.is_active ? 1 : 0},${l.auto_created ? 1 : 0},${l.orders_count}`).join('\n');
      const body = header + rows;
      return new NextResponse(body, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="leads-page-${page}.csv"` } });
    }

    return NextResponse.json({ success: true, data: leads, page, limit });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
