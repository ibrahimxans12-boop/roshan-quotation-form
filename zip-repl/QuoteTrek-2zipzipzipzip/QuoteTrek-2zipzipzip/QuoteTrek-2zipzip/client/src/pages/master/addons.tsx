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
import { Plus, Pencil, Trash2, Gift } from "lucide-react";
import type { Addon } from "@shared/schema";

const addonFormSchema = z.object({
  name: z.string().min(1, "Add-on name is required"),
  price: z.string().min(1, "Price is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type AddonFormData = z.infer<typeof addonFormSchema>;

export default function AddonsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: addons, isLoading } = useQuery<Addon[]>({
    queryKey: ["/api/addons"],
  });

  const form = useForm<AddonFormData>({
    resolver: zodResolver(addonFormSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AddonFormData) => {
      await apiRequest("POST", "/api/addons", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addons"] });
      toast({ title: "Add-on created successfully" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Failed to create add-on", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AddonFormData }) => {
      await apiRequest("PATCH", `/api/addons/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addons"] });
      toast({ title: "Add-on updated successfully" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Failed to update add-on", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/addons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addons"] });
      toast({ title: "Add-on deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete add-on", variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/addons/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addons"] });
      toast({ title: "Add-on status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const handleOpenDialog = (addon?: Addon) => {
    if (addon) {
      setEditingAddon(addon);
      form.reset({
        name: addon.name,
        price: String(addon.price),
        description: addon.description || "",
        isActive: addon.isActive ?? true,
      });
    } else {
      setEditingAddon(null);
      form.reset({
        name: "",
        price: "",
        description: "",
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddon(null);
    form.reset();
  };

  const onSubmit = (data: AddonFormData) => {
    if (editingAddon) {
      updateMutation.mutate({ id: editingAddon.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Add-ons</h1>
          <p className="text-muted-foreground">Manage optional add-ons and extras</p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-addon">
          <Plus className="mr-2 h-4 w-4" />
          Add Add-on
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">All Add-ons</CardTitle>
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
          ) : addons?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Gift className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No add-ons yet</p>
              <p className="mt-1 text-muted-foreground">Add your first add-on</p>
              <Button className="mt-6" onClick={() => handleOpenDialog()} data-testid="button-add-first">
                <Plus className="mr-2 h-4 w-4" />
                Add Add-on
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addons?.map((addon) => (
                    <TableRow key={addon.id} data-testid={`addon-row-${addon.id}`}>
                      <TableCell className="font-medium">{addon.name}</TableCell>
                      <TableCell className="font-mono">
                        SAR {Number(addon.price).toFixed(2)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {addon.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={addon.isActive ?? true}
                          onCheckedChange={(checked) =>
                            toggleStatusMutation.mutate({ id: addon.id, isActive: checked })
                          }
                          data-testid={`switch-status-${addon.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(addon)}
                            data-testid={`button-edit-${addon.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(addon.id)}
                            data-testid={`button-delete-${addon.id}`}
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
            <DialogTitle>{editingAddon ? "Edit Add-on" : "Add Add-on"}</DialogTitle>
            <DialogDescription>
              {editingAddon ? "Update add-on details" : "Add a new optional add-on"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Add-on Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Complimentary Kit, Zam Zam" data-testid="input-addon-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Add-on details..." data-testid="textarea-description" />
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
                        Show this add-on in quotation builder
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
              This action cannot be undone. This will permanently delete the add-on.
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
