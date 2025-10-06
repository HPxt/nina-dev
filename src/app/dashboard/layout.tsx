import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { currentUser } from "@/lib/data";
import { PageHeaderController } from "@/components/page-header-controller";

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
        <PageHeaderController />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
