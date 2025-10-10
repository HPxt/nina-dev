
"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "./page-header";

const titles: { [key: string]: { title: string; description?: string } } = {
  "/dashboard": {
    title: "Dashboard de Liderança",
    description: "Acompanhe as métricas e o engajamento da sua equipe.",
  },
  "/dashboard/individual-tracking": {
    title: "Acompanhamento Individual",
    description: "Registre e acompanhe as interações com sua equipe.",
  },
  "/dashboard/pdi": {
    title: "Plano de Desenvolvimento",
    description: "Visualize e gerencie o PDI e o diagnóstico de cada colaborador.",
  },
  "/dashboard/risk-analysis": {
    title: "Análise de Risco",
    description: "Compare e analise o índice de risco dos colaboradores.",
  },
  "/dashboard/ranking": {
    title: "Ranking de Líderes",
    description: "O Índice de Aderência mede a proporção de interações obrigatórias (1:1, PDI, N3, Risco) realizadas por um líder em relação ao total previsto para sua equipe no período selecionado.",
  },
  "/dashboard/admin": {
    title: "Configurações",
    description: "Configure os ajustes gerais do sistema.",
  },
};

function getPageDetails(pathname: string): { title: string; description?: string } {
  return titles[pathname] || { title: "Nina 1.0" };
}

export function PageHeaderController() {
  const pathname = usePathname();
  const { title, description } = getPageDetails(pathname);

  return <PageHeader title={title} description={description} />;
}
