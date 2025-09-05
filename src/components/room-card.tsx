"use client";
import { useState } from "react";
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
  User,
  Bed,
  Users,
  Wifi,
  Tv,
  Coffee,
  Waves,
  Shield,
  ChefHat,
  Calendar,
  Clock,
  Settings,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Home,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roomsApi } from "@/lib/api";
import { toast } from "sonner";
import type { Room } from "@/types/room";

interface RoomCardProps {
  room: Room;
  viewMode: "grid" | "list";
  onStatusChange: (
    roomId: string,
    newStatus: Room["status"]
  ) => void | Promise<void>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "vacant":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "occupied":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "maintenance":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "cleaning":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "vacant":
      return CheckCircle;
    case "occupied":
      return User;
    case "maintenance":
      return AlertTriangle;
    case "cleaning":
      return Clock;
    default:
      return Home;
  }
};

const getAmenityIcon = (amenity: string) => {
  switch (amenity.toLowerCase()) {
    case "tv":
      return Tv;
    case "wifi":
      return Wifi;
    case "mini bar":
      return Coffee;
    case "jacuzzi":
      return Waves;
    case "safe":
      return Shield;
    case "kitchenette":
      return ChefHat;
    default:
      return Home;
  }
};

const getRoomTypeColor = (type: string) => {
  switch (type) {
    case "premium":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "deluxe":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "standard":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    case "economy":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

// Function to determine base occupancy status
const getBaseOccupancyStatus = (
  currentGuest: string | null
): "occupied" | "vacant" => {
  return currentGuest ? "occupied" : "vacant";
};

// Function to check if status is a maintenance type
const isMaintenanceStatus = (status: string) => {
  return status === "maintenance" || status === "cleaning";
};

export function RoomCard({ room, viewMode, onStatusChange }: RoomCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const baseStatus = getBaseOccupancyStatus(room.currentGuest);
  const isInMaintenance = isMaintenanceStatus(room.status);
  const StatusIcon = getStatusIcon(baseStatus);

  const timeAgo = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  };

  const handleDeleteRoom = async () => {
    setDeleting(true);
    try {
      await roomsApi.deleteRoom(room._id);
      toast.success("Room deleted!");
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete room");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = (value: string) => {
    let newStatus: Room["status"];

    if (value === "none") {
      // Reset to base occupancy status
      newStatus = baseStatus;
    } else {
      // Set to maintenance/cleaning status
      newStatus = value as Room["status"];
    }

    onStatusChange(room._id, newStatus);
  };

  if (viewMode === "list") {
    return (
      <Card className="w-full">
        <div className="p-4">
          <div className="grid grid-cols-12 items-center gap-4">
            {/* Room Info */}
            <div className="col-span-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Building className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">{room.roomName}</h3>
                <p className="text-sm text-muted-foreground">
                  Floor {room.floor} • Room {room.roomNumber}
                </p>
              </div>
            </div>

            {/* Type & Features */}
            <div className="col-span-3">
              <Badge
                className={cn("mb-1", getRoomTypeColor(room.type))}
                variant="secondary"
              >
                {room.type}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Bed className="h-4 w-4" />
                <span>{room.features.beds} beds</span>
                <Users className="h-4 w-4 ml-2" />
                <span>{room.features.maxOccupancy} max</span>
              </div>
            </div>

            {/* Status Display */}
            <div className="col-span-2">
              <div className="flex flex-col gap-1">
                <Badge
                  className={cn("text-xs", getStatusColor(baseStatus))}
                  variant="secondary"
                >
                  {baseStatus}
                </Badge>
                {isInMaintenance && (
                  <Badge
                    className={cn("text-xs", getStatusColor(room.status))}
                    variant="outline"
                  >
                    {room.status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Guest */}
            <div className="col-span-2">
              {room.currentGuest ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`/placeholder.svg?height=32&width=32&text=G`}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Guest</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No guest</span>
              )}
            </div>

            {/* Actions */}
            <div className="col-span-2 flex justify-end gap-2">
              <Select
                value={isInMaintenance ? room.status : "none"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Set status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleDeleteRoom}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleting ? "Deleting..." : "Delete"}
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
          <div>
            <h3 className="font-semibold text-lg">{room.roomName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={cn("text-xs", getRoomTypeColor(room.type))}
                variant="secondary"
              >
                {room.type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Floor {room.floor} • Room {room.roomNumber}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDeleteRoom}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <div className="flex flex-col gap-1">
              <Badge className={cn("text-xs", getStatusColor(baseStatus))}>
                {baseStatus}
              </Badge>
              {isInMaintenance && (
                <Badge
                  className={cn("text-xs", getStatusColor(room.status))}
                  variant="outline"
                >
                  {room.status}
                </Badge>
              )}
            </div>
          </div>
          {room.currentGuest && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/placeholder.svg?height=32&width=32&text=G`} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Room Features */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span>{room.features.beds} beds</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{room.features.maxOccupancy} max</span>
            </div>
          </div>

          {/* Special Features */}
          <div className="flex flex-wrap gap-1">
            {room.features.hasBalcony && (
              <Badge variant="outline" className="text-xs">
                Balcony
              </Badge>
            )}
            {room.features.hasKitchenette && (
              <Badge variant="outline" className="text-xs">
                Kitchenette
              </Badge>
            )}
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1">
            {room.features.amenities.slice(0, 3).map((amenity) => {
              const AmenityIcon = getAmenityIcon(amenity);
              return (
                <div
                  key={amenity}
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                >
                  <AmenityIcon className="h-3 w-3" />
                  <span>{amenity}</span>
                </div>
              );
            })}
            {room.features.amenities.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{room.features.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Housekeeping Info */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              Last cleaned: {timeAgo(room.housekeepingStatus?.lastCleaned)}
            </span>
          </div>
          {room.housekeepingStatus?.notes && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {room.housekeepingStatus?.notes}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <p className="m-0">Set maintenance:</p>
          <div className="w-48">
            <Select
              value={isInMaintenance ? room.status : "none"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Set maintenance status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
