
"use client";

import { MainNav } from "@/components/main-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PageHeaderController } from "@/components/page-header-controller";
import { Settings } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { useMemo } from 'react';
import type { Employee } from "@/lib/types";
import { collection } from "firebase/firestore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const firestore = useFirestore();

  const employeesCollection = useMemoFirebase(
    () => (firestore && user ? collection(firestore, "employees") : null),
    [firestore, user]
  );
  const { data: employees } = useCollection<Employee>(employeesCollection);

  const currentUserEmployee = useMemo(() => {
    if (!user || !employees) return null;
    const employeeData = employees.find(e => e.email === user.email);

    if (!employeeData) return null;

    // Enhance permissions for admins
    if (employeeData.isAdmin) {
      return {
        ...employeeData,
        role: 'Líder',
        isDirector: true,
      };
    }

    return employeeData;
  }, [user, employees]);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          {/* O trigger foi movido para o SidebarContent */}
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarTrigger className="hidden md:flex" />
            </SidebarMenuItem>
          </SidebarMenu>
          {currentUserEmployee && <MainNav user={currentUserEmployee} />}
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                {currentUserEmployee?.isAdmin && (
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Configurações">
                          <Link href="/dashboard/admin">
                              <Settings />
                              <span>Configurações</span>
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                    <LogoutButton />
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <PageHeaderController />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
