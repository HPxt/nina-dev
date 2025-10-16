
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { BookOpen } from "lucide-react";

// Conteúdo do README movido diretamente para o arquivo para evitar erros de build.
const readmeContent = `
# Nina 1.0 - Plataforma de Gestão de Liderança

Bem-vindo à Nina 1.0, uma plataforma desenvolvida para otimizar a gestão de equipes, o acompanhamento de performance e o desenvolvimento individual dos colaboradores na 3A RIVA Investimentos.

## Visão Geral

A plataforma centraliza informações cruciais sobre colaboradores e interações, fornecendo aos líderes e gestores as ferramentas necessárias para um acompanhamento próximo e eficaz, garantindo uma experiência de uso moderna, segura e em tempo real.

---

## Funcionalidades Principais

A aplicação é dividida em várias páginas, cada uma com um propósito específico. O acesso a certas funcionalidades é restrito com base no papel do usuário (Colaborador, Líder, Diretor, Admin).

### 1. Autenticação

A porta de entrada para a plataforma.

-   **Funcionalidade:**
    -   Login seguro realizado exclusivamente através de contas Google corporativas (@3ainvestimentos.com.br).
    -   Após a autenticação, o sistema verifica se o usuário possui um papel de \`Líder\`, \`Diretor\` ou \`Admin\` para conceder o acesso.
    -   Usuários com o papel de \`Colaborador\` não têm permissão para acessar o dashboard, garantindo que apenas a liderança utilize a ferramenta.

### 2. Dashboard de Liderança

A visão geral para o acompanhamento das interações da equipe.

-   **Página:** \`/dashboard/v2\`
-   **Funcionalidade:**
    -   **Tabela de Frequência:** Exibe uma lista de todos os colaboradores gerenciados, agrupados por área.
    -   **Status de Interação:** Para cada colaborador, a tabela mostra o status de interações obrigatórias (\`1:1\`, \`PDI\`, \`Índice de Risco\`, \`N3 Individual\`) dentro de um período selecionado. Os status incluem:
        -   \`N/A\`: A interação não é aplicável para o colaborador ou período.
        -   \`Realizado X/Y\`: Mostra o progresso (ex: "Realizado 1/4").
        -   \`Executada\`: Todas as interações obrigatórias foram concluídas.
        -   \`Pendente\` ou \`Realizado 0/X\`: Nenhuma interação foi realizada.
    -   **Visualização Detalhada:** Um menu expansível (accordion) permite detalhar cada colaborador para visualizar o status de cada tipo de interação e a aderência geral.
    -   **Filtros Avançados:**
        -   **Equipe:** Diretores e Admins podem filtrar a visualização por líder.
        -   **Tipo de Interação:** Foco em um tipo de interação específico, com a periodicidade de cada uma claramente indicada (ex: "1:1 - Trimestral").
        -   **Status:** Filtragem por interações já executadas ou pendentes.
        -   **Período:** Seleção de um intervalo de datas customizado.

### 3. Acompanhamento Individual

O centro para registrar e consultar o histórico de um colaborador.

-   **Página:** \`/dashboard/individual-tracking\`
-   **Funcionalidade:**
    -   **Seleção de Colaborador:** O líder escolhe um membro da sua equipe para visualizar os detalhes.
    -   **Linha do Tempo:** Exibe um histórico cronológico de todas as interações registradas (1:1, Feedback, N3, Índice de Risco), com a possibilidade de expandir cada item para ver os detalhes.
    -   **Registro de Novas Interações:**
        -   Um formulário permite registrar novas interações, com campos específicos para \`1:1\`, \`N3 Individual\`, e um campo de texto simples para \`Feedback\`.
        -   Inclui a seleção de data para a próxima interação, facilitando o planejamento.
    -   **Avaliação de Risco:** O registro de "Índice de Risco" abre um formulário dedicado para uma avaliação ponderada em múltiplas categorias (performance, atendimento, remuneração, etc.), que calcula uma pontuação final.

### 4. Plano de Desenvolvimento Individual (PDI)

Ferramenta para gerenciar o crescimento profissional do colaborador.

-   **Página:** \`/dashboard/pdi\`
-   **Funcionalidade:**
    -   **Diagnóstico Profissional:** Permite adicionar ou editar um diagnóstico geral do colaborador, incluindo status (\`Pendente\`, \`Em Andamento\`, \`Concluído\`) e detalhes sobre pontos fortes e fracos.
    -   **Tabela de Ações PDI:**
        -   Lista todas as ações de desenvolvimento para o colaborador selecionado.
        -   Permite adicionar, editar e remover ações, cada uma com descrição, datas de início e prazo, e status.

### 5. Análise de Risco

Uma visão comparativa e histórica do risco dos colaboradores.

-   **Página:** \`/dashboard/risk-analysis\`
-   **Funcionalidade:**
    -   **Seleção Múltipla:** Um seletor avançado com tabela e filtros permite escolher múltiplos colaboradores para análise.
    -   **Gráfico de Distribuição Atual:** Um gráfico de barras compara o índice de risco atual dos colaboradores selecionados. As cores indicam o nível de alerta.
    -   **Gráfico de Série Histórica:** Um gráfico de linhas mostra a evolução do índice de risco ao longo do tempo para os colaboradores selecionados, permitindo identificar tendências.

### 6. Ranking de Aderência

Gamificação e monitoramento da performance da liderança.

-   **Página:** \`/dashboard/ranking\`
-   **Funcionalidade:**
    -   **Ranking de Líderes:** Exibe uma lista de líderes ordenada pelo "Índice de Aderência".
    -   **Índice de Aderência:** É um percentual que representa a proporção de interações obrigatórias (\`1:1\`, \`PDI\`, \`N3 Individual\`, \`Índice de Risco\`) realizadas em relação ao total previsto para suas equipes no período selecionado.
    -   **Filtros:** Permite filtrar o ranking por eixo organizacional e por período.

### 7. Configurações (Admin)

A área de gerenciamento central da aplicação, acessível apenas por administradores.

-   **Página:** \`/dashboard/admin\`
-   **Funcionalidade:**
    -   **Gerenciamento de Funcionários:**
        -   Tabela completa com todos os funcionários e filtros por nome, segmento, cargo, líder, etc.
        -   Permite adicionar, editar e remover funcionários.
        -   Atribuição de Líder, Função (\`Líder\`/\`Colaborador\`), e permissões especiais (\`Diretor\`, \`Admin\`).
        -   Controle do status de \`Gerenciamento\` (se o colaborador deve ou não aparecer nos dashboards de acompanhamento).
    -   **Upload de Funcionários:** Funcionalidade para importar ou atualizar dados de funcionários em massa a partir de um arquivo de planilha (CSV).
    -   **Visualização de Equipes:** Agrupamento de colaboradores por líder, facilitando a visualização da estrutura das equipes.
    -   **Backup de Dados:** Ferramenta para selecionar colaboradores e exportar seu histórico completo de interações e PDI.
    -   **Configurações Gerais:** Área para futuras configurações globais da aplicação, como modo de manutenção.

---

Este guia serve como uma referência para todas as funcionalidades implementadas na plataforma Nina 1.0.
`;

function Markdown({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return <h1 key={i}>{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i}>{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i}>{line.substring(4)}</h3>;
        }
        if (line.startsWith('-   **')) {
          const boldPart = line.match(/\*\*(.*?)\*\*/)?.[1] || '';
          const rest = line.replace(`-   **${boldPart}**`, '');
          return <p key={i}><strong className="font-semibold">{boldPart}</strong>{rest.substring(1)}</p>;
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4 list-disc">{line.substring(2)}</li>;
        }
        if (line.match(/`([^`]+)`/g)) {
            const parts = line.split(/(`[^`]+`)/g);
            return (
              <p key={i}>
                {parts.map((part, index) => {
                  if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={index} className="text-sm bg-muted p-1 rounded-md">{part.slice(1, -1)}</code>;
                  }
                  return part;
                })}
              </p>
            );
        }
        if (line.trim() === '---') {
            return <hr key={i} className="my-4 border-border" />
        }
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

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
      <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Guia de Uso da Plataforma</DialogTitle>
          <DialogDescription>
            Encontre aqui todas as informações sobre as funcionalidades da Nina 1.0.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-6 -mr-6">
          <Markdown content={readmeContent} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
