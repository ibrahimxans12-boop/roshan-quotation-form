import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import QuotationList from "@/pages/quotations/list";
import QuotationBuilder from "@/pages/quotations/builder";
import QuotationView from "@/pages/quotations/view";
import QuotationPDF from "@/pages/quotations/pdf";
import HotelsPage from "@/pages/master/hotels";
import TransportPage from "@/pages/master/transport";
import MealsPage from "@/pages/master/meals";
import VisaPage from "@/pages/master/visa";
import LaundryPage from "@/pages/master/laundry";
import AddonsPage from "@/pages/master/addons";
import PricingPackagesPage from "@/pages/master/pricing-packages";
import ServiceChargesPage from "@/pages/master/service-charges";
import CompanySettingsPage from "@/pages/master/company-settings";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/quotations" component={QuotationList} />
        <Route path="/quotations/new" component={QuotationBuilder} />
        <Route path="/quotations/:id" component={QuotationView} />
        <Route path="/quotations/:id/edit" component={QuotationBuilder} />
        <Route path="/quotations/:id/pdf" component={QuotationPDF} />
        <Route path="/master/hotels" component={HotelsPage} />
        <Route path="/master/transport" component={TransportPage} />
        <Route path="/master/meals" component={MealsPage} />
        <Route path="/master/visa" component={VisaPage} />
        <Route path="/master/laundry" component={LaundryPage} />
        <Route path="/master/addons" component={AddonsPage} />
        <Route path="/master/pricing-packages" component={PricingPackagesPage} />
        <Route path="/master/service-charges" component={ServiceChargesPage} />
        <Route path="/master/company-settings" component={CompanySettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
