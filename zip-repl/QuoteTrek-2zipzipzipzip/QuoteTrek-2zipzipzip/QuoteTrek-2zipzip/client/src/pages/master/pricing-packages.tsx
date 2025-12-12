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
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import type { PricingPackage } from "@shared/schema";

const pricingPackageFormSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  adultRate: z.string().min(1, "Adult rate is required"),
  childRate: z.string().min(1, "Child rate is required"),
  infantRate: z.string().min(1, "Infant rate is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type PricingPackageFormData = z.infer<typeof pricingPackageFormSchema>;

export default function PricingPackagesPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PricingPackage | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: packages, isLoading } = useQuery<PricingPackage[]>({
    queryKey: ["/api/pricing-packages"],
  });

  const form = useForm<PricingPackageFormData>({
    resolver: zodResolver(pricingPackageFormSchema),
    defaultValues: {
      name: "",
      adultRate: "80000",
      childRate: "0",
      infantRate: "0",
      description: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PricingPackageFormData) => {
      await apiRequest("POST", "/api/pricing-packages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-packages"] });
      toast({ title: "Pricing package created successfully" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Failed to create pricing package", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PricingPackageFormData }) => {
      await apiRequest("PATCH", `/api/pricing-packages/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-packages"] });
      toast({ title: "Pricing package updated successfully" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Failed to update pricing package", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/pricing-packages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-packages"] });
      toast({ title: "Pricing package deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete pricing package", variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/pricing-packages/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-packages"] });
      toast({ title: "Pricing package status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const handleOpenDialog = (pkg?: PricingPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      form.reset({
        name: pkg.name,
        adultRate: pkg.adultRate ? String(pkg.adultRate) : "",
        childRate: pkg.childRate ? String(pkg.childRate) : "",
        infantRate: pkg.infantRate ? String(pkg.infantRate) : "",
        description: pkg.description || "",
        isActive: pkg.isActive ?? true,
      });
    } else {
      setEditingPackage(null);
      form.reset({
        name: "",
        adultRate: "80000",
        childRate: "0",
        infantRate: "0",
        description: "",
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPackage(null);
    form.reset();
  };

  const onSubmit = (data: PricingPackageFormData) => {
    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Pricing Packages</h1>
          <p className="text-muted-foreground">Manage per-person pricing rates (Adult, Child, Infant)</p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-package">
          <Plus className="mr-2 h-4 w-4" />
          Add Package
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">All Pricing Packages</CardTitle>
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
          ) : packages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No pricing packages yet</p>
              <p className="mt-1 text-muted-foreground">Add your first pricing package to get started</p>
              <Button className="mt-6" onClick={() => handleOpenDialog()} data-testid="button-add-first">
                <Plus className="mr-2 h-4 w-4" />
                Add Package
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Name</TableHead>
                    <TableHead>Adult Rate</TableHead>
                    <TableHead>Child Rate</TableHead>
                    <TableHead>Infant Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages?.map((pkg) => (
                    <TableRow key={pkg.id} data-testid={`package-row-${pkg.id}`}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell className="font-mono">{Number(pkg.adultRate).toLocaleString()}</TableCell>
                      <TableCell className="font-mono">{Number(pkg.childRate).toLocaleString()}</TableCell>
                      <TableCell className="font-mono">{Number(pkg.infantRate).toLocaleString()}</TableCell>
                      <TableCell>
                        <Switch
                          checked={pkg.isActive ?? true}
                          onCheckedChange={(checked) =>
                            toggleStatusMutation.mutate({ id: pkg.id, isActive: checked })
                          }
                          data-testid={`switch-status-${pkg.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(pkg)}
                            data-testid={`button-edit-${pkg.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(pkg.id)}
                            data-testid={`button-delete-${pkg.id}`}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPackage ? "Edit Pricing Package" : "Add Pricing Package"}</DialogTitle>
            <DialogDescription>
              {editingPackage ? "Update package details" : "Create a new pricing package"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Umrah Standard, Ramadan Deluxe" data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="adultRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adult Rate (GBP) *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="80000" data-testid="input-adult-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="childRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Child Rate (GBP) *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="0" data-testid="input-child-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="infantRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Infant Rate (GBP) *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="0" data-testid="input-infant-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Add notes about this pricing package" data-testid="input-description" />
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
                    <FormLabel>Active</FormLabel>
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
                <Button type="submit" data-testid="button-submit">
                  {editingPackage ? "Update Package" : "Create Package"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pricing Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
