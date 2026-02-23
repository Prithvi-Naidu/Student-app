// Empty string = same-origin (for Vercel deployment where API runs on same domain)
const API_URL =
  process.env.NEXT_PUBLIC_API_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:4000';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Try to parse error JSON, but handle blob responses
        const contentType = response.headers.get('content-type');
        const error = contentType?.includes('application/json')
          ? await response.json().catch(() => ({
              message: `HTTP error! status: ${response.status}`,
            }))
          : {
              message: `HTTP error! status: ${response.status}`,
            };
        throw new Error(error.message || 'An error occurred');
      }

      // Handle blob responses (for file downloads)
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/octet-stream') || contentType?.includes('application/pdf')) {
        return response.blob() as unknown as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    // If data is FormData, don't stringify it
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : (data ? JSON.stringify(data) : undefined);
    const headers = isFormData
      ? options?.headers // Don't set Content-Type for FormData - browser will set it with boundary
      : {
          'Content-Type': 'application/json',
          ...(options?.headers as HeadersInit || {}),
        };
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
      headers,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    // If data is FormData, don't stringify it
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : (data ? JSON.stringify(data) : undefined);
    const headers = isFormData
      ? options?.headers // Don't set Content-Type for FormData - browser will set it with boundary
      : {
          'Content-Type': 'application/json',
          ...(options?.headers as HeadersInit || {}),
        };

    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body,
      headers,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

