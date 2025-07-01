"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { RequestCard } from "@/components/request-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Users, Bed, TrendingUp, Filter, Plus, RefreshCw, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRequests } from "@/hooks/use-requests"
import { HotelRequest } from "@/types/request"

export default function Dashboard() {
  const [filter, setFilter] = useState("all")
  const { toast } = useToast()
  const { 
    requests, 
    loading, 
    error, 
    refetch, 
    approveRequest, 
    declineRequest 
  } = useRequests()

  const handleApprove = async (id: string) => {
    try {
      await approveRequest(id)
      toast({
        title: "Request Approved",
        description: "The request has been approved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDecline = async (id: string) => {
    try {
      await declineRequest(id)
      toast({
        title: "Request Declined",
        description: "The request has been declined.",
        variant: "destructive",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCall = (id: string) => {
    const request = requests.find((req) => req._id === id)
    toast({
      title: "Calling Guest",
      description: `Initiating call to guest in room ${request?.roomNumber}...`,
    })
  }

  const handleRefresh = async () => {
    try {
      await refetch()
      toast({
        title: "Refreshed",
        description: "Requests have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh requests.",
        variant: "destructive",
      })
    }
  }

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true
    return req.status === filter
  })

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === "pending").length,
    assignedRequests: requests.filter((r) => r.status === "assigned").length,
    completedRequests: requests.filter((r) => r.status === "completed").length,
    totalRooms: 150,
    occupiedRooms: 89,
    totalGuests: 156,
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Requests</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
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
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading..." : "All time"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Badge variant="secondary">{stats.pendingRequests}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned</CardTitle>
              <Badge variant="default">{stats.assignedRequests}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignedRequests}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Badge variant="outline">{stats.completedRequests}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedRequests}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests Section */}
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Recent Requests</h2>
                <p className="text-muted-foreground">Manage guest requests and service orders</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request._id}
                  request={request}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                  onCall={handleCall}
                />
              ))}
              {filteredRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No requests found for the selected filter.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}