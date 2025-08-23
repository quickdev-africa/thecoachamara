import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Product, ApiResponse } from '@/lib/types';

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

interface RouteParams {
  params: { id: string };
}

// ============================================================================
// GET SINGLE PRODUCT BY ID
// ============================================================================
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 });
    }

    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    const product: Product = {
      id: docSnap.id,
      ...docSnap.data()
    } as Product;

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product'
    }, { status: 500 });
  }
}

// ============================================================================
// UPDATE PRODUCT
// ============================================================================
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const { id } = params;
    const updateData = await req.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 });
    }

    // Check if product exists
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    // Prepare update data with validation
    const updateFields: Partial<Product> = {
      updatedAt: new Date().toISOString()
    };

    // Only update provided fields
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.description) updateFields.description = updateData.description;
    if (updateData.price !== undefined) updateFields.price = parseFloat(updateData.price);
    if (updateData.categoryId) updateFields.categoryId = updateData.categoryId;
    if (updateData.images) updateFields.images = updateData.images;
    if (updateData.stock !== undefined) updateFields.stock = updateData.stock;
    if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;
    if (updateData.featured !== undefined) updateFields.featured = updateData.featured;

    // Handle metadata updates
    if (updateData.weight || updateData.dimensions || updateData.tags) {
      const currentData = docSnap.data();
      updateFields.metadata = {
        ...currentData.metadata,
        ...(updateData.weight && { weight: updateData.weight }),
        ...(updateData.dimensions && { dimensions: updateData.dimensions }),
        ...(updateData.tags && { tags: updateData.tags })
      };
    }

    await updateDoc(docRef, updateFields);

    return NextResponse.json({
      success: true,
      data: { id },
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product'
    }, { status: 500 });
  }
}

// ============================================================================
// DELETE PRODUCT (SOFT DELETE)
// ============================================================================
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 });
    }

    // Check if product exists
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: new Date().toISOString(),
      deletedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: { id },
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product'
    }, { status: 500 });
  }
}
