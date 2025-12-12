import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Building2,
  Truck,
  UtensilsCrossed,
  FileCheck,
  Shirt,
  Gift,
  ArrowLeftRight,
  Receipt,
  FileText,
  LogOut,
  Plane,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Quotations",
    url: "/quotations",
    icon: FileText,
  },
  {
    title: "New Quotation",
    url: "/quotations/new",
    icon: Plane,
  },
];

const masterDataItems = [
  {
    title: "Hotels",
    url: "/master/hotels",
    icon: Building2,
  },
  {
    title: "Transport",
    url: "/master/transport",
    icon: Truck,
  },
  {
    title: "Meals",
    url: "/master/meals",
    icon: UtensilsCrossed,
  },
  {
    title: "Visa",
    url: "/master/visa",
    icon: FileCheck,
  },
  {
    title: "Laundry",
    url: "/master/laundry",
    icon: Shirt,
  },
  {
    title: "Add-ons",
    url: "/master/addons",
    icon: Gift,
  },
  {
    title: "Pricing Packages",
    url: "/master/pricing-packages",
    icon: ArrowLeftRight,
  },
  {
    title: "Service Charges",
    url: "/master/service-charges",
    icon: Receipt,
  },
  {
    title: "Company Settings",
    url: "/master/company-settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Plane className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Roshan Tours</span>
            <span className="text-xs text-muted-foreground">& Travels</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Master Data</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {masterDataItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl || ""} className="object-cover" />
              <AvatarFallback className="text-xs">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[120px]">
                {user?.firstName || user?.email || "Admin"}
              </span>
              <span className="text-xs text-muted-foreground">Administrator</span>
            </div>
          </div>
          <a
            href="/api/logout"
            className="p-2 rounded-md hover-elevate text-muted-foreground"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
