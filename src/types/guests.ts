// types/guests.ts
export interface Guest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roomNumber: string;
  room: string | null;
  checkInDate: string;
  checkOutDate: string;
  preferences: {
    pillowType: "soft" | "firm" | "hypoallergenic";
    dietaryRestrictions: string[];
    specialRequests: string[];
    doNotDisturb: {
      enabled: boolean;
      hours: {
        start: string;
        end: string;
      };
    };
  };
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  room?: string;
  checkInDate: string;
  checkOutDate: string;
  preferences: {
    pillowType: "soft" | "firm" | "hypoallergenic";
    dietaryRestrictions: string[];
    specialRequests: string[];
    doNotDisturb: {
      enabled: boolean;
      hours: {
        start: string;
        end: string;
      };
    };
  };
  loyaltyPoints: number;
}

export interface AssignRoomData {
  guestId: string;
  roomId: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  roomName: string;
  type: string;
  status: "available" | "occupied" | "maintenance" | "reserved";
  currentGuest?: string;
}