"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";
import { bookingsApi } from "@/lib/api";
import type { Booking } from "@/types/booking";

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingsApi.getAll();
        setBookings(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load bookings");
        toast("Error", { description: "Failed to load bookings" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [bookings]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Room / Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {error && bookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-10"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : sorted.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-10"
                    >
                      No bookings yet
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((b) => (
                    <TableRow
                      key={b._id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/bookings/${b._id}`)}
                    >
                      <TableCell className="font-medium">
                        {b.customerName || "-"}
                      </TableCell>
                      <TableCell>{formatDate(b.checkIn)}</TableCell>
                      <TableCell>{formatDate(b.checkOut)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4" />
                          <span>
                            {`${(b as any).adults ?? 0}`}
                            {((b as any).children_0_5 ?? 0) +
                              ((b as any).children_6_12 ?? 0) >
                            0
                              ? ` + ${
                                  ((b as any).children_0_5 ?? 0) +
                                  ((b as any).children_6_12 ?? 0)
                                } kids`
                              : ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {(b as any).roomNumber ||
                              (b as any).roomType ||
                              "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {typeof b.roomPrice === "number" ? (
                          <span>
                            {b.roomPrice.toLocaleString(undefined, {
                              style: "currency",
                              currency: "USD",
                            })}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={b.paymentConfirmed ? "default" : "secondary"}
                        >
                          <Tag className="h-3 w-3" />
                          {b.paymentStatus ||
                            (b.paymentConfirmed ? "Confirmed" : "Pending")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{b.stage || "-"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
