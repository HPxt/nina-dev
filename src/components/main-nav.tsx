"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Settings,
} from "lucide-react";
import type { Role } from "@/lib/types";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/team", label: "Equipe", icon: Users },
  { href: "/dashboard/risk-analysis", label: "Análise de Risco", icon: ShieldAlert, roles: ["Líder", "Diretor", "Admin"] },
  { href: "/dashboard/admin", label: "Admin", icon: Settings, roles: ["Admin"] },
];

export function MainNav({ userRole }: { userRole: Role }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        if (item.roles && !item.roles.includes(userRole)) {
          return null;
        }
        
        const isActive =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
