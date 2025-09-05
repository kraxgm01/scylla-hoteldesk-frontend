export type Booking = {
  _id: string;
  checkIn: string; // ISO
  checkOut: string; // ISO
  customerName?: string;
  customerPhone?: string;
  roomPrice?: number;
  stage?: string;
  paymentStatus?: string;
  paymentConfirmed?: boolean;
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

