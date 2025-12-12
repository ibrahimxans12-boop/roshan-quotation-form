import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Upload, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { CompanySettings } from "@shared/schema";

export default function CompanySettingsPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: "",
    tagline: "",
    phoneNumber: "",
    email: "",
    address: "",
    logo: "",
    termsAndConditions: "",
  });
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: settings, isLoading } = useQuery<CompanySettings>({
    queryKey: ["/api/company-settings"],
  });

  // Sync settings to form only once when data loads
  useEffect(() => {
    if (settings && !isInitialized) {
      setFormData({
        companyName: settings.companyName || "Roshan Tours & Travels",
        tagline: settings.tagline || "Professional Umrah & Travel Packages",
        phoneNumber: settings.phoneNumber || "",
        email: settings.email || "",
        address: settings.address || "",
        logo: settings.logo || "",
        termsAndConditions: settings.termsAndConditions || "",
      });
      if (settings.logo) setLogoPreview(settings.logo);
      setIsInitialized(true);
    }
  }, [settings, isInitialized]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("PATCH", "/api/company-settings", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Update local state immediately with the response
      setFormData({
        companyName: data.companyName || "Roshan Tours & Travels",
        tagline: data.tagline || "Professional Umrah & Travel Packages",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
        address: data.address || "",
        logo: data.logo || "",
        termsAndConditions: data.termsAndConditions || "",
      });
      if (data.logo) setLogoPreview(data.logo);
      
      // Invalidate and refetch the query
      queryClient.setQueryData(["/api/company-settings"], data);
      
      toast({
        title: "Success",
        description: "Company settings updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update company settings",
        variant: "destructive",
      });
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setFormData((prev) => ({ ...prev, logo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/master/hotels">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Company Settings
          </h1>
          <p className="text-muted-foreground">Configure your company logo and branding</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              Company Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {logoPreview && (
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="max-w-[200px] max-h-[200px] object-contain"
                  data-testid="img-logo-preview"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                data-testid="input-logo-upload"
              />
              <span className="text-sm text-muted-foreground">PNG, JPG or SVG (Max 2MB)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload your company logo. It will be used on all PDFs and in the application header.
            </p>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="Roshan Tours & Travels"
                data-testid="input-company-name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                placeholder="Professional Umrah & Travel Packages"
                data-testid="input-tagline"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+966..."
                  data-testid="input-phone"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="info@example.com"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Office address..."
                rows={3}
                data-testid="textarea-address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
              <Textarea
                id="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={(e) => setFormData((prev) => ({ ...prev, termsAndConditions: e.target.value }))}
                placeholder="Enter your terms and conditions that will appear on quotation PDFs..."
                rows={5}
                data-testid="textarea-terms"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              These terms and conditions will be displayed on all generated quotation PDFs.
            </p>
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto"
          disabled={updateMutation.isPending}
          data-testid="button-save-settings"
        >
          {updateMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
