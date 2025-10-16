# Nina 1.0 - Plataforma de Gestão de Liderança

Bem-vindo à Nina 1.0, uma aplicação web desenvolvida para otimizar a gestão de equipes, o acompanhamento de performance e o desenvolvimento individual dos colaboradores na 3A RIVA Investimentos.

## Visão Geral

A plataforma centraliza informações cruciais sobre colaboradores e interações, fornecendo aos líderes e gestores as ferramentas necessárias para um acompanhamento próximo e eficaz. A aplicação utiliza Next.js, Firebase (Firestore e Authentication) e Tailwind CSS para uma experiência moderna, segura e em tempo real.

---

## Funcionalidades Principais

A aplicação é dividida em várias páginas, cada uma com um propósito específico. O acesso a certas funcionalidades é restrito com base no papel do usuário (Colaborador, Líder, Diretor, Admin).

### 1. Autenticação

A porta de entrada para a plataforma.

-   **Página:** Tela de Login (`/`)
-   **Funcionalidade:**
    -   Login seguro realizado exclusivamente através de contas Google (@3ainvestimentos.com.br).
    -   Após a autenticação, o sistema verifica se o email do usuário está cadastrado na base de dados e se ele possui um papel de `Líder`, `Diretor` ou `Admin`.
    -   Usuários com o papel de `Colaborador` não têm permissão para acessar o dashboard, garantindo que apenas a liderança utilize a ferramenta.

### 2. Dashboard de Liderança

A visão geral para o acompanhamento das interações da equipe.

-   **Página:** `/dashboard/v2`
-   **Funcionalidade:**
    -   **Tabela de Frequência:** Exibe uma lista de todos os colaboradores gerenciados, agrupados por área.
    -   **Status de Interação:** Para cada colaborador, a tabela mostra o status de interações obrigatórias (`1:1`, `PDI`, `Índice de Risco`, `N3 Individual`) dentro de um período selecionado. Os status incluem:
        -   `N/A`: A interação não é aplicável para o colaborador ou período.
        -   `Realizado X/Y`: Mostra o progresso (ex: "Realizado 1/4").
        -   `Executada`: Todas as interações obrigatórias foram concluídas.
        -   `Pendente` ou `Realizado 0/X`: Nenhuma interação foi realizada.
    -   **Visualização Detalhada:** Um accordion permite expandir cada colaborador para visualizar o status detalhado de cada tipo de interação e a aderência geral.
    -   **Filtros Avançados:**
        -   **Equipe:** Diretores e Admins podem filtrar a visualização por líder.
        -   **Tipo de Interação:** Foco em um tipo de interação específico, com a periodicidade de cada uma claramente indicada (ex: "1:1 - Trimestral").
        -   **Status:** Filtragem por interações já executadas ou pendentes.
        -   **Período:** Seleção de um intervalo de datas customizado.

### 3. Acompanhamento Individual

O centro para registrar e consultar o histórico de um colaborador.

-   **Página:** `/dashboard/individual-tracking`
-   **Funcionalidade:**
    -   **Seleção de Colaborador:** O líder escolhe um membro da sua equipe para visualizar os detalhes.
    -   **Linha do Tempo:** Exibe um histórico cronológico de todas as interações registradas (1:1, Feedback, N3, Índice de Risco), com a possibilidade de expandir cada item para ver os detalhes.
    -   **Registro de Novas Interações:**
        -   Um formulário modal permite registrar novas interações, com campos específicos para `1:1`, `N3 Individual`, e um campo de texto simples para `Feedback`.
        -   Inclui a seleção de data para a próxima interação, facilitando o planejamento.
    -   **Avaliação de Risco:** O registro de "Índice de Risco" abre um formulário dedicado para uma avaliação ponderada em múltiplas categorias (performance, atendimento, remuneração, etc.), que calcula uma pontuação final.

### 4. Plano de Desenvolvimento Individual (PDI)

Ferramenta para gerenciar o crescimento profissional do colaborador.

-   **Página:** `/dashboard/pdi`
-   **Funcionalidade:**
    -   **Diagnóstico Profissional:** Permite adicionar ou editar um diagnóstico geral do colaborador, incluindo status (`Pendente`, `Em Andamento`, `Concluído`) e detalhes sobre pontos fortes e fracos.
    -   **Tabela de Ações PDI:**
        -   Lista todas as ações de desenvolvimento para o colaborador selecionado.
        -   Permite adicionar, editar e remover ações, cada uma com descrição, datas de início e prazo, e status.

### 5. Análise de Risco

Uma visão comparativa e histórica do risco dos colaboradores.

-   **Página:** `/dashboard/risk-analysis`
-   **Funcionalidade:**
    -   **Seleção Múltipla:** Um modal avançado com tabela e filtros permite selecionar múltiplos colaboradores para análise.
    -   **Gráfico de Distribuição Atual:** Um gráfico de barras compara o índice de risco atual dos colaboradores selecionados. As cores indicam o nível de alerta.
    -   **Gráfico de Série Histórica:** Um gráfico de linhas mostra a evolução do índice de risco ao longo do tempo para os colaboradores selecionados, permitindo identificar tendências.

### 6. Ranking de Aderência

Gamificação e monitoramento da performance da liderança.

-   **Página:** `/dashboard/ranking`
-   **Funcionalidade:**
    -   **Ranking de Líderes:** Exibe uma lista de líderes ordenada pelo "Índice de Aderência".
    -   **Índice de Aderência:** É um percentual que representa a proporção de interações obrigatórias (`1:1`, `PDI`, `N3 Individual`, `Índice de Risco`) realizadas em relação ao total previsto para suas equipes no período selecionado.
    -   **Filtros:** Permite filtrar o ranking por eixo organizacional e por período.

### 7. Configurações (Admin)

A área de gerenciamento central da aplicação, acessível apenas por administradores.

-   **Página:** `/dashboard/admin`
-   **Funcionalidade:**
    -   **Gerenciamento de Funcionários:**
        -   Tabela completa com todos os funcionários e filtros por nome, segmento, cargo, líder, etc.
        -   Permite adicionar, editar e remover funcionários.
        -   Atribuição de Líder, Função (`Líder`/`Colaborador`), e permissões especiais (`Diretor`, `Admin`).
        -   Controle do status de `Gerenciamento` (se o colaborador deve ou não aparecer nos dashboards de acompanhamento).
    -   **Upload de CSV:** Funcionalidade para importar ou atualizar dados de funcionários em massa a partir de um arquivo CSV.
    -   **Visualização de Equipes:** Agrupamento de colaboradores por líder, facilitando a visualização da estrutura das equipes.
    -   **Backup de Dados:** Ferramenta para selecionar colaboradores e exportar seu histórico completo de interações e PDI em formato `CSV` ou `PDF`.
    -   **Configurações Gerais:** Área para futuras configurações globais da aplicação, como modo de manutenção.

---

Este README.md serve como um guia de referência para todas as funcionalidades implementadas na plataforma Nina 1.0.
