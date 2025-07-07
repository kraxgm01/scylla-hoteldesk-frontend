"use client"

import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, X, User, Calendar, Settings, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { guestsApi, roomsApi } from "@/lib/api"
import { Guest, CreateGuestData, Room } from "@/types/guests"

interface AddGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGuestCreated: (guest: Guest) => void
}

interface GuestFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  room: string
  checkInDate: string
  checkOutDate: string
  preferences: {
    pillowType: "soft" | "firm" | "hypoallergenic"
    dietaryRestrictions: string[]
    specialRequests: string[]
    doNotDisturb: {
      enabled: boolean
      hours: {
        start: string
        end: string
      }
    }
  }
  loyaltyPoints: number
}

// You'll need to create a rooms API endpoint or fetch available rooms
const mockAvailableRooms: Room[] = [
  { _id: "68626dec8a5d0ae3b03f3c05", roomNumber: "205", roomName: "Standard Room 205", type: "standard", status: "available" },
  { _id: "68626dec8a5d0ae3b03f3c08", roomNumber: "220", roomName: "Deluxe Room 220", type: "deluxe", status: "available" },
  { _id: "68626dec8a5d0ae3b03f3c10", roomNumber: "301", roomName: "Suite 301", type: "suite", status: "available" },
]

const pillowTypes = [
  { value: "soft", label: "Soft" },
  { value: "firm", label: "Firm" },
  { value: "hypoallergenic", label: "Hypoallergenic" },
]

const commonDietaryRestrictions = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Nut allergy",
  "Shellfish allergy",
  "Kosher",
  "Halal",
]

const commonSpecialRequests = [
  "Late checkout",
  "Early check-in",
  "Extra towels",
  "Room service",
  "Quiet room",
  "High floor",
  "Low floor",
  "Near elevator",
  "Away from elevator",
]

export function AddGuestDialog({ open, onOpenChange, onGuestCreated }: AddGuestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [newDietaryRestriction, setNewDietaryRestriction] = useState("")
  const [newSpecialRequest, setNewSpecialRequest] = useState("")
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])

  // Fetch available rooms from backend when dialog opens
  useEffect(() => {
    if (open) {
      // Set default dates
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      setFormData((prev) => ({
        ...prev,
        checkInDate: today.toISOString().split("T")[0],
        checkOutDate: tomorrow.toISOString().split("T")[0],
      }))

      // Fetch available rooms
      roomsApi.getAllRooms()
        .then((rooms) => {
          // Only show rooms that are available
          setAvailableRooms(rooms.filter((room) => room.status === "vacant"))
        })
        .catch(() => {
          setAvailableRooms([])
        })
    }
  }, [open])

  const [formData, setFormData] = useState<GuestFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    room: "",
    checkInDate: "",
    checkOutDate: "",
    preferences: {
      pillowType: "soft",
      dietaryRestrictions: [],
      specialRequests: [],
      doNotDisturb: {
        enabled: false,
        hours: {
          start: "22:00",
          end: "08:00",
        },
      },
    },
    loyaltyPoints: 0,
  })

  // Set default dates when dialog opens
  useEffect(() => {
    if (open) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      setFormData((prev) => ({
        ...prev,
        checkInDate: today.toISOString().split("T")[0],
        checkOutDate: tomorrow.toISOString().split("T")[0],
      }))
    }
  }, [open])

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const keys = field.split(".")
      setFormData((prev) => {
        const newData = { ...prev }
        let current: any = newData
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = value
        return newData
      })
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const addDietaryRestriction = (restriction: string) => {
    if (restriction && !formData.preferences.dietaryRestrictions.includes(restriction)) {
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          dietaryRestrictions: [...prev.preferences.dietaryRestrictions, restriction],
        },
      }))
    }
  }

  const removeDietaryRestriction = (restriction: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        dietaryRestrictions: prev.preferences.dietaryRestrictions.filter((r) => r !== restriction),
      },
    }))
  }

  const addSpecialRequest = (request: string) => {
    if (request && !formData.preferences.specialRequests.includes(request)) {
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          specialRequests: [...prev.preferences.specialRequests, request],
        },
      }))
    }
  }

  const removeSpecialRequest = (request: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        specialRequests: prev.preferences.specialRequests.filter((r) => r !== request),
      },
    }))
  }

  const handleAddCustomDietaryRestriction = () => {
    if (newDietaryRestriction.trim()) {
      addDietaryRestriction(newDietaryRestriction.trim())
      setNewDietaryRestriction("")
    }
  }

  const handleAddCustomSpecialRequest = () => {
    if (newSpecialRequest.trim()) {
      addSpecialRequest(newSpecialRequest.trim())
      setNewSpecialRequest("")
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      room: "",
      checkInDate: "",
      checkOutDate: "",
      preferences: {
        pillowType: "soft",
        dietaryRestrictions: [],
        specialRequests: [],
        doNotDisturb: {
          enabled: false,
          hours: {
            start: "22:00",
            end: "08:00",
          },
        },
      },
      loyaltyPoints: 0,
    })
    setNewDietaryRestriction("")
    setNewSpecialRequest("")
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      // Basic validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast("Validation Error", {
          description: "Please fill in all required fields.",
        })
        return
      }

      if (!formData.checkInDate || !formData.checkOutDate) {
        toast("Validation Error", {
          description: "Please select check-in and check-out dates.",
        })
        return
      }

      // Validate dates
      const checkIn = new Date(formData.checkInDate)
      const checkOut = new Date(formData.checkOutDate)
      if (checkOut <= checkIn) {
        toast("Validation Error", {
          description: "Check-out date must be after check-in date.",
        })
        return
      }

      // Prepare data for API
      const guestData: CreateGuestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        checkInDate: new Date(formData.checkInDate).toISOString(),
        checkOutDate: new Date(formData.checkOutDate).toISOString(),
        preferences: formData.preferences,
        loyaltyPoints: formData.loyaltyPoints,
      }

      // Add room if selected
      if (formData.room && formData.room !== "none") {
        guestData.room = formData.room
      }

      // Create guest via API
      const response = await guestsApi.createGuest(guestData)

      // Notify parent component
      onGuestCreated(response.data)

      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating guest:", error)
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to create guest. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Guest</DialogTitle>
          <DialogDescription>Create a new guest profile and optionally assign a room.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Total Members <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="2"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="+1-555-0123"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loyaltyPoints">Loyalty Points</Label>
                <Input
                  id="loyaltyPoints"
                  type="number"
                  min="0"
                  value={formData.loyaltyPoints}
                  onChange={(e) => handleInputChange("loyaltyPoints", Number.parseInt(e.target.value) || 0)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stay Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Stay Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="checkInDate">
                  Check-in Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => handleInputChange("checkInDate", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutDate">
                  Check-out Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => handleInputChange("checkOutDate", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Assign Room</Label>
                <select
                  id="room"
                  className="w-full border rounded px-2 py-2 bg-[#171717] text-white"
                  value={formData.room}
                  onChange={(e) => handleInputChange("room", e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">No Room</option>
                  {availableRooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.roomName} ({room.roomNumber})
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pillowType">Pillow Type</Label>
                <Select
                  id="pillowType"
                  value={formData.preferences.pillowType}
                  onValueChange={(value) => handleInputChange("preferences.pillowType", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pillow type" />
                  </SelectTrigger>
                  <SelectContent>
                    {pillowTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dietary Restrictions</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.preferences.dietaryRestrictions.map((restriction) => (
                    <Badge
                      key={restriction}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => removeDietaryRestriction(restriction)}
                    >
                      {restriction} <X className="h-4 w-4 ml-1" />
                    </Badge>
                  ))}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add dietary restriction"
                      value={newDietaryRestriction}
                      onChange={(e) => setNewDietaryRestriction(e.target.value)}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleAddCustomDietaryRestriction}
                      disabled={isLoading}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Requests</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.preferences.specialRequests.map((request) => (
                    <Badge
                      key={request}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => removeSpecialRequest(request)}
                    >
                      {request} <X className="h-4 w-4 ml-1" />
                    </Badge>
                  ))}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add special request"
                      value={newSpecialRequest}
                      onChange={(e) => setNewSpecialRequest(e.target.value)}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleAddCustomSpecialRequest}
                      disabled={isLoading}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Do Not Disturb</Label>
                <Checkbox
                  checked={formData.preferences.doNotDisturb.enabled}
                  onCheckedChange={(checked) => handleInputChange("preferences.doNotDisturb.enabled", checked)}
                  disabled={isLoading}
                >
                  Enable
                </Checkbox>

                {formData.preferences.doNotDisturb.enabled && (
                  <div className="flex gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dndStartTime">Start Time</Label>
                      <Input
                        id="dndStartTime"
                        type="time"
                        value={formData.preferences.doNotDisturb.hours.start}
                        onChange={(e) => handleInputChange("preferences.doNotDisturb.hours.start", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dndEndTime">End Time</Label>
                      <Input
                        id="dndEndTime"
                        type="time"
                        value={formData.preferences.doNotDisturb.hours.end}
                        onChange={(e) => handleInputChange("preferences.doNotDisturb.hours.end", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-end gap-4 py-4">
          <Button
            variant="outline"
            onClick={() => {
              resetForm()
              onOpenChange(false)
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}