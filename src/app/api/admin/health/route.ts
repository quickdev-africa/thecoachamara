import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/adminGuard';

export async function GET(req: NextRequest) {
  const guard = checkAdmin(req);
  if (!guard.ok) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: guard.status || 401 });
  return NextResponse.json({ status: 'ok' });
}

