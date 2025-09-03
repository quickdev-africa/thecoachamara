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

    // Try insert; if the payments table doesn't have created_at/updated_at columns
    // (some deployments), retry without those fields.
    try {
      const { data: insData, error: insErr } = await supabaseClient.from('payments').insert([insertPayload]).select().maybeSingle();
      if (insErr) throw insErr;
      return insData;
    } catch (insErr: any) {
      // If error mentions updated_at/created_at or column missing, retry without timestamps
      const msg = (insErr?.message || '').toLowerCase();
      if (msg.includes('updated_at') || msg.includes('created_at') || msg.includes("column \"updated_at\"" ) || msg.includes('schema cache')) {
        const safePayload = { ...insertPayload };
        delete safePayload.created_at;
        delete safePayload.updated_at;
        try {
          const { data: insData2, error: insErr2 } = await supabaseClient.from('payments').insert([safePayload]).select().maybeSingle();
          if (insErr2) throw insErr2;
          return insData2;
        } catch (e2) {
          // bubble up the secondary error
          throw e2;
        }
      }
      // bubble up original error if not handled
      throw insErr;
    }
  } catch (e) {
    // let caller handle/log
    throw e;
  }
}
