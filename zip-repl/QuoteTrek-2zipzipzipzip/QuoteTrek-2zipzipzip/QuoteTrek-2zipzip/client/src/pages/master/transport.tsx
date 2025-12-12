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
import { Plus, Pencil, Trash2, Truck, Users } from "lucide-react";
import type { Transport } from "@shared/schema";

const transportFormSchema = z.object({
  routeName: z.string().min(1, "Route name is required"),
  vehicleType: z.enum(["Sedan", "GMC", "Hiace 7-seater", "Hiace 12-seater"]),
  capacity: z.number().min(1, "Capacity is required"),
  pricePerTrip: z.string().min(1, "Price is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type TransportFormData = z.infer<typeof transportFormSchema>;

const defaultRoutes = [
  "Harmain Train (Jeddah → Makkah → Madina → Jeddah)",
  "Jeddah → Makkah",
  "Makkah Ziyarat",
  "Makkah → Taif Ziyarat",
  "Makkah → Madina",
  "Madina Ziyarat",
  "Badar Ziyarat",
  "Madina → Airport",
  "Madina → Madina Airport",
  "Madina → Jeddah Airport",
];

const vehicleTypes = [
  { value: "Sedan", capacity: 3 },
  { value: "GMC", capacity: 6 },
  { value: "Hiace 7-seater", capacity: 7 },
  { value: "Hiace 12-seater", capacity: 12 },
];

export default function TransportPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransport, setEditingTransport] = useState<Transport | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: transports, isLoading } = useQuery<Transport[]>({
    queryKey: ["/api/transport"],
  });

  const form = useForm<TransportFormData>({
    resolver: zodResolver(transportFormSchema),
    defaultValues: {
      routeName: "",
      vehicleType: "Sedan",
      capacity: 3,
      pricePerTrip: "",
      description: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TransportFormData) => {
      await apiRequest("POST", "/api/transport", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transport"] });
      toast({ title: "Transport created successfully" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Failed to create transport", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TransportFormData }) => {
      await apiRequest("PATCH", `/api/transport/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transport"] });
      toast({ title: "Transport updated successfully" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Failed to update transport", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transport/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transport"] });
      toast({ title: "Transport deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete transport", variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/transport/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transport"] });
      toast({ title: "Transport status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const handleOpenDialog = (transport?: Transport) => {
    if (transport) {
      setEditingTransport(transport);
      form.reset({
        routeName: transport.routeName,
        vehicleType: transport.vehicleType as any,
        capacity: transport.capacity,
        pricePerTrip: String(transport.pricePerTrip),
        description: transport.description || "",
        isActive: transport.isActive ?? true,
      });
    } else {
      setEditingTransport(null);
      form.reset({
        routeName: "",
        vehicleType: "Sedan",
        capacity: 3,
        pricePerTrip: "",
        description: "",
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTransport(null);
    form.reset();
  };

  const onSubmit = (data: TransportFormData) => {
    if (editingTransport) {
      updateMutation.mutate({ id: editingTransport.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleVehicleTypeChange = (value: string) => {
    const vehicle = vehicleTypes.find(v => v.value === value);
    if (vehicle) {
      form.setValue("vehicleType", value as any);
      form.setValue("capacity", vehicle.capacity);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Transport</h1>
          <p className="text-muted-foreground">Manage transport routes and vehicle types</p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-transport">
          <Plus className="mr-2 h-4 w-4" />
          Add Transport
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">All Transport Options</CardTitle>
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
          ) : transports?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Truck className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No transport options yet</p>
              <p className="mt-1 text-muted-foreground">Add your first transport route</p>
              <Button className="mt-6" onClick={() => handleOpenDialog()} data-testid="button-add-first">
                <Plus className="mr-2 h-4 w-4" />
                Add Transport
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Vehicle Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Price/Trip</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transports?.map((transport) => (
                    <TableRow key={transport.id} data-testid={`transport-row-${transport.id}`}>
                      <TableCell className="font-medium">{transport.routeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transport.vehicleType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {transport.capacity}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        SAR {Number(transport.pricePerTrip).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={transport.isActive ?? true}
                          onCheckedChange={(checked) =>
                            toggleStatusMutation.mutate({ id: transport.id, isActive: checked })
                          }
                          data-testid={`switch-status-${transport.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(transport)}
                            data-testid={`button-edit-${transport.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(transport.id)}
                            data-testid={`button-delete-${transport.id}`}
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
            <DialogTitle>{editingTransport ? "Edit Transport" : "Add Transport"}</DialogTitle>
            <DialogDescription>
              {editingTransport ? "Update transport details" : "Add a new transport route"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="routeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route Name</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-route">
                          <SelectValue placeholder="Select or enter route" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {defaultRoutes.map((route) => (
                          <SelectItem key={route} value={route}>
                            {route}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select onValueChange={handleVehicleTypeChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vehicle">
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleTypes.map((vehicle) => (
                            <SelectItem key={vehicle.value} value={vehicle.value}>
                              {vehicle.value} (Cap: {vehicle.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-capacity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="pricePerTrip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Trip (SAR)</FormLabel>
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
                      <Textarea {...field} placeholder="Transport description..." data-testid="textarea-description" />
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
                        Show this transport in quotation builder
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
              This action cannot be undone. This will permanently delete the transport option.
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
