"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Banknote,
  Bot,
  FilePenLine,
  Gavel,
  Languages,
  LayoutDashboard,
  Leaf,
  LogIn,
  LogOut,
  Map,
  Shield,
  User,
  Users,
  Vote,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontSizeSlider } from "./font-size-slider";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/funds", label: "Funds Overview", icon: Banknote },
  { href: "/budget", label: "Budget Voting", icon: Vote },
  { href: "/grievance", label: "Submit Grievance", icon: FilePenLine },
  { href: "/heatmap", label: "Grievance Heatmap", icon: Map },
  { href: "/politicians", label: "Politician Tracker", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const chatbotItems = [
  { href: "/legal-chatbot", label: "Legal Chatbot", icon: Gavel },
  { href: "/rti-chatbot", label: "RTI Chatbot", icon: Bot },
  { href: "/general-chatbot", label: "General Chatbot", icon: Bot },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold text-primary">
              Jana Vedhi
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <SidebarGroup>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>AI Assistants</SidebarGroupLabel>
            <SidebarMenu>
              {chatbotItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <UserMenu />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Breadcrumbs or page title can go here */}
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <FontSizeSlider />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function UserMenu() {
  const { user, userRole, signOut: logOut } = useAuth();

  if (!user) {
    return (
      <Button asChild variant="ghost" className="w-full justify-start">
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4" />
          Log In
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-start gap-2 p-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
            <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="text-left group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium">{user.displayName ?? 'Citizen'}</p>
            <p className="text-xs text-sidebar-foreground/70">
              {user.email ?? 'user@example.com'}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName ?? 'Citizen'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        {userRole === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LanguageSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Switch Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>English</DropdownMenuItem>
        <DropdownMenuItem>മലയാളം</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
