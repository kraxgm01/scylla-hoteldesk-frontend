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
  MessageSquare,
  Calendar,
  Users,
  FileText,
  Timer,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Updated interfaces to match backend schema
interface RequestItem {
  name: string;
  quantity: number;
  notes?: string;
  _id: string;
}

interface RequestDetails {
  items: RequestItem[];
  timePreference?: string;
  urgency: "low" | "normal" | "high" | "urgent";
  message?: string;
  requestedAt?: string;
}

interface LogEntry {
  action: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

interface Feedback {
  rating?: number;
  comment?: string;
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
    name?: string; // Assuming guest name might be populated
  };
  type: "housekeeping" | "maintenance" | "roomService" | "frontDesk" | "spa" | "activity" | "transport" | "laundry";
  category?: string;
  details: RequestDetails;
  status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled";
  assignedTo?: {
    _id: string;
    name: string;
  } | null;
  priority: number;
  estimatedCompletionTime?: string;
  feedback?: Feedback;
  logs?: LogEntry[];
  createdAt: string;
  updatedAt: string;
}

interface RequestCardProps {
  request: HotelRequest;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onAssign: (id: string) => void;
  onCall: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

// Enhanced helper functions
const getTypeIcon = (type: string, category?: string) => {
  switch (type) {
    case "housekeeping":
      return category === "amenities" ? Towel : Wrench;
    case "roomService":
      return Utensils;
    case "maintenance":
      return Wrench;
    case "frontDesk":
      return Users;
    case "spa":
      return Coffee;
    case "activity":
      return Calendar;
    case "transport":
      return MapPin;
    case "laundry":
      return Towel;
    default:
      return Coffee;
  }
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "urgent":
      return "bg-red-500 text-white";
    case "high":
      return "bg-orange-500 text-white";
    case "normal":
      return "bg-blue-500 text-white";
    case "low":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "assigned":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "in-progress":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getPriorityColor = (priority: number) => {
  if (priority >= 8) return "text-red-600 font-bold";
  if (priority >= 6) return "text-orange-600 font-semibold";
  if (priority >= 4) return "text-yellow-600 font-medium";
  return "text-green-600";
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
  onAssign,
  onCall,
  onUpdateStatus,
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

  const formatEstimatedTime = (time?: string) => {
    if (!time) return "Not set";
    const date = new Date(time);
    const now = new Date();
    const diffMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes < 0) return "Overdue";
    if (diffMinutes < 60) return `${diffMinutes}m remaining`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h remaining`;
    return `${Math.floor(diffMinutes / 1440)}d remaining`;
  };

  const itemsSummary =
    request.details.items
      .map((item) => `${item.quantity || 1}x ${item.name}`)
      .join(", ") || "No items";

  const hasUrgentItems = request.details.items.some(item => item.notes?.toLowerCase().includes('urgent'));
  const isOverdue = request.estimatedCompletionTime && new Date(request.estimatedCompletionTime) < new Date();

  return (
    <Card
      className={cn(
        "w-full transition-all duration-300 border-l-4",
        isExpanded ? "shadow-lg" : "shadow-sm",
        request.details.urgency === "urgent" && "border-l-red-500",
        request.details.urgency === "high" && "border-l-orange-500",
        request.details.urgency === "normal" && "border-l-blue-500",
        request.details.urgency === "low" && "border-l-gray-500",
        isOverdue && "bg-red-50 dark:bg-red-950"
      )}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="grid grid-cols-12 items-center gap-4">
          {/* Left section: Type & Room */}
          <div className="col-span-4 flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-lg",
              request.details.urgency === "urgent" ? "bg-red-100 text-red-600" : "bg-muted"
            )}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base capitalize">
                  {request.type === "roomService" ? "Room Service" : request.type.replace("_", " ")}
                </h3>
                {hasUrgentItems && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Room{" "}
                <span className="font-medium text-foreground">
                  {request.roomNumber}
                </span>
                {request.category && (
                  <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                    {request.category}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Middle section: Enhanced Details */}
          <div className="col-span-5 hidden md:flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="truncate" title={itemsSummary}>
                {itemsSummary}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs", getUrgencyColor(request.details.urgency))}>
                {request.details.urgency.toUpperCase()}
              </Badge>
              <Badge className={cn("text-xs", getPriorityColor(request.priority))}>
                P{request.priority}
              </Badge>
              {request.details.timePreference && (
                <span className="text-xs text-muted-foreground">
                  {request.details.timePreference}
                </span>
              )}
            </div>
          </div>

          {/* Right section: Status & Assignment */}
          <div className="col-span-8 md:col-span-3 flex items-center justify-end gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <Badge
                  className={cn("text-xs mb-1", getStatusColor(request.status))}
                >
                  {request.status.replace("-", " ")}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {timeAgo(request.createdAt)}
                </p>
                {request.assignedTo && (
                  <p className="text-xs text-blue-600 font-medium">
                    → {request.assignedTo.name}
                  </p>
                )}
              </div>
              <Avatar className="h-9 w-9 hidden sm:flex">
                <AvatarImage
                  src={`/placeholder.svg?height=36&width=36&text=${request.guest.name?.[0] || 'G'}`}
                />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
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
                    value={
                      <span className={getPriorityColor(request.priority)}>
                        {request.priority} / 10
                      </span>
                    }
                  />
                  <DetailRow
                    icon={Clock}
                    label="Created"
                    value={new Date(request.createdAt).toLocaleString()}
                  />
                  {request.details.requestedAt && (
                    <DetailRow
                      icon={Calendar}
                      label="Requested For"
                      value={request.details.requestedAt}
                    />
                  )}
                </div>
              </div>

              {/* Assignment & Timeline */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Assignment & Timeline</h4>
                <div className="space-y-2">
                  <DetailRow
                    icon={User}
                    label="Guest"
                    value={request.guest.name || `ID: ${request.guest}`}
                  />
                  <DetailRow
                    icon={MapPin}
                    label="Room"
                    value={request.roomNumber}
                  />
                  {/* <DetailRow
                    icon={UserCheck}
                    label="Assigned To"
                    value={request.assignedTo?.name || "Unassigned"}
                  />
                  <DetailRow
                    icon={Timer}
                    label="Completion Time"
                    value={
                      <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                        {formatEstimatedTime(request.estimatedCompletionTime)}
                      </span>
                    }
                  /> */}
                </div>
              </div>

              {/* Guest Message */}
              {request.details.message && (
                <div className="md:col-span-2 space-y-3">
                  <h4 className="font-semibold text-sm">Guest Message</h4>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm">{request.details.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Requested */}
              <div className="md:col-span-2 space-y-3">
                <h4 className="font-semibold text-sm">Items Requested</h4>
                <div className="space-y-2">
                  {request.details.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col gap-2 p-3 bg-muted rounded-md"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{item.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          Qty: {item.quantity || 1}
                        </Badge>
                      </div>
                      {item.notes && (
                        <div className="text-xs text-muted-foreground border-l-2 border-muted-foreground pl-2">
                          <span className="font-medium">Note:</span> {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {request.feedback && (
                <div className="md:col-span-2 space-y-3">
                  <h4 className="font-semibold text-sm">Guest Feedback</h4>
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < (request.feedback?.rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {request.feedback.rating}/5
                      </span>
                    </div>
                    {request.feedback.comment && (
                      <p className="text-sm text-muted-foreground">
                        {request.feedback.comment}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {request.logs && request.logs.length > 0 && (
                <div className="md:col-span-2 space-y-3">
                  <h4 className="font-semibold text-sm">Recent Activity</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {request.logs.slice(-3).map((log, index) => (
                      <div key={index} className="text-xs p-2 bg-muted rounded">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{log.action}</span>
                          <span className="text-muted-foreground">
                            {timeAgo(log.timestamp)}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-muted-foreground mt-1">{log.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="bg-muted/50 p-3 flex justify-between">
            <div className="flex gap-2">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => onCall(request._id)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Guest
              </Button>
              {request.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAssign(request._id)}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assign Staff
                </Button>
              )} */}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDecline(request._id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
              {request.status === "pending" && (
                <Button size="sm" onClick={() => onApprove(request._id)}>
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
              {request.status === "assigned" && (
                <Button 
                  size="sm" 
                  onClick={() => onUpdateStatus(request._id, "in-progress")}
                >
                  Assigned
                </Button>
              )}
              {request.status === "in-progress" && (
                <Button 
                  size="sm" 
                  onClick={() => onUpdateStatus(request._id, "completed")}
                >
                  Complete
                </Button>
              )}
            </div>
          </CardFooter>
        </div>
      )}
    </Card>
  );
}