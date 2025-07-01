import { useState, useEffect, useCallback } from 'react';
import { HotelRequest } from '@/types/request';
import { requestsApi, ApiError } from '@/lib/api';

export interface UseRequestsReturn {
  requests: HotelRequest[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  approveRequest: (id: string) => Promise<void>;
  declineRequest: (id: string) => Promise<void>;
  updateRequestStatus: (id: string, status: HotelRequest['status']) => Promise<void>;
}

export function useRequests(): UseRequestsReturn {
  const [requests, setRequests] = useState<HotelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await requestsApi.getAll();
      setRequests(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to fetch requests';
      setError(errorMessage);
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveRequest = useCallback(async (id: string) => {
    try {
      setError(null);
      const updatedRequest = await requestsApi.approve(id);
      setRequests(prev => 
        prev.map(req => req._id === id ? updatedRequest : req)
      );
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to approve request';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const declineRequest = useCallback(async (id: string) => {
    try {
      setError(null);
      const updatedRequest = await requestsApi.decline(id);
      setRequests(prev => 
        prev.map(req => req._id === id ? updatedRequest : req)
      );
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to decline request';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateRequestStatus = useCallback(async (id: string, status: HotelRequest['status']) => {
    try {
      setError(null);
      let updatedRequest: HotelRequest;
      
      switch (status) {
        case 'completed':
          updatedRequest = await requestsApi.complete(id);
          break;
        case 'cancelled':
          updatedRequest = await requestsApi.decline(id);
          break;
        case 'assigned':
          updatedRequest = await requestsApi.approve(id);
          break;
        default:
          updatedRequest = await requestsApi.update(id, { status });
      }
      
      setRequests(prev => 
        prev.map(req => req._id === id ? updatedRequest : req)
      );
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to update request status';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    approveRequest,
    declineRequest,
    updateRequestStatus,
  };
}