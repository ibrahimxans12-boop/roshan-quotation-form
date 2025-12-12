import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Plus, Pencil, Trash2, Receipt } from "lucide-react";
import type { ServiceCharge } from "@shared/schema";

const serviceChargeFormSchema = z.object({
  name: z.string().min(1, "Service charge name is required"),
  chargeType: z.enum(["fixed", "percentage"]),
  amount: z.string().min(1, "Amount is required"),
  appliesTo: z.enum(["adult", "child", "infant", "all"]),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type ServiceChargeFormData = z.infer<typeof serviceChargeFormSchema>;

export default function ServiceChargesPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<ServiceCharge | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: charges, isLoading } = useQuery<ServiceCharge[]>({
    queryKey: ["/api/service-charges"],
  });

  const form = useForm<ServiceChargeFormData>({
    resolver: zodResolver(serviceChargeFormSchema),
    defaultValues: {
      name: "",
      chargeType: "fixed",
      amount: "",
      appliesTo: "all",
      description: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ServiceChargeFormData) => {
      await apiRequest("POST", "/api/service-charges", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-charges"] });
      toast({ title: "Service charge created successfully" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Failed to create service charge", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ServiceChargeFormData }) => {
      await apiRequest("PATCH", `/api/service-charges/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-charges"] });
      toast({ title: "Service charge updated successfully" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Failed to update service charge", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/service-charges/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-charges"] });
      toast({ title: "Service charge deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete service charge", variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/service-charges/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-charges"] });
      toast({ title: "Service charge status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const handleOpenDialog = (charge?: ServiceCharge) => {
    if (charge) {
      setEditingCharge(charge);
      form.reset({
        name: charge.name,
        chargeType: charge.chargeType as "fixed" | "percentage",
        amount: String(charge.amount),
        appliesTo: charge.appliesTo as "adult" | "child" | "infant" | "all",
        description: charge.description || "",
        isActive: charge.isActive ?? true,
      });
    } else {
      setEditingCharge(null);
      form.reset({
        name: "",
        chargeType: "fixed",
        amount: "",
        appliesTo: "all",
        description: "",
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCharge(null);
    form.reset();
  };

  const onSubmit = (data: ServiceChargeFormData) => {
    if (editingCharge) {
      updateMutation.mutate({ id: editingCharge.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getAppliesToBadge = (appliesTo: string) => {
    const labels: Record<string, string> = {
      adult: "Adults",
      child: "Children",
      infant: "Infants",
      all: "All Travelers",
    };
    return <Badge variant="outline">{labels[appliesTo] || appliesTo}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Service Charges</h1>
          <p className="text-muted-foreground">Manage service charges and fees</p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-charge">
          <Plus className="mr-2 h-4 w-4" />
          Add Service Charge
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">All Service Charges</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : charges?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Receipt className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No service charges yet</p>
              <p className="mt-1 text-muted-foreground">Add your first service charge</p>
              <Button className="mt-6" onClick={() => handleOpenDialog()} data-testid="button-add-first">
                <Plus className="mr-2 h-4 w-4" />
                Add Service Charge
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Applies To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {charges?.map((charge) => (
                    <TableRow key={charge.id} data-testid={`charge-row-${charge.id}`}>
                      <TableCell className="font-medium">{charge.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {charge.chargeType === "fixed" ? "Fixed" : "Percentage"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {charge.chargeType === "fixed"
                          ? `SAR ${Number(charge.amount).toFixed(2)}`
                          : `${Number(charge.amount)}%`}
                      </TableCell>
                      <TableCell>{getAppliesToBadge(charge.appliesTo)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={charge.isActive ?? true}
                          onCheckedChange={(checked) =>
                            toggleStatusMutation.mutate({ id: charge.id, isActive: checked })
                          }
                          data-testid={`switch-status-${charge.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(charge)}
                            data-testid={`button-edit-${charge.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(charge.id)}
                            data-testid={`button-delete-${charge.id}`}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCharge ? "Edit Service Charge" : "Add Service Charge"}</DialogTitle>
            <DialogDescription>
              {editingCharge ? "Update service charge details" : "Add a new service charge"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Charge Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Processing Fee" data-testid="input-charge-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="chargeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charge Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-charge-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Amount {form.watch("chargeType") === "fixed" ? "(SAR)" : "(%)"}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="appliesTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applies To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-applies-to">
                          <SelectValue placeholder="Select travelers" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Travelers</SelectItem>
                        <SelectItem value="adult">Adults Only</SelectItem>
                        <SelectItem value="child">Children Only</SelectItem>
                        <SelectItem value="infant">Infants Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Service charge details..." data-testid="textarea-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Apply this charge to quotations
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-active" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service charge.
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
