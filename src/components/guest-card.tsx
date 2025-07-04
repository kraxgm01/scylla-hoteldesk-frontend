"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Settings,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Clock,
  Utensils,
  BedDouble,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roomsApi, guestsApi } from "@/lib/api";
import { Room } from "@/types/room";
import { toast } from "sonner"; // or your preferred toast lib

interface GuestPreferences {
  pillowType: string;
  dietaryRestrictions: string[];
  specialRequests: string[];
  doNotDisturb: {
    enabled: boolean;
    hours: {
      start: string;
      end: string;
    };
  };
}

interface Guest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roomNumber: string;
  room: string | null;
  checkInDate: string;
  checkOutDate: string;
  preferences: GuestPreferences;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GuestCardProps {
  guest: Guest;
  viewMode: "grid" | "list";
  onUpdate: (guestId: string, updates: any) => void;
}

const getPillowTypeColor = (type: string) => {
  switch (type) {
    case "soft":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "firm":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "hypoallergenic":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getLoyaltyTier = (points: number) => {
  if (points >= 2000) return { tier: "Platinum", color: "text-purple-600" };
  if (points >= 1000) return { tier: "Gold", color: "text-yellow-600" };
  if (points >= 500) return { tier: "Silver", color: "text-gray-600" };
  return { tier: "Bronze", color: "text-orange-600" };
};

export function GuestCard({ guest, viewMode, onUpdate }: GuestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const loyaltyInfo = getLoyaltyTier(guest.loyaltyPoints);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isCurrentlyStaying = () => {
    const now = new Date();
    const checkIn = new Date(guest.checkInDate);
    const checkOut = new Date(guest.checkOutDate);
    return guest.isActive && now >= checkIn && now <= checkOut;
  };

  // Fetch available rooms when assigning
  const openAssignRoom = async () => {
    setAssigning(true);
    try {
      const rooms = await roomsApi.getAllRooms();
      setAvailableRooms(
        rooms.filter(
          (room) => room.status === "vacant" || room.status === "available"
        )
      );
    } catch {
      setAvailableRooms([]);
    }
  };

  const handleAssignRoom = async () => {
    if (!selectedRoom) return;
    try {
      await guestsApi.assignRoom({ guestId: guest._id, roomId: selectedRoom });
      toast.success("Room assigned!");
      setAssigning(false);
      setSelectedRoom("");
      onUpdate(guest._id, { room: selectedRoom });
    } catch (e: any) {
      toast.error(e.message || "Failed to assign room");
    }
  };

  if (viewMode === "list") {
    return (
      <Card className="w-full transition-all duration-300 hover:shadow-lg overflow-visible">
        <div className="p-4">
          <div className="grid grid-cols-12 items-center gap-4">
            {/* Guest Info */}
            <div className="col-span-3 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={`/placeholder.svg?height=40&width=40&text=${getInitials(
                    guest.firstName,
                    guest.lastName
                  )}`}
                />
                <AvatarFallback>
                  {getInitials(guest.firstName, guest.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {guest.firstName} {guest.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{guest.email}</p>
              </div>
            </div>

            {/* Contact & Room */}
            <div className="col-span-3">
              <div className="flex items-center gap-1 text-sm mb-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{guest.phone}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{guest.roomNumber || "No room assigned"}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="col-span-2">
              <div className="text-sm">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(guest.checkInDate)}</span>
                </div>
                <div className="text-muted-foreground">
                  to {formatDate(guest.checkOutDate)}
                </div>
              </div>
            </div>

            {/* Status & Loyalty */}
            <div className="col-span-2">
              <Badge
                className={
                  guest.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {guest.isActive ? "Active" : "Inactive"}
              </Badge>
              <div className="flex items-center gap-1 text-sm mt-1">
                <Star className={cn("h-4 w-4", loyaltyInfo.color)} />
                <span className={loyaltyInfo.color}>{guest.loyaltyPoints}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex justify-end">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Guest
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Assign Room
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={`/placeholder.svg?height=48&width=48&text=${getInitials(
                  guest.firstName,
                  guest.lastName
                )}`}
              />
              <AvatarFallback>
                {getInitials(guest.firstName, guest.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">
                {guest.firstName} {guest.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={
                    guest.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {guest.isActive ? "Active" : "Inactive"}
                </Badge>
                {isCurrentlyStaying() && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Staying
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Guest
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Assign Room
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{guest.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{guest.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{guest.roomNumber || "No room assigned"}</span>
          </div>
        </div>

        {/* Stay Information */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Check-in: {formatDate(guest.checkInDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Check-out: {formatDate(guest.checkOutDate)}</span>
          </div>
        </div>

        {/* Loyalty & Preferences */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className={cn("h-4 w-4", loyaltyInfo.color)} />
              <span className="text-sm font-medium">{loyaltyInfo.tier}</span>
            </div>
            <span className={cn("text-sm font-bold", loyaltyInfo.color)}>
              {guest.loyaltyPoints} pts
            </span>
          </div>

          {/* Preferences Summary */}
          <div className="flex flex-wrap gap-1">
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                getPillowTypeColor(guest.preferences.pillowType)
              )}
            >
              <BedDouble className="h-3 w-3 mr-1" />
              {guest.preferences.pillowType}
            </Badge>
            {guest.preferences.dietaryRestrictions.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Utensils className="h-3 w-3 mr-1" />
                {guest.preferences.dietaryRestrictions.length} dietary
              </Badge>
            )}
            {guest.preferences.doNotDisturb.enabled && (
              <Badge variant="outline" className="text-xs">
                <BellOff className="h-3 w-3 mr-1" />
                DND
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
        {!guest.room && (
          <div className="flex-1">
            {!assigning ? (
              <Button size="sm" className="w-full" onClick={openAssignRoom}>
                <MapPin className="h-4 w-4 mr-2" />
                Assign Room
              </Button>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <select
                  className="border rounded px-2 py-1 w-full text-sm"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  <option value="">Select Room</option>
                  {availableRooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.roomName} ({room.roomNumber})
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAssignRoom}
                    disabled={!selectedRoom}
                    className="flex-1"
                  >
                    Assign
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAssigning(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
