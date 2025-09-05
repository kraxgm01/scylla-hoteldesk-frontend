"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { GuestCard } from "@/components/guest-card";
import { AddGuestDialog } from "@/components/add-guest-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserCheck,
  UserX,
  Star,
  Search,
  Plus,
  Grid3X3,
  List,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { guestsApi } from "@/lib/api";
import { Guest } from "@/types/guests";

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch guests from API
  const fetchGuests = async () => {
    try {
      setLoading(true);
      const response = await guestsApi.getAllGuests();
      setGuests(response.data);
    } catch (error) {
      console.error("Error fetching guests:", error);
      toast("Error", {
        description: "Failed to fetch guests. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchGuests();
  }, []);

  const handleGuestUpdate = (guestId: string, updates: any) => {
    setGuests((prev) =>
      prev.map((guest) =>
        guest._id === guestId
          ? { ...guest, ...updates, updatedAt: new Date().toISOString() }
          : guest
      )
    );
    toast("Guest Updated", {
      description: "Guest information has been updated successfully.",
    });
  };

  const handleGuestCreated = (newGuest: Guest) => {
    setGuests((prev) => [newGuest, ...prev]);
    toast("Guest Created", {
      description: `Guest ${newGuest.firstName} ${newGuest.lastName} has been created successfully.`,
    });
  };

  const handleRoomAssignment = async (guestId: string, roomId: string) => {
    try {
      const response = await guestsApi.assignRoom({ guestId, roomId });
      setGuests((prev) =>
        prev.map((guest) => (guest._id === guestId ? response.data : guest))
      );
      toast("Room Assigned", {
        description: "Room has been assigned successfully.",
      });
    } catch (error) {
      console.error("Error assigning room:", error);
      toast("Error", {
        description: "Failed to assign room. Please try again.",
      });
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.includes(searchTerm) ||
      guest.roomNumber.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? guest.isActive : !guest.isActive);

    const matchesRoom =
      roomFilter === "all" ||
      (roomFilter === "assigned"
        ? guest.room
        : roomFilter === "unassigned"
        ? !guest.room
        : true);

    return matchesSearch && matchesStatus && matchesRoom;
  });

  const stats = {
    totalGuests: guests.length,
    activeGuests: guests.filter((g) => g.isActive).length,
    checkedInGuests: guests.filter((g) => g.isActive && g.room).length,
    pendingCheckIn: guests.filter((g) => g.isActive && !g.room).length,
    totalLoyaltyPoints: guests.reduce((sum, g) => sum + g.loyaltyPoints, 0),
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading guests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Guests
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGuests}</div>
              <p className="text-xs text-muted-foreground">
                All time registrations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Guests
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeGuests}
              </div>
              <p className="text-xs text-muted-foreground">Currently staying</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checked In</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.checkedInGuests}
              </div>
              <p className="text-xs text-muted-foreground">
                With assigned rooms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Check-in
              </CardTitle>
              <UserX className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingCheckIn}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting room assignment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Loyalty Points
              </CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalLoyaltyPoints.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total across all guests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Header and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Guests Management
            </h2>
            <p className="text-muted-foreground">
              Monitor and manage all hotel guests
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Guest
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guests by name, email, phone, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Room Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Guests</SelectItem>
                <SelectItem value="assigned">Room Assigned</SelectItem>
                <SelectItem value="unassigned">No Room</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Guests Grid/List */}
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          }
        >
          {filteredGuests.map((guest) => (
            <GuestCard
              key={guest._id}
              guest={guest}
              viewMode={viewMode}
              onUpdate={handleGuestUpdate}
            />
          ))}
        </div>

        {filteredGuests.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No guests found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      <AddGuestDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onGuestCreated={handleGuestCreated}
      />
    </div>
  );
}
