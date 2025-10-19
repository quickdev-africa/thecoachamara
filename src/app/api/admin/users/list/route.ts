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

export async function GET(req: NextRequest) {
  try {
    // Require admin authentication to view users
    const guard = checkAdmin(req);
    if (!guard.ok) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: guard.status || 401 });
    }

    const supabase = getAdminSupabase();

    // List all users
    const { data, error } = await (supabase as any).auth.admin.listUsers();
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // Filter and format admin users
    const adminUsers = data.users
      .filter((user: any) => user.user_metadata?.admin === true)
      .map((user: any) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        admin: user.user_metadata?.admin || false,
      }));

    return NextResponse.json({ 
      success: true, 
      adminUsers,
      totalAdmins: adminUsers.length 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
