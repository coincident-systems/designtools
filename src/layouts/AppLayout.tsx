import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
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
import { BookOpen, Home, Menu, ChevronDown } from "lucide-react";
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

// Desktop Sidebar Navigation
function DesktopSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="hidden md:flex">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          aria-label="DesignTools Home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg">DesignTools</span>
            <span className="text-xs text-sidebar-foreground/60">
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
        <Separator className="bg-sidebar-border" />
        <nav aria-label="Main navigation">
          {navigation.map((section) => (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs tracking-wider">
                <section.icon className="h-4 w-4 mr-2" aria-hidden="true" />
                {section.title}
              </SidebarGroupLabel>
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
            </SidebarGroup>
          ))}
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
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
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
