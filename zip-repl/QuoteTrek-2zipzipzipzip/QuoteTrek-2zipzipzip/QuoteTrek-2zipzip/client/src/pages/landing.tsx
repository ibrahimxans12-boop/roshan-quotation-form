import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Globe, Users, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Plane className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Roshan Tours</span>
              <span className="text-xs text-muted-foreground">& Travels</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="/login">
              <Button data-testid="button-login">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="container relative mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Professional Travel
              <span className="text-primary"> Quotation </span>
              Management
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Create beautiful, accurate quotations for Umrah, Ramadan Umrah, International and Domestic travel packages. 
              Automatic pricing calculations, multi-currency support, and professional PDF generation.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a href="/login">
                <Button size="lg" data-testid="button-get-started">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <Button variant="outline" size="lg" data-testid="button-learn-more">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-card py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need to manage travel quotations
            </h2>
            <p className="mt-4 text-muted-foreground">
              A complete solution for tour operators to create, manage, and share professional quotations.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Multiple Travel Types</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Support for Umrah, Ramadan Umrah, International, and Domestic packages with customized pricing.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Smart Pricing</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Automatic calculations for adults, children, and infants with proper fare rules applied.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">PDF Generation</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Generate professional, print-ready quotation PDFs with your branding and complete details.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Multi-Currency</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Display pricing in SAR and GBP with real-time exchange rate conversions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Travel Types Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Supported Travel Types</h2>
            <p className="mt-4 text-muted-foreground">
              Specialized quotation templates for different types of travel packages.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Umrah", desc: "Holy pilgrimage packages with Makkah & Madina accommodations" },
              { title: "Ramadan Umrah", desc: "Special packages during the blessed month of Ramadan" },
              { title: "International", desc: "Worldwide travel packages with complete itineraries" },
              { title: "Domestic", desc: "Local travel packages within the country" },
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-6 text-center hover-elevate"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">
            Ready to streamline your quotations?
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Sign in now to start creating professional travel quotations in minutes.
          </p>
          <a href="/login">
            <Button size="lg" variant="secondary" className="mt-8" data-testid="button-sign-in-cta">
              Sign In to Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Roshan Tours & Travels. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
