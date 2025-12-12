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
import { Plus, Pencil, Trash2, FileCheck, Clock } from "lucide-react";
import type { Visa } from "@shared/schema";

const visaFormSchema = z.object({
  visaType: z.string().min(1, "Visa type is required"),
  price: z.string().min(1, "Price is required"),
  processingDays: z.number().min(1, "Processing days is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type VisaFormData = z.infer<typeof visaFormSchema>;

export default function VisaPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisa, setEditingVisa] = useState<Visa | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: visaList, isLoading } = useQuery<Visa[]>({
    queryKey: ["/api/visa"],
  });

  const form = useForm<VisaFormData>({
    resolver: zodResolver(visaFormSchema),
    defaultValues: {
      visaType: "",
      price: "",
      processingDays: 7,
      description: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: VisaFormData) => {
      await apiRequest("POST", "/api/visa", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visa"] });
      toast({ title: "Visa type created successfully" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Failed to create visa type", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: VisaFormData }) => {
      await apiRequest("PATCH", `/api/visa/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visa"] });
      toast({ title: "Visa type updated successfully" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Failed to update visa type", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/visa/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visa"] });
      toast({ title: "Visa type deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete visa type", variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/visa/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visa"] });
      toast({ title: "Visa status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const handleOpenDialog = (visa?: Visa) => {
    if (visa) {
      setEditingVisa(visa);
      form.reset({
        visaType: visa.visaType,
        price: String(visa.price),
        processingDays: visa.processingDays || 7,
        description: visa.description || "",
        isActive: visa.isActive ?? true,
      });
    } else {
      setEditingVisa(null);
      form.reset({
        visaType: "",
        price: "",
        processingDays: 7,
        description: "",
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVisa(null);
    form.reset();
  };

  const onSubmit = (data: VisaFormData) => {
    if (editingVisa) {
      updateMutation.mutate({ id: editingVisa.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Visa</h1>
          <p className="text-muted-foreground">Manage visa types and pricing</p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-visa">
          <Plus className="mr-2 h-4 w-4" />
          Add Visa Type
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">All Visa Types</CardTitle>
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
          ) : visaList?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileCheck className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No visa types yet</p>
              <p className="mt-1 text-muted-foreground">Add your first visa type</p>
              <Button className="mt-6" onClick={() => handleOpenDialog()} data-testid="button-add-first">
                <Plus className="mr-2 h-4 w-4" />
                Add Visa Type
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visa Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Processing Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visaList?.map((visa) => (
                    <TableRow key={visa.id} data-testid={`visa-row-${visa.id}`}>
                      <TableCell className="font-medium">{visa.visaType}</TableCell>
                      <TableCell className="font-mono">
                        SAR {Number(visa.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {visa.processingDays} days
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={visa.isActive ?? true}
                          onCheckedChange={(checked) =>
                            toggleStatusMutation.mutate({ id: visa.id, isActive: checked })
                          }
                          data-testid={`switch-status-${visa.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(visa)}
                            data-testid={`button-edit-${visa.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(visa.id)}
                            data-testid={`button-delete-${visa.id}`}
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
            <DialogTitle>{editingVisa ? "Edit Visa Type" : "Add Visa Type"}</DialogTitle>
            <DialogDescription>
              {editingVisa ? "Update visa type details" : "Add a new visa type"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="visaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visa Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Umrah Visa, Tourist Visa" data-testid="input-visa-type" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (SAR)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="processingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processing Days</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-processing-days"
                        />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Visa details..." data-testid="textarea-description" />
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
                        Show this visa type in quotation builder
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
              This action cannot be undone. This will permanently delete the visa type.
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
