import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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
    
    // Save to Firestore with enhanced data
    await addDoc(collection(db, 'signups'), enrichedData);
    
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
