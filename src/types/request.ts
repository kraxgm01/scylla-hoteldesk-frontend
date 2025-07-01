export interface RequestItem {
  name: string;
  quantity: number;
  notes?: string;
  _id?: string;
}

export interface RequestDetails {
  items: RequestItem[];
  timePreference?: string;
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
  message?: string;
  requestedAt?: string;
}

export interface Feedback {
  rating?: number;
  comment?: string;
}

export interface Log {
  action: string;
  performedBy?: string;
  timestamp: string;
  notes?: string;
}

export interface HotelRequest {
  _id: string;
  requestId: string;
  token: string;
  room: {
    _id: string;
  };
  roomNumber: number;
  guest: {
    _id: string;
  };
  type: 'housekeeping' | 'maintenance' | 'roomService' | 'frontDesk' | 'spa' | 'activity' | 'transport' | 'laundry';
  category?: string;
  details: RequestDetails;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string | null;
  priority: number;
  estimatedCompletionTime?: string;
  feedback?: Feedback;
  logs?: Log[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface RequestsResponse {
  success: boolean;
  data: HotelRequest[];
}