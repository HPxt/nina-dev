
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  ClipboardList,
  ClipboardCheck,
  Trophy,
  UserCog,
} from "lucide-react";
import type { Employee } from "@/lib/types";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard/v2", label: "Dashboard", icon: LayoutDashboard, requiresAuth: true },
  { href: "/dashboard/individual-tracking", label: "Acompanhamento", icon: ClipboardList, requiresAuth: (user: Employee) => user.role === "Líder" || user.isDirector || user.isAdmin },
  { href: "/dashboard/pdi", label: "Plano de Desenvolvimento", icon: ClipboardCheck, requiresAuth: (user: Employee) => user.role === "Líder" || user.isDirector || user.isAdmin },
  { href: "/dashboard/risk-analysis", label: "Análise de Risco", icon: ShieldAlert, requiresAuth: (user: Employee) => user.role === "Líder" || user.isDirector || user.isAdmin },
  { href: "/dashboard/ranking", label: "Ranking", icon: Trophy, requiresAuth: (user: Employee) => user.role === "Líder" || user.isDirector || user.isAdmin },
];

const superAdminEmail = 'matheus@3ainvestimentos.com.br';

export function MainNav({ user }: { user: Employee }) {
  const pathname = usePathname();

  const canShowItem = (item: typeof navItems[0]) => {
    if (typeof item.requiresAuth === 'boolean') {
      return item.requiresAuth;
    }
    if (typeof item.requiresAuth === 'function') {
      return item.requiresAuth(user);
    }
    return true; // Show by default if no auth rule
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        if (!canShowItem(item)) {
          return null;
        }
        
        const isActive =
          item.href === "/dashboard/v2" && (pathname === "/dashboard" || pathname.startsWith("/dashboard/v2"))
            ? true
            : pathname.startsWith(item.href) && item.href !== "/dashboard/v2";

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
       {user.email === superAdminEmail && (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/setup-admin')} tooltip="Setup Admin">
                <Link href="/dashboard/setup-admin">
                    <UserCog />
                    <span>Setup Admin (Temp)</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}
    