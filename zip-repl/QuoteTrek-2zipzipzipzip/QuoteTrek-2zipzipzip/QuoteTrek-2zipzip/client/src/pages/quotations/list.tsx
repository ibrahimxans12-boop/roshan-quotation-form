import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  FileDown,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import type { Quotation } from "@shared/schema";

export default function QuotationList() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: quotations, isLoading } = useQuery<Quotation[]>({
    queryKey: ["/api/quotations"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/quotations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      toast({ title: "Quotation deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete quotation", variant: "destructive" });
    },
  });

  const filteredQuotations = quotations?.filter((q) => {
    const matchesSearch =
      q.customerName.toLowerCase().includes(search.toLowerCase()) ||
      q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.customerEmail?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const getTravelTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      umrah: "Umrah",
      ramadan_umrah: "Ramadan Umrah",
      international: "International",
      domestic: "Domestic",
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Quotations</h1>
          <p className="text-muted-foreground">
            Manage and track all your travel quotations
          </p>
        </div>
        <Link href="/quotations/new">
          <Button data-testid="button-new-quotation">
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, email, or quotation number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">All Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : filteredQuotations?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No quotations found</p>
              <p className="mt-1 text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "Try adjusting your search or filter"
                  : "Create your first quotation to get started"}
              </p>
              {!search && statusFilter === "all" && (
                <Link href="/quotations/new">
                  <Button className="mt-6" data-testid="button-create-first">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Quotation
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quotation #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Travel Type</TableHead>
                    <TableHead>Travelers</TableHead>
                    <TableHead>Total (SAR)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations?.map((quotation) => (
                    <TableRow key={quotation.id} data-testid={`quotation-row-${quotation.id}`}>
                      <TableCell className="font-mono text-sm">
                        {quotation.quotationNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quotation.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {quotation.customerEmail || quotation.customerPhone || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getTravelTypeBadge(quotation.travelType)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {quotation.adults}A + {quotation.children}C + {quotation.infants}I
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {quotation.totalSar
                          ? Number(quotation.totalSar).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(quotation.status || "draft")}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/quotations/${quotation.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-view-${quotation.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/quotations/${quotation.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-edit-${quotation.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/quotations/${quotation.id}/pdf`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-pdf-${quotation.id}`}
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(quotation.id)}
                            data-testid={`button-delete-${quotation.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quotation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
