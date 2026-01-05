import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navigation, type NavItem } from "@/config/navigation";
import { Home, Menu, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

// Find the current page title from navigation
function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Home";

  for (const section of navigation) {
    for (const item of section.items) {
      if (pathname === item.url) return item.title;
      if (item.items) {
        const subItem = item.items.find((sub: NavItem) => sub.url === pathname);
        if (subItem) return subItem.title;
      }
    }
  }
  return "DesignTools";
}

// Custom icon for DesignTools (gear + smokestack)
function DesignToolsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Smokestack */}
      <rect x="14" y="8" width="6" height="14" rx="1" />
      <path d="M17 8V5" />
      <path d="M15 2c0 1 1 2 2 2s2-1 2-2" />
      {/* Gear */}
      <circle cx="8" cy="14" r="3" />
      <path d="M8 10v-1" />
      <path d="M8 19v-1" />
      <path d="M4 14H3" />
      <path d="M13 14h-1" />
      <path d="M5.2 11.2l-.7-.7" />
      <path d="M11.5 17.5l-.7-.7" />
      <path d="M5.2 16.8l-.7.7" />
      <path d="M11.5 10.5l-.7.7" />
    </svg>
  );
}

// Desktop Sidebar Navigation
function DesktopSidebar() {
  const location = useLocation();
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Auto-open section containing current page
  useEffect(() => {
    for (const section of navigation) {
      if (section.items.some((item) => item.url === location.pathname)) {
        setOpenSection(section.title);
        break;
      }
    }
  }, [location.pathname]);

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  return (
    <Sidebar className="hidden md:flex">
      <SidebarHeader className="border-b border-sidebar-border/50 px-5 py-5">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          aria-label="DesignTools Home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6DBA1] text-[#1a3660]">
            <DesignToolsIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-['Jost'] font-semibold text-lg text-white">DesignTools</span>
            <span className="text-xs text-white/60">
              Methods, Standards & Work Design
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                <Link to="/" aria-current={location.pathname === "/" ? "page" : undefined}>
                  <Home className="h-4 w-4" aria-hidden="true" />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <Separator className="bg-sidebar-border/50" />
        <nav aria-label="Main navigation">
          {navigation.map((section) => {
            const isOpen = openSection === section.title;
            const hasActiveItem = section.items.some(
              (item) => item.url === location.pathname
            );

            return (
              <Collapsible
                key={section.title}
                open={isOpen}
                onOpenChange={() => toggleSection(section.title)}
              >
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <button
                      className={`flex items-center justify-between w-full px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-sidebar-accent/50 rounded-md mx-2 ${
                        hasActiveItem
                          ? "text-sidebar-primary"
                          : "text-sidebar-foreground/60"
                      }`}
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-2">
                        <section.icon className="h-4 w-4" aria-hidden="true" />
                        {section.title}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {section.items.map((item) => {
                          const isActive = location.pathname === item.url;
                          return (
                            <SidebarMenuItem key={item.url}>
                              <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={item.description}
                              >
                                <Link
                                  to={item.url}
                                  aria-current={isActive ? "page" : undefined}
                                >
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          })}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}

// Mobile Navigation Component
function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const location = useLocation();

  // Close menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
          data-testid="mobile-menu-trigger"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-xl p-0"
        data-testid="mobile-menu-content"
      >
        {/* Drag handle indicator */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
        </div>

        <SheetHeader className="px-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 font-['Jost']">
              <DesignToolsIcon className="h-5 w-5 text-primary" />
              DesignTools
            </SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(85vh-100px)]">
          <nav className="p-4 space-y-2" aria-label="Mobile navigation">
            {/* Home Link */}
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === "/"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              aria-current={location.pathname === "/" ? "page" : undefined}
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </Link>

            <Separator className="my-3" />

            {/* Navigation Sections */}
            {navigation.map((section) => (
              <Collapsible
                key={section.title}
                open={expandedSections.includes(section.title)}
                onOpenChange={() => toggleSection(section.title)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                    aria-expanded={expandedSections.includes(section.title)}
                  >
                    <div className="flex items-center gap-3">
                      <section.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{section.title}</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        expandedSections.includes(section.title) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-muted pl-4">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <Link
                          key={item.url}
                          to={item.url}
                          onClick={() => setIsOpen(false)}
                          className={`block px-4 py-2.5 rounded-lg transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4 text-center text-xs text-muted-foreground">
          <a
            href="https://coe.montana.edu/bioredhub/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            MSU BioReD Hub
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AppLayout() {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <SidebarProvider>
      <DesktopSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
          <MobileNav />
          <Separator orientation="vertical" className="h-6 hidden md:block" />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-medium truncate">
              <span className="text-foreground md:hidden">{pageTitle}</span>
              <span className="text-muted-foreground hidden md:inline">
                DesignTools 4.01 — Industrial Engineering Toolkit
              </span>
            </h1>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-6" role="main" aria-label="Main content">
          <Outlet />
        </main>
        <footer className="border-t py-4 px-4 md:px-6 text-center text-xs text-muted-foreground hidden md:block">
          <a
            href="https://coe.montana.edu/bioredhub/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            MSU BioReD Hub
          </a>
          {" · "}
          Based on Niebel & Freivalds, 11th Ed.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
