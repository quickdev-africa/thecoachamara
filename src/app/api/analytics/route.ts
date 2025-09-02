import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/requireAdmin';
import { supabase } from '../../../supabaseClient';

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (auth) return auth;
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'overview';
    const limit_param = parseInt(searchParams.get('limit') || '100');
    
    // Get all signups from Supabase
    const { data: signups, error } = await supabase
      .from('signups')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit_param);
    if (error) throw new Error(error.message);
    
    switch (type) {
      case 'overview':
        return NextResponse.json(generateOverviewAnalytics(signups));
      case 'conversion':
        return NextResponse.json(generateConversionAnalytics(signups));
      case 'geographic':
        return NextResponse.json(generateGeographicAnalytics(signups));
      case 'products':
        return NextResponse.json(generateProductAnalytics(signups));
      case 'recent':
        return NextResponse.json({
          recent_signups: signups.slice(0, 20),
          total_count: signups.length
        });
      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
    }
    
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

function generateOverviewAnalytics(signups: any[]) {
  const total = signups.length;
  const paidMembers = signups.filter(s => s.memberType === 'paid').length;
  const freeMembers = signups.filter(s => s.memberType === 'free').length;
  const totalRevenue = signups.reduce((sum, s) => sum + (s.conversionAnalytics?.conversionValue || 0), 0);
  const averageOrderValue = paidMembers > 0 ? totalRevenue / paidMembers : 0;
  
  // Recent activity (last 7 days)
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentSignups = signups.filter(s => s.timestamp && s.timestamp > sevenDaysAgo);
  
  return {
    overview: {
      total_members: total,
      paid_members: paidMembers,
      free_members: freeMembers,
      conversion_rate: total > 0 ? ((paidMembers / total) * 100).toFixed(2) + '%' : '0%',
      total_revenue: totalRevenue,
      average_order_value: Math.round(averageOrderValue),
      recent_activity: {
        last_7_days: recentSignups.length,
        paid_last_7_days: recentSignups.filter(s => s.memberType === 'paid').length
      }
    }
  };
}

function generateConversionAnalytics(signups: any[]) {
  const conversionFunnel = {
    total_visitors: signups.length,
    form_completions: signups.length,
    product_selections: signups.filter(s => s.memberType === 'paid').length,
    payment_completions: signups.filter(s => s.conversionAnalytics?.paymentStatus === 'completed').length
  };
  
  const conversionRates = {
    form_to_product: conversionFunnel.total_visitors > 0 ? 
      ((conversionFunnel.product_selections / conversionFunnel.total_visitors) * 100).toFixed(2) + '%' : '0%',
    product_to_payment: conversionFunnel.product_selections > 0 ? 
      ((conversionFunnel.payment_completions / conversionFunnel.product_selections) * 100).toFixed(2) + '%' : '0%'
  };
  
  return {
    conversion_funnel: conversionFunnel,
    conversion_rates: conversionRates
  };
}

function generateGeographicAnalytics(signups: any[]) {
  const stateDistribution: { [key: string]: number } = {};
  const deliveryZoneDistribution: { [key: string]: number } = {};
  const deliveryMethodDistribution: { [key: string]: number } = {};
  
  signups.forEach(signup => {
    // State distribution
    const state = signup.geoAnalytics?.state;
    if (state) {
      stateDistribution[state] = (stateDistribution[state] || 0) + 1;
    }
    
    // Delivery zone distribution
    const zone = signup.geoAnalytics?.deliveryZone;
    if (zone) {
      deliveryZoneDistribution[zone] = (deliveryZoneDistribution[zone] || 0) + 1;
    }
    
    // Delivery method distribution
    const method = signup.geoAnalytics?.deliveryMethod;
    if (method) {
      deliveryMethodDistribution[method] = (deliveryMethodDistribution[method] || 0) + 1;
    }
  });
  
  return {
    geographic_analytics: {
      top_states: Object.entries(stateDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([state, count]) => ({ state, count })),
      delivery_zones: deliveryZoneDistribution,
      delivery_methods: deliveryMethodDistribution
    }
  };
}

function generateProductAnalytics(signups: any[]) {
  const productPopularity: { [key: string]: number } = {};
  const productRevenue: { [key: string]: number } = {};
  const productPrices = {
    "Quantum Boxers": 49000,
    "Quantum Pendant": 29000,
    "Quantum Water Bottle": 39000,
  };
  
  signups.forEach(signup => {
    if (signup.orderAnalytics?.selectedProducts) {
      signup.orderAnalytics.selectedProducts.forEach((product: string) => {
        productPopularity[product] = (productPopularity[product] || 0) + 1;
        productRevenue[product] = (productRevenue[product] || 0) + (productPrices[product as keyof typeof productPrices] || 0);
      });
    }
  });
  
  return {
    product_analytics: {
      popularity: Object.entries(productPopularity)
        .sort(([,a], [,b]) => b - a)
        .map(([product, count]) => ({ product, orders: count })),
      revenue: Object.entries(productRevenue)
        .sort(([,a], [,b]) => b - a)
        .map(([product, revenue]) => ({ product, revenue }))
    }
  };
}
