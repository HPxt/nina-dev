
"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "./page-header";

const titles: { [key: string]: { title: string; description?: string } } = {
  "/dashboard/lideranca": {
    title: "Dashboard de Liderança",
    description: "Acompanhe as métricas e o engajamento da sua equipe.",
  },
  "/dashboard": { // Fallback for the old path
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
    description: "O Índice de Aderência é o principal indicador de performance da liderança. Ele mede, em percentual, a proporção de interações obrigatórias (1:1, PDI, N3 Individual, Índice de Risco) que um líder realizou com sua equipe em relação ao total previsto para o período selecionado. Por exemplo, se um líder deveria ter 10 interações no mês e realizou 8, seu índice será de 80%.",
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
