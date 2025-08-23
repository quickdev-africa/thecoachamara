import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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

interface RouteParams {
  params: { id: string };
}

// ============================================================================
// GET SINGLE CATEGORY BY ID
// ============================================================================
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 });
    }

    const docRef = doc(db, 'categories', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Get product count for this category
    const productsQuery = query(collection(db, 'products'), where('categoryId', '==', id), where('isActive', '==', true));
    const productsSnapshot = await getDocs(productsQuery);
    const productCount = productsSnapshot.size;

    const categoryData = docSnap.data();
    const category: Category = {
      id: docSnap.id,
      ...categoryData,
      metadata: {
        ...categoryData.metadata,
        productCount
      }
    } as Category;

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch category'
    }, { status: 500 });
  }
}

// ============================================================================
// UPDATE CATEGORY
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
        error: 'Category ID is required'
      }, { status: 400 });
    }

    // Check if category exists
    const docRef = doc(db, 'categories', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Prepare update data
    const updateFields: Partial<Category> = {
      updatedAt: new Date().toISOString()
    };

    // Only update provided fields
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.image !== undefined) updateFields.image = updateData.image;
    if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;
    if (updateData.sortOrder !== undefined) updateFields.sortOrder = updateData.sortOrder;

    // Handle metadata updates
    if (updateData.tags) {
      const currentData = docSnap.data();
      updateFields.metadata = {
        ...currentData.metadata,
        tags: updateData.tags
      };
    }

    await updateDoc(docRef, updateFields);

    return NextResponse.json({
      success: true,
      data: { id },
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category'
    }, { status: 500 });
  }
}

// ============================================================================
// DELETE CATEGORY (SOFT DELETE)
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
        error: 'Category ID is required'
      }, { status: 400 });
    }

    // Check if category exists
    const docRef = doc(db, 'categories', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Check if category has active products
    const productsQuery = query(collection(db, 'products'), where('categoryId', '==', id), where('isActive', '==', true));
    const productsSnapshot = await getDocs(productsQuery);

    if (productsSnapshot.size > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete category with ${productsSnapshot.size} active products. Please move or delete products first.`
      }, { status: 400 });
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
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete category'
    }, { status: 500 });
  }
}
