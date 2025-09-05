export type Booking = {
  _id: string;
  checkIn: string; // ISO
  checkOut: string; // ISO
  customerName?: string;
  customerPhone?: string;
  // Pricing and status
  roomPrice?: number;
  stage?: string;
  paymentStatus?: string;
  paymentConfirmed?: boolean;
  // Optional room and summary fields coming from backend/summary
  roomNumber?: string;
  roomType?: string;
  areaId?: string;
  adults?: number;
  children_0_5?: number;
  children_6_12?: number;
  createdAt: string;
  updatedAt: string;
  // Optional UI helpers
  bookingSummary?: string;
};

export type BookingsResponse = {
  success: boolean;
  data: Booking[];
};

export type BookingResponse = {
  success: boolean;
  data: Booking;
};

