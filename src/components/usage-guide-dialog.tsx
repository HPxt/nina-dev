
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const guideSections = [
    {
        title: "Dashboard de Liderança",
        content: "Esta é a tela principal, oferecendo uma visão completa do status das interações com sua equipe. A tabela de frequência mostra o progresso das interações obrigatórias (1:1, PDI, Índice de Risco, N3 Individual) para cada colaborador dentro do período selecionado. Use o menu expansível (clicando no nome do colaborador) para ver um resumo detalhado e a aderência geral."
    },
    {
        title: "Acompanhamento Individual",
        content: "Centralize o registro e a consulta do histórico de um colaborador. Escolha um membro da equipe para visualizar uma linha do tempo com todas as interações. Para registrar um novo evento, use o botão 'Nova Interação'. Formulários específicos estão disponíveis para 1:1, N3 Individual e Avaliação de Risco."
    },
    {
        title: "Plano de Desenvolvimento Individual (PDI)",
        content: "Gerencie o crescimento de cada membro da equipe. Nesta página, você pode adicionar ou editar um 'Diagnóstico Profissional', que resume os pontos fortes e fracos do colaborador. Abaixo, a tabela de ações permite adicionar, editar e acompanhar tarefas específicas de desenvolvimento, cada uma com descrição, prazos e status."
    },
    {
        title: "Análise de Risco",
        content: "Compare e analise o índice de risco dos colaboradores. A ferramenta permite selecionar múltiplos membros da equipe para uma análise comparativa. O gráfico de barras mostra a distribuição de risco atual, enquanto o gráfico de linhas exibe a evolução histórica, ajudando a identificar tendências."
    },
    {
        title: "Ranking de Aderência",
        content: "Monitore a performance da liderança de forma gamificada. Esta página exibe um ranking de líderes baseado no 'Índice de Aderência', que é o percentual de interações obrigatórias realizadas em relação ao total previsto para suas equipes no período. É o principal indicador de performance da liderança."
    },
    {
        title: "Configurações (Admin)",
        content: "Área de gerenciamento central, acessível apenas por administradores. Permite gerenciar todos os funcionários (adicionar, editar, remover), fazer upload de dados em massa via CSV, visualizar a estrutura completa das equipes e exportar backups de dados."
    }
];

const faqSections = [
    {
        question: "Quais interações são obrigatórias e quando devo realizá-las?",
        answer: "As interações obrigatórias e suas frequências são:\n\n- **N3 Individual:** Frequência varia com o segmento do colaborador (Alfa: 4/mês, Beta: 2/mês, Senior: 1/mês).\n- **Índice de Risco:** Mensal.\n- **1:1 (One-on-One):** Trimestral, com registros esperados nos meses de Março, Junho, Setembro e Dezembro.\n- **PDI (Diagnóstico):** Semestral, com registros esperados nos meses de Janeiro e Julho."
    },
    {
        question: "Como o 'Índice de Aderência' é calculado no Ranking?",
        answer: "O Índice de Aderência mede a proporção de interações obrigatórias que um líder realizou com sua equipe em relação ao total previsto para o período selecionado. Por exemplo, se um líder deveria ter 10 interações no mês e realizou 8, seu índice será de 80%. Apenas as interações 'N3 Individual', 'Índice de Risco', '1:1' e 'PDI' contam para este cálculo."
    },
    {
        question: "Por que não consigo ver todos os colaboradores nos filtros?",
        answer: "Seu nível de acesso determina quem você pode visualizar. Líderes veem apenas os membros de sua equipe direta. Diretores e Administradores têm permissão para visualizar todos os colaboradores da empresa e usar o filtro de equipes para focar em um líder específico."
    },
     {
        question: "O que significa o status 'Realizado X/Y'?",
        answer: "Este status indica o progresso de uma interação obrigatória. Por exemplo, 'Realizado 1/4' para um 1:1 significa que uma das quatro interações anuais esperadas já foi registrada. Quando todas as interações do período forem concluídas, o status mudará para 'Executada'."
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
          <DialogTitle>Guia de Uso do CRM Interno 1.0</DialogTitle>
          <DialogDescription>
            Encontre aqui todas as informações sobre as funcionalidades da plataforma.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="faq">Perguntas Frequentes (FAQ)</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-6 -mr-6">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-0">
                            <AccordionTrigger>Autenticação</AccordionTrigger>
                            <AccordionContent className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                                <p>O login é seguro e realizado exclusivamente através de contas Google corporativas. Após a autenticação, o sistema verifica se o usuário possui um papel de `Líder`, `Diretor` ou `Admin` para conceder o acesso. Usuários com o papel de `Colaborador` não têm permissão para acessar o dashboard.</p>
                            </AccordionContent>
                        </AccordionItem>
                        {guideSections.map((section, index) => (
                            <AccordionItem value={`item-${index + 1}`} key={index}>
                                <AccordionTrigger>{section.title}</AccordionTrigger>
                                <AccordionContent className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                                    <p>{section.content}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </ScrollArea>
            </TabsContent>
            <TabsContent value="faq" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-6 -mr-6">
                    <Accordion type="single" collapsible className="w-full">
                        {faqSections.map((faq, index) => (
                            <AccordionItem value={`faq-${index}`} key={index}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                                    <p className="whitespace-pre-wrap">{faq.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </ScrollArea>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
