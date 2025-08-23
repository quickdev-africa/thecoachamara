import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { Category, ApiResponse } from '@/lib/types';

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
// GET ALL CATEGORIES
// ============================================================================
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Category[]>>> {
  try {
    // Extract search params more efficiently
    const url = req.nextUrl;
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    // Simple query to avoid index requirements
    let categoriesQuery = query(collection(db, 'categories'));

    // Order by name only
    categoriesQuery = query(categoriesQuery, orderBy('name', 'asc'));

    const snapshot = await getDocs(categoriesQuery);
    let categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];

    // Filter active categories in memory to avoid index requirements
    if (!includeInactive) {
      categories = categories.filter(category => category.isActive);
    }

    return NextResponse.json({
      success: true,
      data: categories,
      meta: {
        total: categories.length
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories'
    }, { status: 500 });
  }
}

// ============================================================================
// CREATE NEW CATEGORY
// ============================================================================
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const categoryData = await req.json();

    // Validate required fields
    if (!categoryData.name) {
      return NextResponse.json({
        success: false,
        error: 'Category name is required'
      }, { status: 400 });
    }

    // Create category with standardized structure
    const category: Omit<Category, 'id'> = {
      name: categoryData.name,
      description: categoryData.description || '',
      image: categoryData.image || '',
      isActive: categoryData.isActive !== false, // Default to true
      sortOrder: categoryData.sortOrder || 0,
      metadata: {
        productCount: 0, // Will be updated when products are added
        tags: categoryData.tags || []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'categories'), category);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
      message: 'Category created successfully'
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category'
    }, { status: 500 });
  }
}
