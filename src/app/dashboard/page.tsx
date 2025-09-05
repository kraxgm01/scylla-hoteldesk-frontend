"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard-header";
import { RequestCard } from "@/components/request-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Filter, RefreshCw, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRequests } from "@/hooks/use-requests";

export default function DashboardPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { requests, loading, error, refetch, approveRequest, declineRequest } =
    useRequests({
      pollingInterval: 60000,
      enablePolling: true,
      pollingOnlyWhenActive: true,
    });

  const handleApprove = async (id: string) => {
    try {
      await approveRequest(id);
      toast.success("Request Approved", {
        description: "The request has been approved successfully.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to approve request. Please try again.",
      });
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await declineRequest(id);
      toast.error("Request Declined", {
        description: "The request has been declined.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to decline request. Please try again.",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Refreshed");
    } catch (error) {
      toast.error("Error", {
        description: "Failed to refresh requests. Please try again.",
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredRequests = requests.filter((req) => {
    if (filter !== "all" && req.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        req.roomNumber?.toString().includes(query) ||
        req.type?.toLowerCase().includes(query) ||
        req.details?.notes?.toLowerCase().includes(query) ||
        req.assignedTo?.toLowerCase().includes(query) ||
        req.status?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === "pending").length,
    assignedRequests: requests.filter((r) => r.status === "assigned").length,
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader onSearch={handleSearch} />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Requests
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader onSearch={handleSearch} />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
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
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
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
        </div>

        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Recent Requests
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
