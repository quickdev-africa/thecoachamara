// One-off DB check script. Loads local .env and queries Supabase for the smoke test order/payment.
// Prints concise results only (no secrets).

const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function run(orderId, paymentReference) {
  try {
    console.log('Querying Supabase for orderId:', orderId);
    const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
    if (orderErr) {
      console.error('orders query error', orderErr);
    } else {
      console.log('Order:', {
        id: order?.id,
        total: order?.total,
        subtotal: order?.subtotal,
        paymentStatus: order?.paymentStatus,
        status: order?.status,
        payment_reference: order?.payment_reference
      });
    }

    console.log('Querying payment_attempts for payment_reference:', paymentReference);
    const { data: attempt, error: attemptErr } = await supabase.from('payment_attempts').select('*').eq('payment_reference', paymentReference).maybeSingle();
    if (attemptErr) {
      console.error('payment_attempts query error', attemptErr);
    } else {
      console.log('Payment attempt:', {
        id: attempt?.id,
        status: attempt?.status,
        amount: attempt?.amount,
        paystack_reference: attempt?.paystack_reference,
        paystack_data_present: !!attempt?.paystack_data,
        order_id: attempt?.order_id
      });
    }

    console.log('Querying payments for reference:', paymentReference);
    const { data: payments, error: paymentsErr } = await supabase.from('payments').select('*').or(`reference.eq.${paymentReference},paystack_reference.eq.${paymentReference}`);
    if (paymentsErr) {
      console.error('payments query error', paymentsErr);
    } else {
      console.log('Payments found:', payments.map(p => ({ id: p.id, reference: p.reference || p.paystack_reference || null, amount: p.amount, order_id: p.order_id, status: p.status })));
    }

    process.exit(0);
  } catch (e) {
    console.error('Unexpected error', e);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/db-check-payment.js <orderId> <paymentReference>');
  process.exit(1);
}

run(args[0], args[1]);
