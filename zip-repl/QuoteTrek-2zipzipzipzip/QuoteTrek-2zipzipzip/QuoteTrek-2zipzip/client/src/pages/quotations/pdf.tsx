import { useRef, useEffect, useState, useMemo } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { calculatePricing, type SelectedTransport, type SelectedAddon } from "@/lib/pricingCalculator";
import type { Quotation, Hotel, Visa, CompanySettings, Meal, Laundry, PricingPackage, Transport, Addon, ServiceCharge } from "@shared/schema";

interface QuotationWithSelections extends Omit<Quotation, 'makkahRoomBeds' | 'madinaRoomBeds'> {
  selectedTransport?: SelectedTransport[];
  selectedAddons?: SelectedAddon[];
  makkahRoomBeds?: number | null;
  madinaRoomBeds?: number | null;
}

export default function QuotationPDF() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);

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

  const { data: companySettings, isLoading: isLoadingSettings } = useQuery<CompanySettings>({
    queryKey: ["/api/company-settings"],
    staleTime: 0,
    gcTime: 0,
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

  useEffect(() => {
    setCanvasReady(true);
  }, []);

  const getTravelTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      umrah: "Umrah Package",
      ramadan_umrah: "Ramadan Umrah Package",
      international: "International Package",
      domestic: "Domestic Package",
    };
    return labels[type] || type;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!printRef.current) return;
    
    if (companySettings?.logo && logoRef.current && !logoRef.current.complete) {
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 2000);
        if (logoRef.current) {
          logoRef.current.onload = () => {
            clearTimeout(timeout);
            resolve(true);
          };
        }
      });
    }

    const element = printRef.current;
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).jsPDF;
    
    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        windowWidth: 800,
        windowHeight: 1200,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const imgWidth = pageWidth - (margin * 2);
      
      const canvasAspectRatio = canvas.width / canvas.height;
      const imgHeight = imgWidth / canvasAspectRatio;
      
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      
      pdf.save(`${quotation?.quotationNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[800px] w-full max-w-3xl mx-auto" />
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/quotations/${id}`)} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">PDF Preview</h1>
            <p className="text-muted-foreground">{quotation.quotationNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} data-testid="button-print">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload} data-testid="button-download" disabled={isLoadingSettings}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* A4 PDF Preview */}
      <div style={{ maxWidth: '210mm', margin: '0 auto', backgroundColor: '#ffffff', padding: '8mm', display: 'block' }}>
        <div ref={printRef} style={{ width: '100%', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", color: '#1f2937', lineHeight: '1.4', fontSize: '10pt', backgroundColor: '#ffffff', padding: '0' }}>
          {/* Header with Logo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', paddingBottom: '10px', borderBottom: '2px solid #2563eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              {companySettings?.logo && companySettings.logo.trim() ? (
                <img 
                  ref={logoRef}
                  src={companySettings.logo} 
                  alt="Logo" 
                  style={{ maxWidth: '50px', maxHeight: '50px', objectFit: 'contain', display: 'block' }}
                  onLoad={() => {
                    setLogoLoaded(true);
                    console.log('Logo loaded successfully');
                  }}
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    setLogoLoaded(false);
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div style={{ width: '50px', height: '50px', backgroundColor: '#2563eb', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', flexShrink: 0 }}>✈</div>
              )}
              <div>
                <div style={{ fontSize: '14pt', fontWeight: '700', color: '#1f2937', margin: 0 }}>{companySettings?.companyName || 'Roshan Tours & Travels'}</div>
                <div style={{ fontSize: '8pt', color: '#6b7280', margin: '1px 0 0 0' }}>{companySettings?.tagline || 'Professional Umrah & Travel Packages'}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '8pt' }}>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>Quotation</div>
              <div style={{ color: '#6b7280', marginTop: '1px' }}>{quotation.quotationNumber}</div>
              <div style={{ fontSize: '7pt', color: '#9ca3af', marginTop: '2px' }}>{new Date(quotation.createdAt!).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            {/* Customer Details */}
            <div>
              <div style={{ fontSize: '9pt', fontWeight: '700', color: '#2563eb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Customer</div>
              <div style={{ fontSize: '8pt', backgroundColor: '#f3f4f6', padding: '6px', borderRadius: '3px', lineHeight: '1.4' }}>
                <div style={{ marginBottom: '3px' }}><span style={{ fontWeight: '600' }}>Name:</span> {quotation.customerName}</div>
                {quotation.customerEmail && <div style={{ marginBottom: '3px', wordBreak: 'break-all' }}><span style={{ fontWeight: '600' }}>Email:</span> {quotation.customerEmail}</div>}
                {quotation.customerPhone && <div style={{ marginBottom: '3px' }}><span style={{ fontWeight: '600' }}>Phone:</span> {quotation.customerPhone}</div>}
                <div><span style={{ fontWeight: '600' }}>Type:</span> {getTravelTypeLabel(quotation.travelType)}</div>
              </div>
            </div>

            {/* Travelers */}
            <div>
              <div style={{ fontSize: '9pt', fontWeight: '700', color: '#2563eb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Travelers</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px', borderRadius: '3px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12pt', fontWeight: '700', color: '#2563eb' }}>{quotation.adults}</div>
                  <div style={{ fontSize: '7pt', color: '#6b7280' }}>Adults</div>
                </div>
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px', borderRadius: '3px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12pt', fontWeight: '700', color: '#2563eb' }}>{quotation.children}</div>
                  <div style={{ fontSize: '7pt', color: '#6b7280' }}>Children</div>
                </div>
                <div style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', padding: '6px', borderRadius: '3px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12pt', fontWeight: '700', color: '#6b7280' }}>{quotation.infants}</div>
                  <div style={{ fontSize: '7pt', color: '#6b7280' }}>Infants</div>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Schedule */}
          {(quotation.travelDate || quotation.returnDate) && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '9pt', fontWeight: '700', color: '#2563eb', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Travel Schedule</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '8pt' }}>
                {quotation.travelDate && <div style={{ backgroundColor: '#f9fafb', padding: '6px', borderRadius: '3px' }}><span style={{ fontWeight: '600' }}>Depart:</span> {new Date(quotation.travelDate).toLocaleDateString()}</div>}
                {quotation.returnDate && <div style={{ backgroundColor: '#f9fafb', padding: '6px', borderRadius: '3px' }}><span style={{ fontWeight: '600' }}>Return:</span> {new Date(quotation.returnDate).toLocaleDateString()}</div>}
              </div>
            </div>
          )}

          {/* Hotels */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '9pt', fontWeight: '700', color: '#2563eb', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Accommodation</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '8pt' }}>
              <div style={{ backgroundColor: '#f3f4f6', padding: '6px', borderRadius: '3px' }}>
                <div style={{ fontWeight: '700', color: '#1f2937', marginBottom: '2px' }}>Makkah</div>
                {makkahHotel ? (
                  <>
                    <div>{makkahHotel.name}</div>
                    <div style={{ fontSize: '7pt', color: '#6b7280', marginTop: '2px' }}>{quotation.makkahDays}N • {quotation.makkahMealPlan}{quotation.makkahLaundry ? ' • Laundry' : ''}</div>
                  </>
                ) : (
                  <div style={{ color: '#9ca3af' }}>Not selected</div>
                )}
              </div>
              <div style={{ backgroundColor: '#f3f4f6', padding: '6px', borderRadius: '3px' }}>
                <div style={{ fontWeight: '700', color: '#1f2937', marginBottom: '2px' }}>Madina</div>
                {madinaHotel ? (
                  <>
                    <div>{madinaHotel.name}</div>
                    <div style={{ fontSize: '7pt', color: '#6b7280', marginTop: '2px' }}>{quotation.madinaDays}N • {quotation.madinaMealPlan}{quotation.madinaLaundry ? ' • Laundry' : ''}</div>
                  </>
                ) : (
                  <div style={{ color: '#9ca3af' }}>Not selected</div>
                )}
              </div>
            </div>
          </div>

          {/* Visa */}
          {visa && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '9pt', fontWeight: '700', color: '#2563eb', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Visa</div>
              <div style={{ backgroundColor: '#f3f4f6', padding: '6px', borderRadius: '3px', fontSize: '8pt' }}>
                <div><span style={{ fontWeight: '600' }}>Type:</span> {visa.visaType}</div>
                <div style={{ marginTop: '2px' }}><span style={{ fontWeight: '600' }}>Processing:</span> {visa.processingDays} days</div>
              </div>
            </div>
          )}

          {/* Pricing Box */}
          <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px', borderRadius: '4px', marginBottom: '8px' }}>
            <div style={{ fontSize: '8pt', opacity: 0.9, marginBottom: '4px' }}>Total Package Price</div>
            <div style={{ fontSize: '16pt', fontWeight: '700', marginBottom: '5px', fontFamily: "'Courier New', monospace" }}>
              £ {calculatedPricing.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '7pt', opacity: 0.8 }}>
              Per Person: £ {calculatedPricing.perPerson.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Terms and Conditions */}
          {companySettings?.termsAndConditions && (
            <div style={{ marginBottom: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
              <div style={{ fontSize: '9pt', fontWeight: '700', color: '#2563eb', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Terms & Conditions</div>
              <div style={{ fontSize: '7pt', color: '#6b7280', lineHeight: '1.3', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {companySettings.termsAndConditions}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontSize: '7pt', color: '#6b7280', textAlign: 'center' }}>
            <div>Thank you for choosing {companySettings?.companyName || 'Roshan Tours & Travels'}</div>
            <div style={{ marginTop: '2px' }}>Valid for 7 days{companySettings?.phoneNumber && ` | Call: ${companySettings.phoneNumber}`}</div>
            {companySettings?.email && <div style={{ marginTop: '1px' }}>{companySettings.email}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
