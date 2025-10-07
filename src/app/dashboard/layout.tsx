
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
import { useUser, useCollection, useFirestore } from "@/firebase";
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

  const employeesCollection = useMemo(
    () => (firestore ? collection(firestore, "employees") : null),
    [firestore]
  );
  const { data: employees } = useCollection<Employee>(employeesCollection);

  const currentUserEmployee = useMemo(() => {
    if (!user || !employees) return null;
    return employees.find(e => e.email === user.email);
  }, [user, employees]);

  const adminEmails = useMemo(() => {
    if (!employees) return [];
    return employees.filter(e => e.role === 'Admin').map(e => e.email);
  }, [employees]);

  const userRole = currentUserEmployee?.role;
  const isUserAdmin = user?.email ? adminEmails.includes(user.email) : false;

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
          {userRole && <MainNav userRole={userRole} />}
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                {isUserAdmin && (
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
