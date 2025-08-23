import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { Order, ApiResponse } from '@/lib/types';

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

// ============================================================================
// GET ALL ORDERS
// ============================================================================
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Order[]>>> {
  try {
    // Extract search params more efficiently
    const url = req.nextUrl;
    const pageLimit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');

    // Simple query to avoid index requirements
    let ordersQuery = query(collection(db, 'orders'));

    // Order by creation date (most recent first)
    ordersQuery = query(ordersQuery, orderBy('createdAt', 'desc'));

    // Add pagination
    ordersQuery = query(ordersQuery, limit(pageLimit));

    const snapshot = await getDocs(ordersQuery);
    let orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];

    // Apply status filter in memory if provided
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    return NextResponse.json({
      success: true,
      data: orders,
      meta: {
        total: orders.length
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders'
    }, { status: 500 });
  }
}
