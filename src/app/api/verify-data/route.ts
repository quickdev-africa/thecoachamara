import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // Get recent signups to verify data collection from Supabase
    const { data: signups, error } = await supabase
      .from('signups')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    
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
  dataCollectionWorking: signups.length > 0 && signups[0]?.memberType !== undefined
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message,
      message: "Error fetching data - check Firebase configuration"
    }, { status: 500 });
  }
}
