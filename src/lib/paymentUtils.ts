// Minimal helper to ensure a payment record exists in Supabase (idempotent)
export async function ensurePaymentExists(supabaseClient: any, opts: {
  reference: string;
  order_id?: string | null;
  amount?: number | null; // in currency units (not kobo)
  status?: string;
  payment_method?: string;
  email?: string | null;
  metadata?: any;
}) {
  const { reference, order_id = null, amount = null, status = 'completed', payment_method = 'paystack', email = null, metadata = null } = opts || {};

  if (!reference) throw new Error('reference required for ensurePaymentExists');

  try {
    const { data: existing } = await supabaseClient.from('payments').select('*').eq('reference', reference).maybeSingle();
    if (existing) return existing;

    const now = new Date().toISOString();
    const insertPayload: any = {
      reference,
      order_id: order_id || null,
      amount: amount == null ? null : Number(amount),
      status: status || 'completed',
      payment_method: payment_method || 'paystack',
      email: email || null,
      metadata: metadata || null,
      created_at: now,
      updated_at: now
    };

    const { data: insData, error: insErr } = await supabaseClient.from('payments').insert([insertPayload]).select().maybeSingle();
    if (insErr) {
      // bubble up error object for caller logging
      throw insErr;
    }
    return insData;
  } catch (e) {
    // let caller handle/log
    throw e;
  }
}
