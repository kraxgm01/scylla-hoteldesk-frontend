"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { RoomCard } from "@/components/room-card"
import { AddRoomDialog } from "@/components/add-room-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Building, Search, Plus, Grid3X3, List, CheckCircle, Clock, AlertTriangle, Home, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { roomsApi } from "@/lib/api"
import { Room } from "@/types/room"

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [floorFilter, setFloorFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false)

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const roomsData = await roomsApi.getAllRooms()
      setRooms(roomsData)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      toast("Error fetching rooms", {
        description: "Failed to fetch rooms. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (roomId: string, newStatus: Room['status']) => {
    try {
      // Optimistically update the UI
      setRooms((prev) =>
        prev.map((room) =>
          room._id === roomId ? { ...room, status: newStatus, updatedAt: new Date().toISOString() } : room,
        ),
      )

      // Update the room status via API
      await roomsApi.updateRoom(roomId, { status: newStatus })
      
      toast("Room status updated", {
        description: `Room status has been changed to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating room status:", error)
      toast("Error updating room status", {
        description: "Failed to update room status. Please try again."
      })
      // Revert the optimistic update
      fetchRooms()
    }
  }

  const handleRoomCreated = (newRoom: Room) => {
    setRooms((prev) => [...prev, newRoom])
    toast("Room Created", {
      description: `Room ${newRoom.roomNumber} has been created successfully.`,
    })
  }

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || room.status === statusFilter
    const matchesType = typeFilter === "all" || room.type === typeFilter
    const matchesFloor = floorFilter === "all" || room.floor.toString() === floorFilter

    return matchesSearch && matchesStatus && matchesType && matchesFloor
  })

  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter((r) => r.status === "vacant").length,
    occupiedRooms: rooms.filter((r) => r.status === "occupied").length,
    maintenanceRooms: rooms.filter((r) => r.status === "maintenance").length,
    cleaningRooms: rooms.filter((r) => r.status === "cleaning").length,
    occupancyRate: rooms.length > 0 ? Math.round((rooms.filter((r) => r.status === "occupied").length / rooms.length) * 100) : 0,
  }

  const floors = [...new Set(rooms.map((room) => room.floor))].sort()
  const roomTypes = [...new Set(rooms.map((room) => room.type))]

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading rooms...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRooms}</div>
              <p className="text-xs text-muted-foreground">Across {floors.length} floors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.availableRooms}</div>
              <p className="text-xs text-muted-foreground">Ready for guests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.occupiedRooms}</div>
              <p className="text-xs text-muted-foreground">{stats.occupancyRate}% occupancy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.maintenanceRooms}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cleaning</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.cleaningRooms}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Rooms Management</h2>
            <p className="text-muted-foreground">Monitor and manage all hotel rooms</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
            <Button onClick={() => setAddRoomDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms by number or name..."
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
                <SelectItem value="vacant">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {floors.map((floor) => (
                  <SelectItem key={floor} value={floor.toString()}>
                    Floor {floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rooms Grid/List */}
        <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}>
          {filteredRooms.map((room) => (
            <RoomCard key={room._id} room={room} viewMode={viewMode} onStatusChange={handleStatusChange} />
          ))}
        </div>

        {filteredRooms.length === 0 && !loading && (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Add Room Dialog */}
      <AddRoomDialog
        open={addRoomDialogOpen}
        onOpenChange={setAddRoomDialogOpen}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  )
}