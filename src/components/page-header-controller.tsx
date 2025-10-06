"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "./page-header";
import { teamMembers } from "@/lib/data";

const titles: { [key: string]: { title: string; description?: string } } = {
  "/dashboard": {
    title: "Dashboard de Liderança",
    description: "Acompanhe as métricas e o engajamento da sua equipe.",
  },
  "/dashboard/team": {
    title: "Equipe",
    description: "Visualize e gerencie os membros da sua equipe.",
  },
  "/dashboard/risk-analysis": {
    title: "Análise de Risco",
    description: "Identifique e mitigue riscos relacionados à sua equipe.",
  },
  "/dashboard/admin": {
    title: "Gerenciamento de Admin",
    description: "Configure as permissões e ajustes gerais do sistema.",
  },
};

function getPageDetails(pathname: string): { title: string; description?: string } {
  if (pathname.startsWith("/dashboard/team/")) {
    const id = pathname.split("/").pop();
    const member = teamMembers.find((m) => m.id === id);
    return {
      title: member ? member.name : "Detalhes do Membro",
      description: "Informações detalhadas e histórico do membro da equipe.",
    };
  }
  return titles[pathname] || { title: "Nina 1.0" };
}

export function PageHeaderController() {
  const pathname = usePathname();
  const { title, description } = getPageDetails(pathname);

  return <PageHeader title={title} description={description} />;
}
