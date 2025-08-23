import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { Product, ApiResponse, PaginationParams } from '@/lib/types';

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
// GET ALL PRODUCTS WITH FILTERING & PAGINATION
// ============================================================================
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    // Extract search params more efficiently  
    const url = req.nextUrl;
    const categoryId = url.searchParams.get('categoryId');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageLimit = parseInt(url.searchParams.get('limit') || '20');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';

    // Simple query to avoid index requirements
    let productsQuery = query(collection(db, 'products'));

    // Add sorting only
    productsQuery = query(productsQuery, orderBy(sortBy, sortOrder));

    // Add pagination
    productsQuery = query(productsQuery, limit(pageLimit));

    const snapshot = await getDocs(productsQuery);
    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    // Apply filters in memory to avoid index requirements
    products = products.filter(product => product.isActive);

    if (categoryId) {
      products = products.filter(product => product.categoryId === categoryId);
    }

    // Apply search filter in memory (for simple text search)
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Calculate pagination metadata
    const total = products.length;
    const hasMore = products.length === pageLimit;

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        total,
        page,
        limit: pageLimit,
        hasMore
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    }, { status: 500 });
  }
}

// ============================================================================
// CREATE NEW PRODUCT
// ============================================================================
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const productData = await req.json();

    // Validate required fields
    const requiredFields = ['name', 'price', 'categoryId', 'description'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 });
      }
    }

    // Create product with standardized structure
    const product: Omit<Product, 'id'> = {
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      categoryId: productData.categoryId,
      images: productData.images || [],
      stock: productData.stock || 0,
      isActive: productData.isActive !== false, // Default to true
      featured: productData.featured || false,
      metadata: {
        ...(productData.weight && { weight: productData.weight }),
        ...(productData.dimensions && { dimensions: productData.dimensions }),
        tags: productData.tags || []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'products'), product);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product'
    }, { status: 500 });
  }
}
