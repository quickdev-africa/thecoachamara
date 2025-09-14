import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Enhanced data collection with analytics and insights
    const enrichedData = {
      // Original form data (preserving exact structure)
      ...data,
      
      // Member Analytics
      memberType: data.product && data.product.length > 0 ? 'paid' : 'free',
      joinDate: new Date().toISOString(),
      timestamp: Date.now(),
      
      // Order Analytics (only if products selected)
      ...(data.product && data.product.length > 0 && {
        orderAnalytics: {
          productCount: data.product.length,
          selectedProducts: data.product,
          orderValue: calculateOrderValue(data.product),
          deliveryMethod: data.deliveryMethod,
          ...(data.deliveryMethod === 'ship' && {
            deliveryZone: getDeliveryZoneInfo(data.shippingAddress?.state || data.state),
            deliveryFee: getDeliveryFee(data.shippingAddress?.state || data.state),
            shippingState: data.shippingAddress?.state || data.state,
            shippingCity: data.shippingAddress?.city,
          }),
          ...(data.deliveryMethod === 'pickup' && {
            pickupLocation: data.pickupLocation,
            deliveryFee: 0,
          }),
        }
      }),
      
      // Geographic Analytics
      geoAnalytics: {
        state: data.shippingAddress?.state || data.state || null,
        city: data.shippingAddress?.city || null,
        deliveryMethod: data.deliveryMethod || null,
        ...(data.deliveryMethod === 'ship' && {
          deliveryZone: getDeliveryZoneInfo(data.shippingAddress?.state || data.state)?.name || null,
        }),
      },
      
      // Conversion Analytics
      conversionAnalytics: {
        source: 'join_page',
        converted: data.product && data.product.length > 0,
        conversionValue: data.product && data.product.length > 0 ? calculateOrderValue(data.product) : 0,
        paymentStatus: data.paid ? 'completed' : (data.product && data.product.length > 0 ? 'pending' : 'free_join'),
        paymentReference: data.paymentRef || null,
      },
      
      // Technical Analytics
      technicalData: {
        userAgent: req.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
      }
    };
    
  // Persist lead: prefer the unified `user_profiles` table so admin UI and orders link
  // to a single customer table. Fall back to `signups` only if user_profiles isn't available
  // in the target Supabase deployment.
  try {
    // If email provided, upsert by email to avoid duplicates
    if (enrichedData.email) {
      const { data: existing } = await supabase.from('user_profiles').select('id,auto_created').eq('email', enrichedData.email).maybeSingle();
      if (existing && existing.id) {
        // update minimal fields (avoid writing large JSON into unknown columns)
        await supabase.from('user_profiles').update({ name: enrichedData.name || null, phone: enrichedData.phone || null }).eq('id', existing.id);
      } else {
        const insertPayload: any = {
          name: enrichedData.name || null,
          email: enrichedData.email || null,
          phone: enrichedData.phone || null,
          joined_at: enrichedData.joinDate || new Date().toISOString(),
          is_active: true,
          auto_created: true,
        };
        // Attempt to include a small meta field if it exists in schema
        try {
          // Some deployments have a `meta` JSON column on user_profiles; keep it optional
          insertPayload.meta = {
            memberType: enrichedData.memberType,
            conversionAnalytics: enrichedData.conversionAnalytics,
            orderAnalytics: enrichedData.orderAnalytics,
          };
        } catch (e) {
          // ignore; column may not exist
        }
        const { error: upErr } = await supabase.from('user_profiles').insert([insertPayload]);
        if (upErr) throw upErr;
      }
    } else if (enrichedData.phone) {
      // No email: fall back to phone-based upsert into user_profiles
      const { data: existingByPhone } = await supabase.from('user_profiles').select('id').eq('phone', enrichedData.phone).maybeSingle();
      if (existingByPhone && existingByPhone.id) {
        await supabase.from('user_profiles').update({ name: enrichedData.name || null }).eq('id', existingByPhone.id);
      } else {
        // user_profiles.email is often NOT NULL; create a harmless placeholder
        const phoneDigits = (enrichedData.phone || '').toString().replace(/\D/g, '') || `noemail${Date.now()}`;
        const placeholderEmail = `${phoneDigits}@no-reply.thecoachamara.local`;
        const insertPayload: any = {
          name: enrichedData.name || null,
          email: placeholderEmail,
          phone: enrichedData.phone || null,
          joined_at: enrichedData.joinDate || new Date().toISOString(),
          is_active: true,
          auto_created: true,
        };
        try {
          insertPayload.meta = { memberType: enrichedData.memberType };
        } catch (e) {}
        const { error: phErr } = await supabase.from('user_profiles').insert([insertPayload]);
        if (phErr) throw phErr;
      }
    } else {
      // No email or phone: insert a minimal placeholder into user_profiles
      const placeholderEmail = `noemail${Date.now()}@no-reply.thecoachamara.local`;
      const insertPayload: any = {
        name: enrichedData.name || null,
        email: placeholderEmail,
        phone: enrichedData.phone || null,
        joined_at: enrichedData.joinDate || new Date().toISOString(),
        is_active: true,
        auto_created: true,
      };
      const { error: minErr } = await supabase.from('user_profiles').insert([insertPayload]);
      if (minErr) throw minErr;
    }
  } catch (err: any) {
    // If user_profiles doesn't exist or the insert fails for this deployment, fall back
    // to the legacy `signups` table so we don't lose leads.
    console.warn('user_profiles write failed, falling back to signups table', err?.message || err);
    const { error: sgErr } = await supabase.from('signups').insert([enrichedData]);
    if (sgErr) throw new Error(sgErr.message || 'signups insert failed');
  }
  // Attempt to notify user and owner via Resend (preferred).
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.SENDER_EMAIL || 'no-reply@yourdomain.com';
    const OWNER_EMAIL = process.env.OWNER_EMAIL || process.env.STORE_OWNER_EMAIL || null;
      if (RESEND_API_KEY) {
      const send = async (to: string, subject: string, html: string) => {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: RESEND_FROM_EMAIL, to: [to], subject, html })
        });
        // Try to parse JSON body; return a stable object with status and body for auditing
        let body: any = null;
        try { body = await res.json(); } catch (e) { body = null; }
        return { status: res.status, ok: res.ok, body };
      };

      const customerHtml = `<p>Hi ${enrichedData.name || 'friend'},</p><p>Thanks for joining Coach Amara's community. We'll be in touch with next steps.</p><p>— Coach Amara</p>`;
      const ownerHtml = `<p>New signup received:</p><p>Name: ${enrichedData.name}</p><p>Email: ${enrichedData.email}</p><p>Phone: ${enrichedData.phone || '-'} </p>`;
      try {
        let resendResponseCustomer: any = null;
        let resendResponseOwner: any = null;
        if (enrichedData.email) {
          resendResponseCustomer = await send(enrichedData.email, 'Welcome to Coach Amara', customerHtml);
        }
        if (OWNER_EMAIL) {
          resendResponseOwner = await send(OWNER_EMAIL, 'New signup — Coach Amara', ownerHtml);
        }

        // Persist a lightweight audit row in email_queue when possible so delivery can be traced.
        try {
          const auditRows = [];
          if (resendResponseCustomer) {
            auditRows.push({ recipient: enrichedData.email, provider: 'resend', provider_response: resendResponseCustomer, request_id: enrichedData.technicalData?.requestId, created_at: new Date().toISOString() });
          }
          if (resendResponseOwner) {
            auditRows.push({ recipient: OWNER_EMAIL, provider: 'resend', provider_response: resendResponseOwner, request_id: enrichedData.technicalData?.requestId, created_at: new Date().toISOString() });
          }
          if (auditRows.length > 0) {
            // Preferred: write to our stable audit table
            try {
              await supabase.from('resend_audit').insert(auditRows);
            } catch (raErr) {
              console.warn('resend_audit insert failed (non-fatal)', (raErr as any)?.message || (raErr as any));
              // Fallback: try the legacy email_queue if it exists
              try {
                await supabase.from('email_queue').insert(auditRows.map(r => ({ recipient: r.recipient, provider: r.provider, provider_response: JSON.stringify(r.provider_response), created_at: r.created_at })));
              } catch (qe) {
                console.warn('email_queue audit insert also failed (non-fatal)', (qe as any)?.message || (qe as any));
              }
            }
          }
        } catch (ae) {
          console.warn('Failed to build audit rows', (ae as any)?.message || (ae as any));
        }
      } catch (e) {
        console.warn('Resend notify (signup) failed', e);
      }
    }
  } catch (e) {
    console.warn('Signup post-insert notify failed', e);
  }

  return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Helper functions for data enrichment
function calculateOrderValue(products: string[]): number {
  const productPrices: { [key: string]: number } = {
    "Quantum Boxers": 49000,
    "Quantum Pendant": 29000,
    "Quantum Water Bottle": 39000,
  };
  
  return products.reduce((total, product) => {
    return total + (productPrices[product] || 0);
  }, 0);
}

function getDeliveryZoneInfo(state: string | undefined): { name: string; cost: number } | null {
  if (!state) return null;
  
  const deliveryZones = {
    "Lagos Zone": { cost: 3000, states: ["Lagos", "Ogun"] },
    "Abuja Zone": { cost: 4000, states: ["FCT", "Niger", "Kaduna", "Nasarawa", "Kogi"] },
    "Other States": { cost: 5000, states: ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kano", "Katsina", "Kebbi", "Kwara", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"] }
  };
  
  for (const [zoneName, zoneData] of Object.entries(deliveryZones)) {
    if (zoneData.states.includes(state)) {
      return { name: zoneName, cost: zoneData.cost };
    }
  }
  return null;
}

function getDeliveryFee(state: string | undefined): number {
  const zoneInfo = getDeliveryZoneInfo(state);
  return zoneInfo ? zoneInfo.cost : 0;
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
