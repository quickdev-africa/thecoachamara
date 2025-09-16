import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';
import { requireAdminApi } from '@/lib/requireAdmin';

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (auth) return auth;
  try {
    // Get all signups with comprehensive data from Supabase
    const { data: signups, error } = await supabase
      .from('signups')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    
    // Generate comprehensive dashboard data
    const dashboardData = {
      summary: generateSummaryStats(signups),
      recentActivity: generateRecentActivity(signups),
      conversionMetrics: generateConversionMetrics(signups),
      geographicInsights: generateGeographicInsights(signups),
      productInsights: generateProductInsights(signups),
      revenueMetrics: generateRevenueMetrics(signups),
      membersList: signups.slice(0, 50) // Most recent 50 members
    };
    
    return NextResponse.json(dashboardData);
    
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

function generateSummaryStats(signups: any[]) {
  const total = signups.length;
  const paid = signups.filter(s => s.memberType === 'paid').length;
  const free = signups.filter(s => s.memberType === 'free').length;
  const totalRevenue = signups.reduce((sum, s) => sum + (s.conversionAnalytics?.conversionValue || 0), 0);
  
  return {
    totalMembers: total,
    paidMembers: paid,
    freeMembers: free,
    conversionRate: total > 0 ? ((paid / total) * 100).toFixed(1) : '0',
    totalRevenue: totalRevenue,
    averageOrderValue: paid > 0 ? Math.round(totalRevenue / paid) : 0
  };
}

function generateRecentActivity(signups: any[]) {
  const now = Date.now();
  const today = now - (24 * 60 * 60 * 1000);
  const thisWeek = now - (7 * 24 * 60 * 60 * 1000);
  const thisMonth = now - (30 * 24 * 60 * 60 * 1000);
  
  return {
    today: signups.filter(s => s.timestamp && s.timestamp > today).length,
    thisWeek: signups.filter(s => s.timestamp && s.timestamp > thisWeek).length,
    thisMonth: signups.filter(s => s.timestamp && s.timestamp > thisMonth).length,
    recentSignups: signups.slice(0, 10).map(s => ({
      name: s.name,
      email: s.email,
      memberType: s.memberType,
      joinDate: s.joinDate,
      orderValue: s.conversionAnalytics?.conversionValue || 0
    }))
  };
}

function generateConversionMetrics(signups: any[]) {
  const productSelectors = signups.filter(s => s.memberType === 'paid').length;
  const paymentCompletions = signups.filter(s => s.conversionAnalytics?.paymentStatus === 'completed').length;
  
  return {
    productSelectionRate: signups.length > 0 ? ((productSelectors / signups.length) * 100).toFixed(1) : '0',
    paymentCompletionRate: productSelectors > 0 ? ((paymentCompletions / productSelectors) * 100).toFixed(1) : '0',
    dropOffPoints: {
      formToProduct: signups.length - productSelectors,
      productToPayment: productSelectors - paymentCompletions
    }
  };
}

function generateGeographicInsights(signups: any[]) {
  const stateCount: { [key: string]: number } = {};
  const zoneCount: { [key: string]: number } = {};
  const deliveryMethodCount: { [key: string]: number } = {};
  
  signups.forEach(signup => {
    const state = signup.geoAnalytics?.state;
    const zone = signup.geoAnalytics?.deliveryZone;
    const method = signup.geoAnalytics?.deliveryMethod;
    
    if (state) stateCount[state] = (stateCount[state] || 0) + 1;
    if (zone) zoneCount[zone] = (zoneCount[zone] || 0) + 1;
    if (method) deliveryMethodCount[method] = (deliveryMethodCount[method] || 0) + 1;
  });
  
  return {
    topStates: Object.entries(stateCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([state, count]) => ({ state, count })),
    deliveryZones: zoneCount,
    deliveryMethods: deliveryMethodCount
  };
}

function generateProductInsights(signups: any[]) {
  const productCount: { [key: string]: number } = {};
  const productRevenue: { [key: string]: number } = {};
  const productPrices = {
    "Quantum Boxers": 49000,
    "Quantum Pendant": 29000,
    "Quantum Water Bottle": 39000,
  };
  
  signups.forEach(signup => {
    if (signup.orderAnalytics?.selectedProducts) {
      signup.orderAnalytics.selectedProducts.forEach((product: string) => {
        productCount[product] = (productCount[product] || 0) + 1;
        productRevenue[product] = (productRevenue[product] || 0) + (productPrices[product as keyof typeof productPrices] || 0);
      });
    }
  });
  
  return {
    popularity: Object.entries(productCount)
      .sort(([,a], [,b]) => b - a)
      .map(([product, count]) => ({ product, orders: count })),
    revenue: Object.entries(productRevenue)
      .sort(([,a], [,b]) => b - a)
      .map(([product, revenue]) => ({ product, revenue }))
  };
}

function generateRevenueMetrics(signups: any[]) {
  const paidSignups = signups.filter(s => s.memberType === 'paid');
  const deliveryRevenue = paidSignups.reduce((sum, s) => sum + (s.orderAnalytics?.deliveryFee || 0), 0);
  const productRevenue = paidSignups.reduce((sum, s) => sum + ((s.conversionAnalytics?.conversionValue || 0) - (s.orderAnalytics?.deliveryFee || 0)), 0);
  
  return {
    totalRevenue: productRevenue + deliveryRevenue,
    productRevenue: productRevenue,
    deliveryRevenue: deliveryRevenue,
    averageOrderValue: paidSignups.length > 0 ? Math.round((productRevenue + deliveryRevenue) / paidSignups.length) : 0,
    totalOrders: paidSignups.length
  };
}
