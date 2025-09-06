import { NextResponse } from 'next/server';
import { getSubmissions } from '../store';

export async function GET() {
  const CONTACT_DEBUG = process.env.CONTACT_DEBUG === 'true';
  if (!CONTACT_DEBUG) {
    return NextResponse.json({ error: 'debug mode disabled' }, { status: 403 });
  }

  const list = getSubmissions();
  return NextResponse.json({ ok: true, count: list.length, submissions: list });
}
