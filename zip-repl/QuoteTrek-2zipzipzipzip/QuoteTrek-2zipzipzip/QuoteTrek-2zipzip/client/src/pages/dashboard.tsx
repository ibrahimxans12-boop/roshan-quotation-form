import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  TrendingUp,
  Building2,
  Truck,
  Users,
  Clock,
  CheckCircle2,
  Send,
  XCircle,
} from "lucide-react";
import type { Quotation } from "@shared/schema";

export default function Dashboard() {
  const { data: quotations, isLoading } = useQuery<Quotation[]>({
    queryKey: ["/api/quotations"],
  });

  const stats = {
    total: quotations?.length || 0,
    draft: quotations?.filter(q => q.status === "draft").length || 0,
    sent: quotations?.filter(q => q.status === "sent").length || 0,
    accepted: quotations?.filter(q => q.status === "accepted").length || 0,
  };

  const recentQuotations = quotations?.slice(0, 5) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
      draft: { variant: "secondary", icon: Clock },
      sent: { variant: "default", icon: Send },
      accepted: { variant: "outline", icon: CheckCircle2 },
      rejected: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.draft;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your quotations.
          </p>
        </div>
        <Link href="/quotations/new">
          <Button data-testid="button-new-quotation">
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="stat-total">{stats.total}</div>
            )}
            <p className="text-xs text-muted-foreground">All time quotations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="stat-draft">{stats.draft}</div>
            )}
            <p className="text-xs text-muted-foreground">Pending completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="stat-sent">{stats.sent}</div>
            )}
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="stat-accepted">{stats.accepted}</div>
            )}
            <p className="text-xs text-muted-foreground">Successfully closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Quotations */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/quotations/new" className="block">
              <Button variant="outline" className="w-full justify-start gap-2" data-testid="quick-new-quotation">
                <Plus className="h-4 w-4" />
                Create New Quotation
              </Button>
            </Link>
            <Link href="/quotations" className="block">
              <Button variant="outline" className="w-full justify-start gap-2" data-testid="quick-view-quotations">
                <FileText className="h-4 w-4" />
                View All Quotations
              </Button>
            </Link>
            <Link href="/master/hotels" className="block">
              <Button variant="outline" className="w-full justify-start gap-2" data-testid="quick-manage-hotels">
                <Building2 className="h-4 w-4" />
                Manage Hotels
              </Button>
            </Link>
            <Link href="/master/transport" className="block">
              <Button variant="outline" className="w-full justify-start gap-2" data-testid="quick-manage-transport">
                <Truck className="h-4 w-4" />
                Manage Transport
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Quotations */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg font-medium">Recent Quotations</CardTitle>
            <Link href="/quotations">
              <Button variant="ghost" size="sm" data-testid="link-view-all">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : recentQuotations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No quotations yet</p>
                <Link href="/quotations/new">
                  <Button className="mt-4" size="sm" data-testid="button-create-first">
                    Create your first quotation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentQuotations.map((quotation) => (
                  <Link key={quotation.id} href={`/quotations/${quotation.id}`}>
                    <div
                      className="flex items-center gap-4 rounded-lg border p-4 hover-elevate cursor-pointer"
                      data-testid={`quotation-item-${quotation.id}`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{quotation.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {quotation.quotationNumber} • {quotation.travelType}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(quotation.status || "draft")}
                        <span className="text-sm font-mono text-muted-foreground">
                          {quotation.totalSar ? `SAR ${Number(quotation.totalSar).toLocaleString()}` : "-"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
