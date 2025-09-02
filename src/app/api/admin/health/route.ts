import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/requireAdmin';

export async function GET(req: NextRequest) {
	const auth = await requireAdminApi(req);
	if (auth) return auth;

	return NextResponse.json({ status: 'ok' });
}

