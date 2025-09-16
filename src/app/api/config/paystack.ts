// pages/api/config/paystack.ts (if using Pages Router)
// or app/api/config/paystack/route.ts (if using App Router)

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_KEY;
    
    if (!publicKey) {
      console.error('Paystack public key not found in environment variables');
      return res.status(500).json({ error: 'Payment configuration not found' });
    }

    res.status(200).json({ publicKey });
  } catch (error) {
    console.error('Error getting Paystack config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// If you're using App Router, use this instead:
/*
export async function GET() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_KEY;
    
    if (!publicKey) {
      console.error('Paystack public key not found in environment variables');
      return Response.json({ error: 'Payment configuration not found' }, { status: 500 });
    }

    return Response.json({ publicKey });
  } catch (error) {
    console.error('Error getting Paystack config:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
*/