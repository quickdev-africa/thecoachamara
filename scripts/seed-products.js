#!/usr/bin/env node
/*
 * scripts/seed-products.js
 * Seeds three canonical products used by the join page so the frontend can reference
 * their UUIDs directly and avoid placeholder creation.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-products.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// If required env vars are not present, try to load from .env.local in repo root (simple parser)
function loadDotenvLocalIfMissing() {
  const needed = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = needed.filter(k => !process.env[k]);
  if (missing.length === 0) return;
  try {
    const data = fs.readFileSync('.env.local', 'utf8');
    data.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      // remove surrounding quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    });
    console.log('Loaded .env.local into process.env for missing keys:', missing.join(', '));
  } catch (e) {
    // ignore - we'll surface missing vars later
  }
}

loadDotenvLocalIfMissing();

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Export them in your environment and retry.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const products = [
    {
      id: '0cd6d480-66ca-4e3c-9c8c-63a64f7fbb78',
      name: "Quantum Energy Grapheme Men's underwear",
      description: `A real solution\n\nReviews:...`,
      price: 98600,
      stock: 100,
      is_active: true,
      category_id: null,
      images: ['https://res.cloudinary.com/djucbsrds/image/upload/v1756012379/quantumboxer_le2bm8.jpg'],
      metadata: { tags: [] }
    },
    {
      id: '2bb424e2-fc60-4598-aefa-975b79f579b7',
      name: 'Quantum Energy Polarised Eyeglasses',
      description: 'Quantum Polarised Eyeglasses',
      price: 285600,
      stock: 100,
      is_active: true,
      category_id: null,
      images: ['https://res.cloudinary.com/djucbsrds/image/upload/v1756013025/sunglasses_jifzgj.jpg'],
      metadata: { tags: [] }
    },
    {
      id: 'c62a94d2-a5f4-4d40-a65e-3a81550a8a6a',
      name: 'Quantum Energy Bracelets',
      description: 'Quantum Energy Bracelets',
      price: 299880,
      stock: 100,
      is_active: true,
      category_id: null,
      images: ['https://res.cloudinary.com/djucbsrds/image/upload/v1756012522/bracelets_x1i0rv.jpg'],
      metadata: { tags: [] }
    }
  ];

  console.log('Seeding products...');

  for (const p of products) {
    try {
      // Check if product exists by id
      const { data: existing, error: fetchErr } = await supabase.from('products').select('id').eq('id', p.id).maybeSingle();
      if (fetchErr) {
        console.warn('Failed to check existing product', p.id, fetchErr.message || fetchErr);
      }

      if (existing && existing.id) {
        // Update existing
        const { data: updated, error: updateErr } = await supabase.from('products').update({
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          is_active: p.is_active,
          category_id: p.category_id,
          images: p.images,
          metadata: p.metadata
        }).eq('id', p.id).select().maybeSingle();
        if (updateErr) {
          console.error('Failed to update product', p.id, updateErr.message || updateErr);
        } else {
          console.log('Updated product', p.id, p.name);
        }
      } else {
        // Insert (use explicit id so frontend UUIDs match)
        const insertPayload = { ...p };
        try {
          const { data: ins, error: insErr } = await supabase.from('products').insert([insertPayload]).select().maybeSingle();
          if (insErr) {
            console.error('Insert failed for', p.id, insErr.message || insErr);
          } else {
            console.log('Inserted product', ins.id || p.id, p.name);
          }
        } catch (ie) {
          console.error('Insert exception for', p.id, ie.message || ie);
        }
      }
    } catch (e) {
      console.error('Unexpected error seeding product', p.id, e?.message || e);
    }
  }

  console.log('Seeding complete.');
  process.exit(0);
}

main();
