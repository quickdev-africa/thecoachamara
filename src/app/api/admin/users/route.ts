import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkAdmin } from '@/lib/adminGuard';

// Server-only: create a Supabase admin client with the service role key
function getAdminSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !serviceRole) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRole);
}

export async function POST(req: NextRequest) {
  try {
    const guard = checkAdmin(req);
    if (!guard.ok) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: guard.status || 401 });
    const { email, password, inviteToken } = await req.json();
    if (!email || !password || !inviteToken) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Verify invite token on server (never expose expected token to client)
    const expected = process.env.ADMIN_SIGNUP_TOKEN || '';
    if (!expected || inviteToken !== expected) {
      return NextResponse.json({ success: false, error: 'Invalid invite code' }, { status: 401 });
    }

    const supabase = getAdminSupabase();

    // Create the user with admin metadata and confirmed email
    const { data, error } = await (supabase as any).auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { admin: true },
    });
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: data.user?.id || null });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
