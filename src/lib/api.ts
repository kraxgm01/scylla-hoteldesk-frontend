import { HotelRequest, ApiResponse, RequestsResponse } from '@/types/request';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const requestsApi = {
  // Get all requests
  getAll: async (): Promise<HotelRequest[]> => {
    const response = await fetchApi<RequestsResponse>('/requests');
    return response.data;
  },

  // Get request by ID
  getById: async (id: string): Promise<HotelRequest> => {
    const response = await fetchApi<ApiResponse<HotelRequest>>(`/requests/${id}`);
    return response.data;
  },

  // Create new request
  create: async (requestData: Partial<HotelRequest>): Promise<HotelRequest> => {
    const response = await fetchApi<ApiResponse<HotelRequest>>('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return response.data;
  },

  // Update request
  update: async (id: string, requestData: Partial<HotelRequest>): Promise<HotelRequest> => {
    const response = await fetchApi<ApiResponse<HotelRequest>>(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
    return response.data;
  },

  // Delete request
  delete: async (id: string): Promise<void> => {
    await fetchApi<ApiResponse<null>>(`/requests/${id}`, {
      method: 'DELETE',
    });
  },

  // Approve request (set status to assigned)
  approve: async (id: string): Promise<HotelRequest> => {
    const response = await fetchApi<ApiResponse<HotelRequest>>(`/requests/${id}/assign`, {
      method: 'PUT',
    });
    return response.data;
  },

  // Decline request (set status to cancelled)
  decline: async (id: string): Promise<HotelRequest> => {
    const response = await fetchApi<ApiResponse<HotelRequest>>(`/requests/${id}/cancel`, {
      method: 'PUT',
    });
    return response.data;
  },

  // Complete request
  complete: async (id: string): Promise<HotelRequest> => {
    const response = await fetchApi<ApiResponse<HotelRequest>>(`/requests/${id}/complete`, {
      method: 'PUT',
    });
    return response.data;
  },
};

export { ApiError };