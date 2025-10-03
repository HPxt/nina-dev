"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "./ui/sidebar";

const titles: { [key: string]: string } = {
  "/dashboard": "Dashboard de Liderança",
  "/dashboard/team": "Equipe",
  "/dashboard/risk-analysis": "Análise de Risco",
  "/dashboard/admin": "Gerenciamento de Admin",
};

function getTitle(pathname: string): string {
  if (pathname.startsWith('/dashboard/team/')) {
    return "Detalhes do Membro";
  }
  return titles[pathname] || "Nina 1.0";
}

export function PageHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="font-headline text-2xl font-semibold">
        {getTitle(pathname)}
      </h1>
    </header>
  );
}
