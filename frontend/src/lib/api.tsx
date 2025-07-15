const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    console.log('🌐 API Request:', { url, method: options.method || 'GET' });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    console.log('📡 API Response:', { status: response.status, success: data.success });

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Auth methods gọi đến Laravel Client API
  async register(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    address?: string;
    company_name?: string;
    tax_code?: string;
  }) {
    return this.request<{ 
      success: boolean; 
      user: any; 
      token: string; 
      message: string;
    }>('/customer-portal/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{ 
      success: boolean; 
      user: any; 
      token: string; 
      message: string;
    }>('/customer-portal/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);