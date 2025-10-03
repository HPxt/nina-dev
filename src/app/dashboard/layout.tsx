import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Icons } from "@/components/icons";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { currentUser } from "@/lib/data";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
        </SidebarHeader>
        <SidebarContent>
          <MainNav userRole={currentUser.role} />
        </SidebarContent>
        <SidebarFooter>
          <UserNav user={currentUser} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <PageHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
