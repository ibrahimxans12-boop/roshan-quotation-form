import { useMemo } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Pencil,
  FileDown,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Building2,
  FileCheck,
  Printer,
  MessageCircle,
} from "lucide-react";
import { generateWhatsAppMessage, openWhatsAppChat } from "@/lib/whatsappMessage";
import { calculatePricing, type SelectedTransport, type SelectedAddon } from "@/lib/pricingCalculator";
import type { Quotation, Hotel, Visa, Meal, Laundry, PricingPackage, Transport, Addon, ServiceCharge } from "@shared/schema";

interface QuotationWithSelections extends Omit<Quotation, 'makkahRoomBeds' | 'madinaRoomBeds'> {
  selectedTransport?: SelectedTransport[];
  selectedAddons?: SelectedAddon[];
  makkahRoomBeds?: number | null;
  madinaRoomBeds?: number | null;
}

export default function QuotationView() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: quotation, isLoading } = useQuery<QuotationWithSelections>({
    queryKey: ["/api/quotations", id],
  });

  const { data: makkahHotel } = useQuery<Hotel>({
    queryKey: ["/api/hotels", quotation?.makkahHotelId],
    enabled: !!quotation?.makkahHotelId,
  });

  const { data: madinaHotel } = useQuery<Hotel>({
    queryKey: ["/api/hotels", quotation?.madinaHotelId],
    enabled: !!quotation?.madinaHotelId,
  });

  const { data: visa } = useQuery<Visa>({
    queryKey: ["/api/visa", quotation?.visaId],
    enabled: !!quotation?.visaId,
  });

  const { data: pricingPackages } = useQuery<PricingPackage[]>({
    queryKey: ["/api/pricing-packages"],
  });

  const { data: meals } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });

  const { data: laundryList } = useQuery<Laundry[]>({
    queryKey: ["/api/laundry"],
  });

  const { data: transportList } = useQuery<Transport[]>({
    queryKey: ["/api/transport"],
  });

  const { data: addonsList } = useQuery<Addon[]>({
    queryKey: ["/api/addons"],
  });

  const { data: serviceCharges } = useQuery<ServiceCharge[]>({
    queryKey: ["/api/service-charges"],
  });

  const calculatedPricing = useMemo(() => {
    if (!quotation) return { total: 0, perPerson: 0 };

    return calculatePricing(
      {
        adults: quotation.adults || 0,
        children: quotation.children || 0,
        infants: quotation.infants || 0,
        discount: quotation.discount,
        pricingPackageId: quotation.pricingPackageId,
        makkahHotelId: quotation.makkahHotelId,
        madinaHotelId: quotation.madinaHotelId,
        makkahDays: quotation.makkahDays,
        madinaDays: quotation.madinaDays,
        makkahRoomBeds: quotation.makkahRoomBeds,
        madinaRoomBeds: quotation.madinaRoomBeds,
        makkahMealPlan: quotation.makkahMealPlan,
        madinaMealPlan: quotation.madinaMealPlan,
        makkahLaundry: quotation.makkahLaundry,
        madinaLaundry: quotation.madinaLaundry,
        visaId: quotation.visaId,
        selectedTransport: quotation.selectedTransport,
        selectedAddons: quotation.selectedAddons,
      },
      {
        makkahHotel,
        madinaHotel,
        visa,
        pricingPackages,
        meals,
        laundryList,
        transportList,
        addonsList,
        serviceCharges,
      }
    );
  }, [quotation, makkahHotel, madinaHotel, visa, pricingPackages, meals, laundryList, transportList, addonsList, serviceCharges]);

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

  const getTravelTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      umrah: "Umrah",
      ramadan_umrah: "Ramadan Umrah",
      international: "International",
      domestic: "Domestic",
    };
    return labels[type] || type;
  };

  const handleSendWhatsApp = () => {
    if (!quotation?.customerPhone) {
      alert("Customer phone number not available");
      return;
    }
    const message = generateWhatsAppMessage(quotation as Quotation, makkahHotel, madinaHotel, visa);
    openWhatsAppChat(quotation.customerPhone, message);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
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

  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium">Quotation not found</p>
        <Link href="/quotations">
          <Button className="mt-4">Back to Quotations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/quotations")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold">{quotation.quotationNumber}</h1>
              {getStatusBadge(quotation.status || "draft")}
            </div>
            <p className="text-muted-foreground">{quotation.customerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/quotations/${quotation.id}/edit`}>
            <Button variant="outline" data-testid="button-edit">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/quotations/${quotation.id}/pdf`}>
            <Button data-testid="button-pdf">
              <FileDown className="mr-2 h-4 w-4" />
              View PDF
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{quotation.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{quotation.customerEmail || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{quotation.customerPhone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Travel Type</p>
                  <Badge variant="outline">{getTravelTypeLabel(quotation.travelType)}</Badge>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold">{quotation.adults}</p>
                  <p className="text-sm text-muted-foreground">Adults</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold">{quotation.children}</p>
                  <p className="text-sm text-muted-foreground">Children</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold">{quotation.infants}</p>
                  <p className="text-sm text-muted-foreground">Infants</p>
                </div>
              </div>

              {(quotation.travelDate || quotation.returnDate) && (
                <>
                  <Separator className="my-6" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Travel Date</p>
                      <p className="font-medium">
                        {quotation.travelDate ? new Date(quotation.travelDate).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Return Date</p>
                      <p className="font-medium">
                        {quotation.returnDate ? new Date(quotation.returnDate).toLocaleDateString() : "-"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Hotel Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Hotel Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Makkah */}
                <div className="space-y-4">
                  <Badge variant="outline">Makkah</Badge>
                  {makkahHotel || quotation.makkahDays ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Hotel</p>
                        <p className="font-medium">{makkahHotel?.name || "Not selected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{quotation.makkahDays || 0} nights</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Meal Plan</p>
                        <p className="font-medium">{quotation.makkahMealPlan || "Not selected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Laundry</p>
                        <p className="font-medium">{quotation.makkahLaundry ? "Included" : "Not included"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hotel selected for Makkah</p>
                  )}
                </div>

                {/* Madina */}
                <div className="space-y-4">
                  <Badge variant="outline">Madina</Badge>
                  {madinaHotel || quotation.madinaDays ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Hotel</p>
                        <p className="font-medium">{madinaHotel?.name || "Not selected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{quotation.madinaDays || 0} nights</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Meal Plan</p>
                        <p className="font-medium">{quotation.madinaMealPlan || "Not selected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Laundry</p>
                        <p className="font-medium">{quotation.madinaLaundry ? "Included" : "Not included"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hotel selected for Madina</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visa */}
          {visa && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileCheck className="h-5 w-5" />
                  Visa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Visa Type</p>
                    <p className="font-medium">{visa.visaType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Processing Time</p>
                    <p className="font-medium">{visa.processingDays} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {quotation.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{quotation.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-primary/10 p-4">
                  <p className="text-sm text-muted-foreground">Total Package</p>
                  <p className="text-2xl font-bold font-mono" data-testid="text-total-gbp">
                    £ {calculatedPricing.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Per Person</p>
                  <p className="text-xl font-bold font-mono" data-testid="text-per-person-gbp">
                    £ {calculatedPricing.perPerson.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {quotation.adults} Adults + {quotation.children} Children + {quotation.infants} Infants
                  </span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Link href={`/quotations/${quotation.id}/pdf`}>
                    <Button className="w-full" data-testid="button-download-pdf">
                      <FileDown className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={() => window.print()} data-testid="button-print">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleSendWhatsApp}
                    disabled={!quotation.customerPhone}
                    data-testid="button-send-whatsapp"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send via WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
