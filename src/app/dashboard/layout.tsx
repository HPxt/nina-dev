
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
import { currentUser } from "@/lib/data";
import { PageHeaderController } from "@/components/page-header-controller";
import { Settings } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <MainNav userRole={currentUser.role} />
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                {currentUser.role === 'Admin' && (
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
