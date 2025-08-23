import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit, where } from 'firebase/firestore';
import { ApiResponse } from '@/lib/types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export interface Payment {
  id: string;
  reference: string;
  email: string;
  amount: number;
  productId?: string;
  status: 'pending' | 'success' | 'failed';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// GET ALL PAYMENTS
// ============================================================================
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Payment[]>>> {
  try {
    // Extract search params more efficiently
    const url = req.nextUrl;
    const pageLimit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');
    const email = url.searchParams.get('email');

    // Simple query to avoid index requirements
    let paymentsQuery = query(collection(db, 'payments'));

    // Order by creation date (most recent first)
    paymentsQuery = query(paymentsQuery, orderBy('createdAt', 'desc'));

    // Add pagination
    paymentsQuery = query(paymentsQuery, limit(pageLimit));

    const snapshot = await getDocs(paymentsQuery);
    let payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];

    // Apply filters in memory if provided
    if (status) {
      payments = payments.filter(payment => payment.status === status);
    }

    if (email) {
      payments = payments.filter(payment => payment.email.toLowerCase().includes(email.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      data: payments,
      meta: {
        total: payments.length
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payments'
    }, { status: 500 });
  }
}

// ============================================================================
// CREATE NEW PAYMENT RECORD
// ============================================================================
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const paymentData = await req.json();

    // Validate required fields
    const requiredFields = ['reference', 'email', 'amount', 'status'];
    for (const field of requiredFields) {
      if (!paymentData[field]) {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 });
      }
    }

    // Create payment with standardized structure
    const payment: Omit<Payment, 'id'> = {
      reference: paymentData.reference,
      email: paymentData.email,
      amount: parseFloat(paymentData.amount),
      productId: paymentData.productId,
      status: paymentData.status,
      metadata: paymentData.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'payments'), payment);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
      message: 'Payment record created successfully'
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment'
    }, { status: 500 });
  }
}
