import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (process.env.NODE_ENV !== 'development' && url.searchParams.get('dev_debug') !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const active = url.searchParams.get('active') || '/admin';

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Categories', href: '/admin/categories' },
    { name: 'Customers', href: '/admin/customers' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Payments', href: '/admin/payments' },
    // Payment Events intentionally omitted
    { name: 'Email Queue', href: '/admin/email-queue' }
  ];

  const itemsHtml = navItems.map(item => {
    const isActive = active === item.href;
    const classes = isActive ? 'px-4 py-2 rounded-lg font-semibold bg-yellow-300 text-gray-900 shadow' : 'px-4 py-2 rounded-lg font-semibold text-white hover:bg-sunglow-100 hover:text-sunglow-400';
    return `<a href="${item.href}" class="${classes}">${item.name}</a>`;
  }).join('\n');

  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Admin Layout Debug</title></head><body><h1>Admin Layout Debug</h1><nav>${itemsHtml}</nav></body></html>`;

  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html' } });
}
