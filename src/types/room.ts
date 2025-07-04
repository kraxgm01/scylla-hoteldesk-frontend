export interface Room {
  _id: string;
  roomName: string;
  roomNumber: string;
  alexaDeviceId: string;
  floor: number;
  type: 'standard' | 'deluxe' | 'suite' | 'presidential';
  status: 'vacant' | 'occupied' | 'cleaning' | 'maintenance';
  currentGuest: string | null;
  features: {
    beds: number;
    maxOccupancy: number;
    hasBalcony: boolean;
    hasKitchenette: boolean;
    amenities: string[];
  };
  housekeepingStatus: {
    lastCleaned?: string;
    nextScheduled?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}


export interface CreateRoomData {
  roomName: string;
  roomNumber: string;
  alexaDeviceId: string;
  floor: number;
  type: 'standard' | 'deluxe' | 'suite' | 'presidential';
  status: 'vacant' | 'occupied' | 'cleaning' | 'maintenance';
  features: {
    beds: number;
    maxOccupancy: number;
    hasBalcony: boolean;
    hasKitchenette: boolean;
    amenities: string[];
  };
  housekeepingStatus: {
    lastCleaned?: string;
    nextScheduled?: string;
    notes?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
