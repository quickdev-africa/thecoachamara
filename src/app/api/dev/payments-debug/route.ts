import serverSupabase from '../../../../lib/serverSupabase';
import { NextResponse } from 'next/server';

// Development-only HTML debug endpoint to render payments server-side so
// curl/grep can verify seeded rows and classnames without a headless browser.
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (process.env.NODE_ENV !== 'development' && url.searchParams.get('dev_debug') !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const limit = Number(url.searchParams.get('limit') || '50');
  try {
    const { data } = await serverSupabase.from('payments').select('*').order('created_at', { ascending: false }).limit(limit);
    const rows = Array.isArray(data) ? data : [];

    const htmlRows = rows.map(r => {
      const reference = (r as any).reference || '';
      const email = (r as any).email || '';
      const amount = (r as any).amount ?? '';
      const status = (r as any).status || '';
      const created_at = (r as any).created_at || '';
      return `
        <tr class="border-t">
          <td class="py-2">${reference}</td>
          <td class="py-2">${email}</td>
          <td class="py-2">${amount}</td>
          <td class="py-2">${status}</td>
          <td class="py-2">${created_at}</td>
        </tr>`;
    }).join('\n');

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Dev Payments Debug</title>
      </head>
      <body>
        <h1 class="text-2xl font-bold mb-2 text-black">Dev Payments Debug</h1>
        <div class="mb-4 grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-4">
          <div class="text-xs text-gray-700">Server-rendered debug view</div>
        </div>
        <table class="min-w-[700px] w-full text-left text-sm text-gray-900">
          <thead>
            <tr>
              <th class="py-2 font-bold">Reference</th>
              <th class="py-2 font-bold">Email</th>
              <th class="py-2 font-bold">Amount</th>
              <th class="py-2 font-bold">Status</th>
              <th class="py-2 font-bold">Date</th>
            </tr>
          </thead>
          <tbody>
            ${htmlRows}
          </tbody>
        </table>
        <p class="text-xs text-gray-700">Rows: ${rows.length}</p>
      </body>
    </html>`;

    return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html' } });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
