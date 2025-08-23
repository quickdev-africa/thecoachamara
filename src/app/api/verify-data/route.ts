import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

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

export async function GET(req: NextRequest) {
  try {
    // Get recent signups to verify data collection
    const signupsRef = collection(db, 'signups');
    const signupsQuery = query(signupsRef, orderBy('timestamp', 'desc'), limit(10));
    const snapshot = await getDocs(signupsQuery);
    
    const signups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Format the data for easy viewing
    const formattedData = signups.map((signup: any) => ({
      // Basic Info
      name: signup.name,
      email: signup.email,
      phone: signup.phone,
      joinDate: signup.joinDate,
      
      // Enhanced Data Collection
      memberType: signup.memberType,
      
      // Order Details (if applicable)
      hasProducts: signup.product?.length > 0,
      products: signup.product || [],
      
      // Geographic Data
      state: signup.geoAnalytics?.state,
      city: signup.geoAnalytics?.city,
      deliveryMethod: signup.geoAnalytics?.deliveryMethod,
      deliveryZone: signup.geoAnalytics?.deliveryZone,
      
      // Conversion Data
      converted: signup.conversionAnalytics?.converted,
      conversionValue: signup.conversionAnalytics?.conversionValue,
      paymentStatus: signup.conversionAnalytics?.paymentStatus,
      paymentReference: signup.conversionAnalytics?.paymentReference,
      
      // Order Analytics (if order exists)
      orderValue: signup.orderAnalytics?.orderValue,
      deliveryFee: signup.orderAnalytics?.deliveryFee,
      pickupLocation: signup.orderAnalytics?.pickupLocation,
      
      // Technical Data
      userAgent: signup.technicalData?.userAgent,
      requestId: signup.technicalData?.requestId,
      
      // Raw data for full inspection
      rawData: signup
    }));
    
    return NextResponse.json({
      message: "Data collection verification",
      totalSignups: signups.length,
      recentSignups: formattedData,
      dataCollectionWorking: signups.length > 0 && signups[0].memberType !== undefined
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message,
      message: "Error fetching data - check Firebase configuration"
    }, { status: 500 });
  }
}
