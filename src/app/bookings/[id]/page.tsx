"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  CalendarDays,
  User,
  Users,
  Hash,
  Tag,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
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

function extractRoomInfo(summary?: string): {
  roomType?: string;
  roomNumber?: string;
  areaId?: string;
} {
  if (!summary) return {};
  const lines = summary.split(/\r?\n/);
  let roomType: string | undefined;
  let roomNumber: string | undefined;
  let areaId: string | undefined;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!roomType) {
      const m = line.match(/room\s*type\s*:\s*(.+)/i);
      if (m && m[1]) {
        roomType = m[1].trim();
      }
    }
    if (!roomNumber) {
      const n =
        line.match(/area\s*id\s*:?\s*(\d+)/i) ||
        line.match(/areaid\s*:?\s*(\d+)/i);
      if (n && n[1]) {
        areaId = n[1].trim();
        roomNumber = areaId;
      }
    }
    if (roomType && roomNumber) break;
  }
  return { roomType, roomNumber, areaId };
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingsApi.getById(id);
        setBooking(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load booking");
        toast("Error", { description: "Failed to load booking" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading booking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <div className="flex-1 p-6 space-y-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <AlertCircle className="h-6 w-6 mx-auto mb-2" />
              {error}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const adults = (booking as any).adults ?? 0;
  const c05 = (booking as any).children_0_5 ?? 0;
  const c612 = (booking as any).children_6_12 ?? 0;
  const totalKids = c05 + c612;

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex-1 p-6 space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Booking Details</span>
              <Badge
                variant={booking.paymentConfirmed ? "default" : "secondary"}
              >
                <Tag className="h-3 w-3" />{" "}
                {booking.paymentStatus ||
                  (booking.paymentConfirmed ? "Confirmed" : "Pending")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4" />{" "}
                  <span className="text-muted-foreground">ID</span>
                </div>
                <div className="font-mono text-sm break-all">{booking._id}</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />{" "}
                  <span className="text-muted-foreground">Customer</span>
                </div>
                <div className="text-sm">{booking.customerName || "-"}</div>
                <div className="text-xs text-muted-foreground">
                  {booking.customerPhone || "-"}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CalendarDays className="h-4 w-4" /> Check-in
                </div>
                <div className="text-sm">{formatDate(booking.checkIn)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CalendarDays className="h-4 w-4" /> Check-out
                </div>
                <div className="text-sm">{formatDate(booking.checkOut)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="h-4 w-4" /> Guests
                </div>
                <div className="text-sm">
                  {adults} adult{adults === 1 ? "" : "s"}
                  {totalKids
                    ? `, ${totalKids} kid${totalKids === 1 ? "" : "s"}`
                    : ""}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Room #</div>
                <div className="text-sm">
                  {(() => {
                    const inferred = extractRoomInfo(
                      (booking as any).bookingSummary
                    );
                    const roomId = (booking as any).areaId || inferred.areaId;
                    return roomId || "-";
                  })()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Room / Type
                </div>
                <div className="text-sm">
                  {(() => {
                    const inferred = extractRoomInfo(
                      (booking as any).bookingSummary
                    );
                    const roomNumber =
                      (booking as any).roomNumber ||
                      inferred.roomNumber ||
                      (booking as any).areaId ||
                      inferred.areaId;
                    const roomType =
                      (booking as any).roomType || inferred.roomType;
                    const text =
                      [roomNumber, roomType].filter(Boolean).join(" / ") || "-";
                    return text;
                  })()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Price</div>
                <div className="text-sm">
                  {typeof booking.roomPrice === "number"
                    ? booking.roomPrice.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Stage</div>
                <Badge variant="outline">{booking.stage || "-"}</Badge>
              </div>
            </div>

            {(booking as any).bookingSummary && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Summary
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {(booking as any).bookingSummary}
                </div>
              </div>
            )}

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Created</div>
                <div className="text-sm">{formatDate(booking.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Updated</div>
                <div className="text-sm">{formatDate(booking.updatedAt)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {booking.paymentConfirmed ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Payment confirmed
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" /> Payment pending
            </>
          )}
        </div>
      </div>
    </div>
  );
}
