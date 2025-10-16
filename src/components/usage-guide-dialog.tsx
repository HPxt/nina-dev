
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { BookOpen } from "lucide-react";

const guideSections = [
    {
        title: "Visão Geral",
        content: "A plataforma centraliza informações cruciais sobre colaboradores e interações, fornecendo aos líderes e gestores as ferramentas necessárias para um acompanhamento próximo e eficaz, garantindo uma experiência de uso moderna, segura e em tempo real."
    },
    {
        title: "Autenticação",
        content: "O login é seguro e realizado exclusivamente através de contas Google corporativas. Após a autenticação, o sistema verifica se o usuário possui um papel de `Líder`, `Diretor` ou `Admin` para conceder o acesso. Usuários com o papel de `Colaborador` não têm permissão para acessar o dashboard."
    },
    {
        title: "Dashboard de Liderança",
        content: "Nesta tela, você tem uma visão geral para o acompanhamento das interações da equipe. A tabela de frequência exibe todos os colaboradores gerenciados, agrupados por área, e mostra o status de interações obrigatórias (`1:1`, `PDI`, `Índice de Risco`, `N3 Individual`) dentro do período selecionado. Um menu expansível permite detalhar o progresso de cada colaborador, e filtros avançados ajudam a focar a análise."
    },
    {
        title: "Acompanhamento Individual",
        content: "Aqui você pode registrar e consultar o histórico de um colaborador. Selecione um membro da equipe para ver uma linha do tempo cronológica de todas as interações. Use o botão 'Nova Interação' para registrar `1:1`, `Feedback`, `N3 Individual` ou uma `Avaliação de Risco` através de formulários dedicados."
    },
    {
        title: "Plano de Desenvolvimento Individual (PDI)",
        content: "Gerencie o crescimento profissional do colaborador. Nesta página, você pode adicionar ou editar um diagnóstico geral sobre o colaborador (pontos fortes, fracos) e gerenciar uma tabela de ações de desenvolvimento, cada uma com descrição, prazos e status."
    },
    {
        title: "Análise de Risco",
        content: "Tenha uma visão comparativa e histórica do risco dos colaboradores. Um seletor avançado permite escolher vários membros da equipe para análise. Um gráfico de barras compara o índice de risco atual entre eles, enquanto um gráfico de linhas mostra a evolução desse índice ao longo do tempo."
    },
    {
        title: "Ranking de Aderência",
        content: "Acompanhe e gamifique a performance da liderança. Esta página exibe uma lista de líderes ordenada pelo 'Índice de Aderência', um percentual que representa a proporção de interações obrigatórias realizadas em relação ao total previsto para suas equipes no período selecionado."
    },
    {
        title: "Configurações (Admin)",
        content: "Área de gerenciamento central, acessível apenas por administradores. Permite gerenciar funcionários, fazer upload de dados via CSV, visualizar a estrutura das equipes, exportar backups de dados e configurar ajustes gerais da aplicação."
    }
];

export function UsageGuideDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton tooltip="Guia de Uso" className="w-full">
          <BookOpen />
          <span>Guia de Uso</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Guia de Uso da Plataforma</DialogTitle>
          <DialogDescription>
            Encontre aqui todas as informações sobre as funcionalidades da Nina 1.0.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-6 -mr-6">
            <Accordion type="single" collapsible className="w-full">
                {guideSections.map((section, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{section.title}</AccordionTrigger>
                        <AccordionContent className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                            <p>{section.content}</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
