"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Plus, X } from "lucide-react"
import { roomsApi, ApiError } from "@/lib/api"
import { CreateRoomData, Room } from "@/types/room"

interface AddRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoomCreated?: (room: Room) => void // Optional callback when room is created
}

const roomTypes = [
  { value: "standard", label: "Standard" },
  { value: "deluxe", label: "Deluxe" },
  { value: "suite", label: "Suite" },
  { value: "presidential", label: "Presidential" },
] as const

const roomStatuses = [
  { value: "vacant", label: "Vacant" },
  { value: "occupied", label: "Occupied" },
  { value: "cleaning", label: "Cleaning" },
  { value: "maintenance", label: "Maintenance" },
] as const

const commonAmenities = [
  "TV",
  "WiFi",
  "Mini Bar",
  "Safe",
  "Air Conditioning",
  "Jacuzzi",
  "Coffee Machine",
  "Room Service",
  "Laundry Service",
  "Balcony View",
]

export function AddRoomDialog({ open, onOpenChange, onRoomCreated }: AddRoomDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [newAmenity, setNewAmenity] = useState("")

  const [formData, setFormData] = useState<CreateRoomData>({
    roomName: "",
    roomNumber: "",
    alexaDeviceId: "",
    floor: 1,
    type: "standard",
    status: "vacant",
    features: {
      beds: 1,
      maxOccupancy: 2,
      hasBalcony: false,
      hasKitchenette: false,
      amenities: [],
    },
    housekeepingStatus: {
      lastCleaned: undefined,
      nextScheduled: undefined,
      notes: undefined,
    },
  })

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CreateRoomData],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const addAmenity = (amenity: string) => {
    if (amenity && !formData.features.amenities.includes(amenity)) {
      setFormData((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          amenities: [...prev.features.amenities, amenity],
        },
      }))
    }
  }

  const removeAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        amenities: prev.features.amenities.filter((a) => a !== amenity),
      },
    }))
  }

  const handleAddCustomAmenity = () => {
    if (newAmenity.trim()) {
      addAmenity(newAmenity.trim())
      setNewAmenity("")
    }
  }

  const resetForm = () => {
    setFormData({
      roomName: "",
      roomNumber: "",
      alexaDeviceId: "",
      floor: 1,
      type: "standard",
      status: "vacant",
      features: {
        beds: 1,
        maxOccupancy: 2,
        hasBalcony: false,
        hasKitchenette: false,
        amenities: [],
      },
      housekeepingStatus: {
        lastCleaned: undefined,
        nextScheduled: undefined,
        notes: undefined,
      },
    })
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      // Basic validation
      if (!formData.roomName || !formData.roomNumber || !formData.alexaDeviceId) {
        toast.error("Validation Error", {
          description: "Please fill in all required fields.",
        })
        return
      }

      // Prepare data for API
      const roomData: CreateRoomData = {
        ...formData,
        housekeepingStatus: {
          ...formData.housekeepingStatus,
          // Convert datetime-local strings to ISO strings if provided
          lastCleaned: formData.housekeepingStatus.lastCleaned
            ? new Date(formData.housekeepingStatus.lastCleaned).toISOString()
            : undefined,
          nextScheduled: formData.housekeepingStatus.nextScheduled
            ? new Date(formData.housekeepingStatus.nextScheduled).toISOString()
            : undefined,
          notes: formData.housekeepingStatus.notes?.trim() || undefined,
        },
      }

      // Remove undefined values to keep the payload clean
      if (!roomData.housekeepingStatus.lastCleaned) {
        delete roomData.housekeepingStatus.lastCleaned
      }
      if (!roomData.housekeepingStatus.nextScheduled) {
        delete roomData.housekeepingStatus.nextScheduled
      }
      if (!roomData.housekeepingStatus.notes) {
        delete roomData.housekeepingStatus.notes
      }

      // Make API call
      const createdRoom = await roomsApi.createRoom(roomData)

      toast.success("Room Created", {
        description: `Room ${formData.roomNumber} has been created successfully.`,
      })

      // Call the callback if provided
      if (onRoomCreated) {
        onRoomCreated(createdRoom)
      }

      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating room:", error)
      
      if (error instanceof ApiError) {
        toast.error("Error", {
          description: error.message,
        })
      } else {
        toast.error("Error", {
          description: "Failed to create room. Please try again.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>Create a new room in the hotel system.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="roomName">
                  Room Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="roomName"
                  placeholder="e.g., Deluxe Suite 101"
                  value={formData.roomName}
                  onChange={(e) => handleInputChange("roomName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNumber">
                  Room Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="roomNumber"
                  placeholder="e.g., 101"
                  value={formData.roomNumber}
                  onChange={(e) => handleInputChange("roomNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alexaDeviceId">
                  Alexa Device ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="alexaDeviceId"
                  placeholder="amzn1.ask.device..."
                  value={formData.alexaDeviceId}
                  onChange={(e) => handleInputChange("alexaDeviceId", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">
                  Floor <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="floor"
                  type="number"
                  min="1"
                  value={formData.floor}
                  onChange={(e) => handleInputChange("floor", Number.parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Room Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Room Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Room Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="beds">Number of Beds</Label>
                  <Input
                    id="beds"
                    type="number"
                    min="1"
                    value={formData.features.beds}
                    onChange={(e) => handleInputChange("features.beds", Number.parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxOccupancy">Max Occupancy</Label>
                  <Input
                    id="maxOccupancy"
                    type="number"
                    min="1"
                    value={formData.features.maxOccupancy}
                    onChange={(e) => handleInputChange("features.maxOccupancy", Number.parseInt(e.target.value) || 2)}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasBalcony"
                    checked={formData.features.hasBalcony}
                    onCheckedChange={(checked) => handleInputChange("features.hasBalcony", checked)}
                  />
                  <Label htmlFor="hasBalcony">Has Balcony</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasKitchenette"
                    checked={formData.features.hasKitchenette}
                    onCheckedChange={(checked) => handleInputChange("features.hasKitchenette", checked)}
                  />
                  <Label htmlFor="hasKitchenette">Has Kitchenette</Label>
                </div>
              </div>

              <Separator />

              {/* Amenities */}
              <div className="space-y-3">
                <Label>Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {commonAmenities.map((amenity) => (
                    <Button
                      key={amenity}
                      type="button"
                      variant={formData.features.amenities.includes(amenity) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (formData.features.amenities.includes(amenity)) {
                          removeAmenity(amenity)
                        } else {
                          addAmenity(amenity)
                        }
                      }}
                    >
                      {amenity}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom amenity"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddCustomAmenity()}
                  />
                  <Button type="button" variant="outline" onClick={handleAddCustomAmenity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.features.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                        {amenity}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeAmenity(amenity)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Housekeeping Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Housekeeping Status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lastCleaned">Last Cleaned</Label>
                <Input
                  id="lastCleaned"
                  type="datetime-local"
                  value={formData.housekeepingStatus.lastCleaned || ""}
                  onChange={(e) => handleInputChange("housekeepingStatus.lastCleaned", e.target.value || undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextScheduled">Next Scheduled</Label>
                <Input
                  id="nextScheduled"
                  type="datetime-local"
                  value={formData.housekeepingStatus.nextScheduled || ""}
                  onChange={(e) => handleInputChange("housekeepingStatus.nextScheduled", e.target.value || undefined)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about the room..."
                  value={formData.housekeepingStatus.notes || ""}
                  onChange={(e) => handleInputChange("housekeepingStatus.notes", e.target.value || undefined)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}