import { useState, useEffect, useCallback, useRef } from 'react';
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
  isPolling: boolean;
  togglePolling: (enabled: boolean) => void;
}

export interface UseRequestsOptions {
  pollingInterval?: number; // in milliseconds, default: 60000 (1 minute)
  enablePolling?: boolean; // default: true
  pollingOnlyWhenActive?: boolean; // default: true - only poll when tab is active
}

export function useRequests(options: UseRequestsOptions = {}): UseRequestsReturn {
  const {
    pollingInterval = 60000, // 1 minute
    enablePolling = true,
    pollingOnlyWhenActive = true
  } = options;

  const [requests, setRequests] = useState<HotelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(enablePolling);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Track if the page/tab is active
  useEffect(() => {
    if (!pollingOnlyWhenActive) return;

    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      // If page becomes active and polling is enabled, fetch immediately
      if (isActiveRef.current && isPolling) {
        fetchRequests(false); // Don't show loading spinner for background updates
      }
    };

    const handleFocus = () => {
      isActiveRef.current = true;
      if (isPolling) {
        fetchRequests(false);
      }
    };

    const handleBlur = () => {
      isActiveRef.current = false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isPolling, pollingOnlyWhenActive]);

  const fetchRequests = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const data = await requestsApi.getAll();
      console.log('Fetched requests:', data);
      setRequests(data.reverse());
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to fetch requests';
      setError(errorMessage);
      console.error('Error fetching requests:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      // Only poll if polling is enabled and (tab is active OR we don't care about tab state)
      if (isPolling && (!pollingOnlyWhenActive || isActiveRef.current)) {
        fetchRequests(false); // Don't show loading spinner for automatic updates
      }
    }, pollingInterval);
  }, [pollingInterval, isPolling, pollingOnlyWhenActive, fetchRequests]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const togglePolling = useCallback((enabled: boolean) => {
    setIsPolling(enabled);
  }, []);

  // Start/stop polling based on isPolling state
  useEffect(() => {
    if (isPolling) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isPolling, startPolling, stopPolling]);

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

  // Initial fetch
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    requests,
    loading,
    error,
    refetch: () => fetchRequests(true),
    approveRequest,
    declineRequest,
    updateRequestStatus,
    isPolling,
    togglePolling,
  };
}