// Enhanced API Service Layer
// Modern, type-safe API utilities with unified error handling

import { ApiResponse, PaginationParams } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// ============================================================================
// CORE API CLIENT
// ============================================================================

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// ============================================================================
// SERVICE INSTANCES
// ============================================================================

export const api = new ApiClient();

// ============================================================================
// DOMAIN-SPECIFIC API SERVICES
// ============================================================================

export const productService = {
  getAll: (params?: PaginationParams) => 
    api.get('/api/products', params as Record<string, string>),
  
  getById: (id: string) => 
    api.get(`/api/products/${id}`),
  
  create: (product: unknown) => 
    api.post('/api/products', product),
  
  update: (id: string, product: unknown) => 
    api.put(`/api/products/${id}`, product),
  
  delete: (id: string) => 
    api.delete(`/api/products/${id}`),
  
  getByCategory: (categoryId: string) => 
    api.get(`/api/products?categoryId=${categoryId}`),
  
  search: (query: string) => 
    api.get(`/api/products?search=${encodeURIComponent(query)}`),
};

export const categoryService = {
  getAll: () => 
    api.get('/api/categories'),
  
  getById: (id: string) => 
    api.get(`/api/categories/${id}`),
  
  create: (category: unknown) => 
    api.post('/api/categories', category),
  
  update: (id: string, category: unknown) => 
    api.put(`/api/categories/${id}`, category),
  
  delete: (id: string) => 
    api.delete(`/api/categories/${id}`),
};

export const orderService = {
  getAll: (params?: PaginationParams) => 
    api.get('/api/orders', params as Record<string, string>),
  
  getById: (id: string) => 
    api.get(`/api/orders/${id}`),
  
  create: (order: unknown) => 
    api.post('/api/orders', order),
  
  update: (id: string, order: unknown) => 
    api.put(`/api/orders/${id}`, order),
  
  updateStatus: (id: string, status: string) => 
    api.put(`/api/orders/${id}/status`, { status }),
  
  getByCustomer: (customerId: string) => 
    api.get(`/api/orders?customerId=${customerId}`),
};

export const memberService = {
  getAll: (params?: PaginationParams) => 
    api.get('/api/members', params as Record<string, string>),
  
  getById: (id: string) => 
    api.get(`/api/members/${id}`),
  
  getByEmail: (email: string) => 
    api.get(`/api/members?email=${encodeURIComponent(email)}`),
  
  create: (member: unknown) => 
    api.post('/api/members', member),
  
  update: (id: string, member: unknown) => 
    api.put(`/api/members/${id}`, member),
};

export const analyticsService = {
  getOverview: () => 
    api.get('/api/analytics?type=overview'),
  
  getConversion: () => 
    api.get('/api/analytics?type=conversion'),
  
  getGeographic: () => 
    api.get('/api/analytics?type=geographic'),
  
  getProducts: () => 
    api.get('/api/analytics?type=products'),
  
  getDashboard: () => 
    api.get('/api/dashboard'),
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function isApiResponse<T>(data: unknown): data is ApiResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    typeof (data as { success: unknown }).success === 'boolean'
  );
}

// Legacy support for existing code
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await api.post<T>(endpoint, options.body ? JSON.parse(options.body as string) : undefined);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'API request failed');
  } catch (error) {
    // Fallback to direct fetch for backward compatibility
    const url = endpoint;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'API request failed');
    }
    return res.json();
  }
}
