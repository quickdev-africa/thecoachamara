import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    // Safety: only allow in development and when explicit query param present
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ success: false, error: 'Not available' }, { status: 403 });
    }
    const url = new URL(req.url);
    if (url.searchParams.get('dev_seed') !== 'true') {
      return NextResponse.json({ success: false, error: 'dev_seed param required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    // Avoid specifying timestamp columns so we don't depend on exact DB schema (snake_case vs camelCase)
    const payload = {
      reference: `DEV-SMOKE-${now}`,
      order_id: null,
      amount: 1234,
      status: 'success',
      payment_method: 'dev-seed',
      email: 'dev+seed@example.com',
      metadata: { seededAt: now }
    } as any;

    // Insert and return the inserted row(s)
    const { data, error } = await supabase.from('payments').insert([payload]).select();
    if (error) {
      console.warn('Dev seed insert error', error);
      return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('Dev seed error', e);
    return NextResponse.json({ success: false, error: e?.message || 'Internal' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Safety: only allow in development and when explicit query param present
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ success: false, error: 'Not available' }, { status: 403 });
    }
    const url = new URL(req.url);
    if (url.searchParams.get('dev_seed') !== 'true') {
      return NextResponse.json({ success: false, error: 'dev_seed param required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const ref = body.reference || url.searchParams.get('reference');
    const id = body.id || url.searchParams.get('id');

    if (!ref && !id) {
      return NextResponse.json({ success: false, error: 'reference or id required' }, { status: 400 });
    }

    let query = supabase.from('payments').delete();
    if (ref) query = query.eq('reference', ref);
    if (id) query = query.eq('id', id);

    const { data, error } = await query.select();
    if (error) {
      console.warn('Dev seed delete error', error);
      return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: Array.isArray(data) ? data.length : (data ? 1 : 0), data });
  } catch (e: any) {
    console.error('Dev seed delete error', e);
    return NextResponse.json({ success: false, error: e?.message || 'Internal' }, { status: 500 });
  }
}
