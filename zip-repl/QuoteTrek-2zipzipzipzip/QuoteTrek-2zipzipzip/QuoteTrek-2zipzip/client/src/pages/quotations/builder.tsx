import { useState, useEffect, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { calculatePricing, type SelectedTransport, type SelectedAddon } from "@/lib/pricingCalculator";
import type { Quotation } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  Users,
  Building2,
  Truck,
  Gift,
  Calculator,
  Save,
  ArrowLeft,
  Plus,
  Minus,
  Baby,
  User,
  UserCheck,
} from "lucide-react";
import type { Hotel, Meal, Transport, Visa, Laundry, Addon, ServiceCharge, PricingPackage } from "@shared/schema";

const quotationFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  travelType: z.enum(["umrah", "ramadan_umrah", "international", "domestic"]),
  pricingPackageId: z.number().min(1, "Please select a pricing package"),
  adults: z.number().min(1, "At least 1 adult required"),
  children: z.number().min(0),
  infants: z.number().min(0),
  adultPrice: z.string().optional(),
  childPrice: z.string().optional(),
  infantPrice: z.string().optional(),
  discount: z.string().optional(),
  travelDate: z.string().optional(),
  returnDate: z.string().optional(),
  makkahHotelId: z.number().optional(),
  makkahRoomBeds: z.enum(["2", "3", "4", "5"]).optional(),
  makkahDays: z.number().min(0),
  makkahMealPlan: z.string().optional(),
  makkahLaundry: z.boolean(),
  madinaHotelId: z.number().optional(),
  madinaRoomBeds: z.enum(["2", "3", "4", "5"]).optional(),
  madinaDays: z.number().min(0),
  madinaMealPlan: z.string().optional(),
  madinaLaundry: z.boolean(),
  visaId: z.number().optional(),
  notes: z.string().optional(),
});

type QuotationFormData = z.infer<typeof quotationFormSchema>;

export default function QuotationBuilder() {
  const [, navigate] = useLocation();
  const params = useParams<{ id?: string }>();
  const quotationId = params.id ? parseInt(params.id) : null;
  const isEditMode = !!quotationId;
  const { toast } = useToast();
  const [selectedTransport, setSelectedTransport] = useState<SelectedTransport[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [isFormPopulated, setIsFormPopulated] = useState(false);

  // Fetch existing quotation when editing
  const { data: existingQuotation, isLoading: loadingQuotation } = useQuery<Quotation>({
    queryKey: ["/api/quotations", quotationId],
    enabled: isEditMode,
  });

  // Fetch all master data
  const { data: hotels, isLoading: loadingHotels } = useQuery<Hotel[]>({
    queryKey: ["/api/hotels"],
  });
  const { data: pricingPackages } = useQuery<PricingPackage[]>({
    queryKey: ["/api/pricing-packages"],
  });
  const { data: meals } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });
  const { data: transportList } = useQuery<Transport[]>({
    queryKey: ["/api/transport"],
  });
  const { data: visaList } = useQuery<Visa[]>({
    queryKey: ["/api/visa"],
  });
  const { data: laundryList } = useQuery<Laundry[]>({
    queryKey: ["/api/laundry"],
  });
  const { data: addonsList } = useQuery<Addon[]>({
    queryKey: ["/api/addons"],
  });
  const { data: serviceCharges } = useQuery<ServiceCharge[]>({
    queryKey: ["/api/service-charges"],
  });

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      travelType: "umrah",
      pricingPackageId: undefined,
      adults: 1,
      children: 0,
      infants: 0,
      adultPrice: "",
      childPrice: "",
      infantPrice: "",
      discount: "0",
      travelDate: "",
      returnDate: "",
      makkahHotelId: undefined,
      makkahRoomBeds: "2",
      makkahDays: 0,
      makkahMealPlan: "",
      makkahLaundry: false,
      madinaHotelId: undefined,
      madinaRoomBeds: "2",
      madinaDays: 0,
      madinaMealPlan: "",
      madinaLaundry: false,
      visaId: undefined,
      notes: "",
    },
  });

  // Populate form when editing an existing quotation
  useEffect(() => {
    if (isEditMode && existingQuotation && !isFormPopulated) {
      form.reset({
        customerName: existingQuotation.customerName || "",
        customerEmail: existingQuotation.customerEmail || "",
        customerPhone: existingQuotation.customerPhone || "",
        travelType: existingQuotation.travelType as "umrah" | "ramadan_umrah" | "international" | "domestic",
        pricingPackageId: existingQuotation.pricingPackageId || undefined,
        adults: existingQuotation.adults || 1,
        children: existingQuotation.children || 0,
        infants: existingQuotation.infants || 0,
        adultPrice: "",
        childPrice: "",
        infantPrice: "",
        discount: existingQuotation.discount?.toString() || "0",
        travelDate: existingQuotation.travelDate ? new Date(existingQuotation.travelDate).toISOString().split('T')[0] : "",
        returnDate: existingQuotation.returnDate ? new Date(existingQuotation.returnDate).toISOString().split('T')[0] : "",
        makkahHotelId: existingQuotation.makkahHotelId || undefined,
        makkahRoomBeds: (existingQuotation.makkahRoomBeds?.toString() as "2" | "3" | "4" | "5") || "2",
        makkahDays: existingQuotation.makkahDays || 0,
        makkahMealPlan: existingQuotation.makkahMealPlan || "",
        makkahLaundry: existingQuotation.makkahLaundry || false,
        madinaHotelId: existingQuotation.madinaHotelId || undefined,
        madinaRoomBeds: (existingQuotation.madinaRoomBeds?.toString() as "2" | "3" | "4" | "5") || "2",
        madinaDays: existingQuotation.madinaDays || 0,
        madinaMealPlan: existingQuotation.madinaMealPlan || "",
        madinaLaundry: existingQuotation.madinaLaundry || false,
        visaId: existingQuotation.visaId || undefined,
        notes: existingQuotation.notes || "",
      });
      
      // Populate selected transport and addons if they exist
      if ((existingQuotation as any).selectedTransport) {
        setSelectedTransport((existingQuotation as any).selectedTransport);
      }
      if ((existingQuotation as any).selectedAddons) {
        setSelectedAddons((existingQuotation as any).selectedAddons);
      }
      
      setIsFormPopulated(true);
    }
  }, [isEditMode, existingQuotation, isFormPopulated, form]);

  const watchedValues = form.watch();
  const totalTravelers = watchedValues.adults + watchedValues.children + watchedValues.infants;
  const payingTravelers = watchedValues.adults + watchedValues.children;

  // Filter hotels by location
  const makkahHotels = hotels?.filter(h => h.location === "makkah" && h.isActive) || [];
  const madinaHotels = hotels?.filter(h => h.location === "madina" && h.isActive) || [];
  const activeMeals = meals?.filter(m => m.isActive) || [];
  const activeTransport = transportList?.filter(t => t.isActive) || [];
  const activeVisa = visaList?.filter(v => v.isActive) || [];
  const activeLaundry = laundryList?.filter(l => l.isActive) || [];
  const activeAddons = addonsList?.filter(a => a.isActive) || [];

  // Calculate pricing using centralized calculator
  const calculations = useMemo(() => {
    const makkahHotel = makkahHotels.find(h => h.id === watchedValues.makkahHotelId);
    const madinaHotel = madinaHotels.find(h => h.id === watchedValues.madinaHotelId);
    const selectedVisa = activeVisa.find(v => v.id === watchedValues.visaId);

    const result = calculatePricing(
      {
        adults: watchedValues.adults,
        children: watchedValues.children,
        infants: watchedValues.infants,
        discount: watchedValues.discount,
        pricingPackageId: watchedValues.pricingPackageId,
        makkahHotelId: watchedValues.makkahHotelId,
        madinaHotelId: watchedValues.madinaHotelId,
        makkahDays: watchedValues.makkahDays,
        madinaDays: watchedValues.madinaDays,
        makkahRoomBeds: watchedValues.makkahRoomBeds,
        madinaRoomBeds: watchedValues.madinaRoomBeds,
        makkahMealPlan: watchedValues.makkahMealPlan,
        madinaMealPlan: watchedValues.madinaMealPlan,
        makkahLaundry: watchedValues.makkahLaundry,
        madinaLaundry: watchedValues.madinaLaundry,
        visaId: watchedValues.visaId,
        selectedTransport: selectedTransport as SelectedTransport[],
        selectedAddons: selectedAddons as SelectedAddon[],
      },
      {
        makkahHotel,
        madinaHotel,
        visa: selectedVisa,
        pricingPackages,
        meals: activeMeals,
        laundryList: activeLaundry,
        transportList: activeTransport,
        addonsList: activeAddons,
        serviceCharges,
      }
    );

    return {
      hotelCostMakkah: result.hotelCostMakkah,
      hotelCostMadina: result.hotelCostMadina,
      packageCharges: result.packageCharges,
      mealCostMakkah: result.mealCostMakkah,
      mealCostMadina: result.mealCostMadina,
      laundryCost: result.laundryCost,
      transportCost: result.transportCost,
      visaCost: result.visaCost,
      addonsCost: result.addonsCost,
      serviceChargeCost: result.serviceChargeCost,
      discountAmount: result.discount,
      totalInr: result.total,
      perPersonInr: result.perPerson,
    };
  }, [watchedValues, pricingPackages, makkahHotels, madinaHotels, activeMeals, activeLaundry, activeTransport, activeVisa, activeAddons, serviceCharges, selectedTransport, selectedAddons]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/quotations", data);
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      toast({ title: "Quotation created successfully!" });
      navigate(`/quotations/${data.id}`);
    },
    onError: () => {
      toast({ title: "Failed to create quotation", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/quotations/${quotationId}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotations", quotationId] });
      toast({ title: "Quotation updated successfully!" });
      navigate(`/quotations/${quotationId}`);
    },
    onError: () => {
      toast({ title: "Failed to update quotation", variant: "destructive" });
    },
  });

  const onSubmit = (data: QuotationFormData) => {
    const payload = {
      ...data,
      makkahRoomBeds: data.makkahRoomBeds ? Number(data.makkahRoomBeds) : 2,
      madinaRoomBeds: data.madinaRoomBeds ? Number(data.madinaRoomBeds) : 2,
      selectedTransport,
      selectedAddons,
      total: calculations.totalInr.toFixed(2),
      perPerson: calculations.perPersonInr.toFixed(2),
    };
    
    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleTransport = (transportId: number) => {
    setSelectedTransport(prev => {
      const existing = prev.find(t => t.transportId === transportId);
      if (existing) {
        return prev.filter(t => t.transportId !== transportId);
      }
      const transport = activeTransport.find(t => t.id === transportId);
      const vehiclesNeeded = transport ? Math.ceil(totalTravelers / transport.capacity) : 1;
      return [...prev, { transportId, vehicleCount: vehiclesNeeded }];
    });
  };

  const updateTransportCount = (transportId: number, count: number) => {
    setSelectedTransport(prev =>
      prev.map(t => t.transportId === transportId ? { ...t, vehicleCount: Math.max(1, count) } : t)
    );
  };

  const toggleAddon = (addonId: number) => {
    setSelectedAddons(prev => {
      const existing = prev.find(a => a.addonId === addonId);
      if (existing) {
        return prev.filter(a => a.addonId !== addonId);
      }
      return [...prev, { addonId, quantity: totalTravelers }];
    });
  };

  const updateAddonQuantity = (addonId: number, quantity: number) => {
    setSelectedAddons(prev =>
      prev.map(a => a.addonId === addonId ? { ...a, quantity: Math.max(1, quantity) } : a)
    );
  };

  if (loadingHotels || (isEditMode && loadingQuotation)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(isEditMode ? `/quotations/${quotationId}` : "/quotations")} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold">{isEditMode ? "Edit Quotation" : "New Quotation"}</h1>
          <p className="text-muted-foreground">
            {isEditMode ? `Editing ${existingQuotation?.quotationNumber || "quotation"}` : "Create a new travel quotation"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter customer name" data-testid="input-customer-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="customer@email.com" data-testid="input-customer-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+91 9876543210" data-testid="input-customer-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="travelType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-travel-type">
                                <SelectValue placeholder="Select travel type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="umrah">Umrah</SelectItem>
                              <SelectItem value="ramadan_umrah">Ramadan Umrah</SelectItem>
                              <SelectItem value="international">International</SelectItem>
                              <SelectItem value="domestic">Domestic</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pricingPackageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Pricing Package *</FormLabel>
                        <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value ? String(field.value) : ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-pricing-package">
                              <SelectValue placeholder="Select pricing package" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pricingPackages?.map((pkg) => (
                              <SelectItem key={pkg.id} value={String(pkg.id)}>
                                {pkg.name} - Adult: £{Number(pkg.adultRate).toLocaleString()}, Child: £{Number(pkg.childRate).toLocaleString()}, Infant: £{Number(pkg.infantRate).toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Travelers */}
                  <div>
                    <Label className="text-sm font-medium">Travelers</Label>
                    <div className="mt-3 grid gap-4 sm:grid-cols-3">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Adults</p>
                            <p className="text-xs text-muted-foreground">Full pricing</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => form.setValue("adults", Math.max(1, watchedValues.adults - 1))}
                            data-testid="button-adults-minus"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold" data-testid="text-adults-count">
                            {watchedValues.adults}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => form.setValue("adults", watchedValues.adults + 1)}
                            data-testid="button-adults-plus"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Children</p>
                            <p className="text-xs text-muted-foreground">Without bed</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => form.setValue("children", Math.max(0, watchedValues.children - 1))}
                            data-testid="button-children-minus"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold" data-testid="text-children-count">
                            {watchedValues.children}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => form.setValue("children", watchedValues.children + 1)}
                            data-testid="button-children-plus"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                          <Baby className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Infants</p>
                            <p className="text-xs text-muted-foreground">0-2 years, free</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => form.setValue("infants", Math.max(0, watchedValues.infants - 1))}
                            data-testid="button-infants-minus"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold" data-testid="text-infants-count">
                            {watchedValues.infants}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => form.setValue("infants", watchedValues.infants + 1)}
                            data-testid="button-infants-plus"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Discount */}
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 space-y-4">
                    <h3 className="font-medium">Discount</h3>
                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount (GBP)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" placeholder="0" data-testid="input-discount" />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">Leave blank or 0 for no discount</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="travelDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-travel-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="returnDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-return-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Hotel Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5" />
                    Hotel Selection
                  </CardTitle>
                  <CardDescription>Select hotels for Makkah and Madina</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Makkah */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Makkah</Badge>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="makkahHotelId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hotel</FormLabel>
                            <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger data-testid="select-makkah-hotel">
                                  <SelectValue placeholder="Select hotel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {makkahHotels.map(hotel => (
                                  <SelectItem key={hotel.id} value={hotel.id.toString()}>
                                    {hotel.name} ({hotel.starRating}⭐) - £ {Number(hotel.price2Bed)}/night (2-bed)
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
                        name="makkahRoomBeds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Bed Size</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-makkah-room-beds">
                                  <SelectValue placeholder="Select bed size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="2">2-Bed Room</SelectItem>
                                <SelectItem value="3">3-Bed Room</SelectItem>
                                <SelectItem value="4">4-Bed Room</SelectItem>
                                <SelectItem value="5">5-Bed Room</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="makkahDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Days</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min={0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-makkah-days"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="makkahMealPlan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meal Plan</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-makkah-meal">
                                  <SelectValue placeholder="Select meal plan" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {activeMeals.map(meal => (
                                  <SelectItem key={meal.id} value={meal.name}>
                                    {meal.name} - SAR {Number(meal.pricePerDay)}/day
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
                        name="makkahLaundry"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-makkah-laundry"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Include Laundry</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Madina */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Madina</Badge>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="madinaHotelId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hotel</FormLabel>
                            <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger data-testid="select-madina-hotel">
                                  <SelectValue placeholder="Select hotel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {madinaHotels.map(hotel => (
                                  <SelectItem key={hotel.id} value={hotel.id.toString()}>
                                    {hotel.name} ({hotel.starRating}⭐) - £ {Number(hotel.price2Bed)}/night (2-bed)
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
                        name="madinaRoomBeds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Bed Size</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-madina-room-beds">
                                  <SelectValue placeholder="Select bed size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="2">2-Bed Room</SelectItem>
                                <SelectItem value="3">3-Bed Room</SelectItem>
                                <SelectItem value="4">4-Bed Room</SelectItem>
                                <SelectItem value="5">5-Bed Room</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="madinaDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Days</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min={0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-madina-days"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="madinaMealPlan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meal Plan</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-madina-meal">
                                  <SelectValue placeholder="Select meal plan" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {activeMeals.map(meal => (
                                  <SelectItem key={meal.id} value={meal.name}>
                                    {meal.name} - SAR {Number(meal.pricePerDay)}/day
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
                        name="madinaLaundry"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-madina-laundry"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Include Laundry</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transport */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="h-5 w-5" />
                    Transportation
                  </CardTitle>
                  <CardDescription>Select transport routes and vehicle types</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeTransport.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No transport options available. Add transport in Master Data.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activeTransport.map(transport => {
                        const isSelected = selectedTransport.some(t => t.transportId === transport.id);
                        const selectedItem = selectedTransport.find(t => t.transportId === transport.id);
                        return (
                          <div
                            key={transport.id}
                            className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                              isSelected ? "border-primary bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleTransport(transport.id)}
                                data-testid={`checkbox-transport-${transport.id}`}
                              />
                              <div>
                                <p className="font-medium">{transport.routeName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {transport.vehicleType} • Capacity: {transport.capacity} • SAR {Number(transport.pricePerTrip)}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Vehicles:</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateTransportCount(transport.id, (selectedItem?.vehicleCount || 1) - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-semibold">
                                  {selectedItem?.vehicleCount || 1}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateTransportCount(transport.id, (selectedItem?.vehicleCount || 1) + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Visa */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visa</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="visaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visa Type</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger data-testid="select-visa">
                              <SelectValue placeholder="Select visa type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {activeVisa.map(visa => (
                              <SelectItem key={visa.id} value={visa.id.toString()}>
                                {visa.visaType} - SAR {Number(visa.price)} ({visa.processingDays} days processing)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Add-ons */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Gift className="h-5 w-5" />
                    Optional Add-ons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeAddons.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No add-ons available. Add add-ons in Master Data.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {activeAddons.map(addon => {
                        const isSelected = selectedAddons.some(a => a.addonId === addon.id);
                        const selectedItem = selectedAddons.find(a => a.addonId === addon.id);
                        return (
                          <div
                            key={addon.id}
                            className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                              isSelected ? "border-primary bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleAddon(addon.id)}
                                data-testid={`checkbox-addon-${addon.id}`}
                              />
                              <div>
                                <p className="font-medium">{addon.name}</p>
                                <p className="text-sm text-muted-foreground">SAR {Number(addon.price)}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateAddonQuantity(addon.id, (selectedItem?.quantity || 1) - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-semibold">
                                  {selectedItem?.quantity || 1}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateAddonQuantity(addon.id, (selectedItem?.quantity || 1) + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any special requirements or notes..."
                            rows={4}
                            data-testid="textarea-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Pricing Summary - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calculator className="h-5 w-5" />
                      Pricing Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hotel (Makkah)</span>
                        <span className="font-mono">£ {calculations.hotelCostMakkah.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hotel (Madina)</span>
                        <span className="font-mono">£ {calculations.hotelCostMadina.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Meals (Makkah)</span>
                        <span className="font-mono">£ {calculations.mealCostMakkah.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Meals (Madina)</span>
                        <span className="font-mono">£ {calculations.mealCostMadina.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Laundry</span>
                        <span className="font-mono">£ {calculations.laundryCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transport</span>
                        <span className="font-mono">£ {calculations.transportCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Visa</span>
                        <span className="font-mono">£ {calculations.visaCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Add-ons</span>
                        <span className="font-mono">£ {calculations.addonsCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service Charges</span>
                        <span className="font-mono">£ {calculations.serviceChargeCost.toFixed(2)}</span>
                      </div>
                      {calculations.discountAmount > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Discount</span>
                          <span className="font-mono">-£ {calculations.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="rounded-lg bg-primary/10 p-4">
                        <p className="text-sm text-muted-foreground">Total Package</p>
                        <p className="text-2xl font-bold font-mono" data-testid="text-total-gbp">
                          £ {calculations.totalInr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Per Person ({payingTravelers} paying)</p>
                        <p className="text-xl font-bold font-mono" data-testid="text-per-person-gbp">
                          £ {calculations.perPersonInr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {watchedValues.adults} Adults + {watchedValues.children} Children + {watchedValues.infants} Infants
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-quotation"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    isEditMode ? "Updating..." : "Creating..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditMode ? "Update Quotation" : "Save Quotation"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
