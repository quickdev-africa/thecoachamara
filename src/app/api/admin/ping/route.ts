import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/requireAdmin';

export async function GET(req: Request) {
  // adapt to Next's NextRequest shape inside helper
  // (requireAdminApi expects NextRequest; cast is safe here because headers exist)
  // @ts-ignore
  const auth = await requireAdminApi(req as any);
  if (auth && (auth as any).status === 401) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ success: true, message: 'pong' });
}
