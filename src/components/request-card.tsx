"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Check,
  X,
  Phone,
  User,
  MapPin,
  Clock,
  ChevronDown,
  TentIcon as Towel,
  Coffee,
  Utensils,
  Wrench,
  Hash,
  ClipboardList,
  Star,
  AlertCircle,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Interfaces remain the same
interface RequestItem {
  name: string;
  quantity: number;
  _id: string;
}

interface RequestDetails {
  items: RequestItem[];
}

interface HotelRequest {
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
  type: string;
  category: string;
  details: RequestDetails;
  urgency: string;
  status: string;
  assignedTo: string | null;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface RequestCardProps {
  request: HotelRequest;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onCall: (id: string) => void;
}

// Helper functions remain the same
const getTypeIcon = (type: string, category: string) => {
  if (type === "housekeeping") {
    if (category === "amenities") return Towel;
    return Wrench;
  }
  if (type === "room_service") return Utensils;
  if (type === "maintenance") return Wrench;
  return Coffee;
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "normal":
      return "secondary";
    default:
      return "secondary";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "declined":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "completed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

// DetailRow component for the expanded view
const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
    <span className="font-medium text-right">{value}</span>
  </div>
);

export function RequestCard({
  request,
  onApprove,
  onDecline,
  onCall,
}: RequestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const TypeIcon = getTypeIcon(request.type, request.category);

  const timeAgo = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  };

  const itemsSummary =
    request.details.items
      .map((item) => `${item.quantity}x ${item.name}`)
      .join(", ") || "No items";

  return (
    <Card
      className={cn(
        "w-full transition-all duration-300",
        isExpanded ? "shadow-lg" : "shadow-sm"
      )}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="grid grid-cols-12 items-center gap-4">
          {/* Left section: Type & Room */}
          <div className="col-span-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-muted">
              <TypeIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-base capitalize">
                {request.type.replace("_", " ")}
              </h3>
              <p className="text-sm text-muted-foreground">
                Room{" "}
                <span className="font-medium text-foreground">
                  {request.roomNumber}
                </span>
              </p>
            </div>
          </div>

          {/* Middle section: Details */}
          <div className="col-span-5 hidden md:flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="truncate" title={itemsSummary}>
                {itemsSummary}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="capitalize">{request.urgency} Urgency</span>
            </div>
          </div>

          {/* Right section: Status & Guest */}
          <div className="col-span-8 md:col-span-3 flex items-center justify-end gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 hidden sm:flex">
                <AvatarImage
                  src={`/placeholder.svg?height=36&width=36&text=G`}
                />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <Badge
                  className={cn("text-xs mb-1", getStatusColor(request.status))}
                >
                  {request.status}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {timeAgo(request.createdAt)}
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t animate-in fade-in-0 duration-300">
          <CardContent className="p-4 pt-4">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Request Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Request Details</h4>
                <div className="space-y-2">
                  <DetailRow
                    icon={ClipboardList}
                    label="Request ID"
                    value={request.requestId}
                  />
                  <DetailRow icon={Hash} label="Token" value={request.token} />
                  <DetailRow
                    icon={Star}
                    label="Priority"
                    value={`${request.priority} / 10`}
                  />
                  <DetailRow
                    icon={Clock}
                    label="Created At"
                    value={new Date(request.createdAt).toLocaleString()}
                  />
                </div>
              </div>

              {/* Guest & Room Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Guest & Room</h4>
                <div className="space-y-2">
                  <DetailRow
                    icon={User}
                    label="Guest ID"
                    value={`...${request.guest}`}
                  />
                  <DetailRow
                    icon={MapPin}
                    label="Room Number"
                    value={request.roomNumber}
                  />
                  {request.assignedTo && (
                    <DetailRow
                      icon={User}
                      label="Assigned To"
                      value={request.assignedTo}
                    />
                  )}
                </div>
              </div>

              {/* Items Requested */}
              <div className="md:col-span-2 space-y-3">
                <h4 className="font-semibold text-sm">Items Requested</h4>
                <div className="space-y-2">
                  {request.details.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center p-2 bg-muted rounded-md text-sm"
                    >
                      <span className="capitalize">{item.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        Quantity: {item.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 p-3 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCall(request._id)}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Guest
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDecline(request._id)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
            <Button size="sm" onClick={() => onApprove(request._id)}>
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </CardFooter>
        </div>
      )}
    </Card>
  );
}
