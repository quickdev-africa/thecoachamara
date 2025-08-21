// src/lib/api.ts
// Centralized API utility for backend/admin requests

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'; // Update default as needed

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'API request failed');
  }
  return res.json();
}

// Example usage:
// const data = await apiRequest('/admin/users');
