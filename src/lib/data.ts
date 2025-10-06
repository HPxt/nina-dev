import type { TeamMember } from "./types";

export const currentUser = {
  id: "user-1",
  name: "Ana Silva",
  email: "ana.silva@example.com",
  avatarUrl: "https://picsum.photos/seed/AnaS/100/100",
  role: "Admin" as const,
};

export const teamMembers: TeamMember[] = [
  {
    id: "user-1",
    name: "Ana Silva",
    email: "ana.silva@example.com",
    avatarUrl: "https://picsum.photos/seed/AnaS/100/100",
    role: "Admin",
    team: "Gerência",
    position: "Diretora de RH",
    lastOneOnOne: "2024-05-20T10:00:00Z",
    oneOnOneStatus: "Em dia",
    risk: { score: 15, health: 90, satisfaction: 85, performance: 95 },
    timeline: [
      { id: "int-1", type: "N3 Individual", date: "2024-04-15T10:00:00Z", notes: "Revisão de desempenho anual. Performance excelente.", authorId: "user-0" },
      { id: "int-2", type: "N3 Individual", date: "2024-01-20T10:00:00Z", notes: "Definição de metas para o Q1. Foco em expansão da equipe.", authorId: "user-0" },
    ],
    pdi: [
      { id: "pdi-1", action: "Curso Avançado de Liderança", category: "Leadership", dueDate: "2024-09-30T10:00:00Z", status: "In Progress" },
    ],
    diagnosis: {
      status: "Concluído",
      date: "2024-03-10T10:00:00Z",
      details: "A colaboradora demonstra fortes habilidades de liderança e gestão de pessoas. Próximos passos incluem focar em estratégias de expansão global da equipe de RH."
    }
  },
  {
    id: "user-2",
    name: "Carlos Souza",
    email: "carlos.souza@example.com",
    avatarUrl: "https://picsum.photos/seed/CarlosS/100/100",
    role: "Líder",
    team: "Engenharia",
    position: "Líder Técnico",
    lastOneOnOne: "2024-05-10T10:00:00Z",
    oneOnOneStatus: "Atenção",
    risk: { score: 45, health: 70, satisfaction: 60, performance: 80 },
    timeline: [
      { id: "int-3", type: "1:1", date: "2024-05-10T10:00:00Z", notes: "Conversa sobre o andamento do projeto X. Demonstrou preocupação com prazos.", authorId: "user-1" },
      { id: "int-4", type: "Feedback", date: "2024-04-22T10:00:00Z", notes: "Feedback positivo sobre a mentoria de novos membros.", authorId: "user-1" },
    ],
    pdi: [
      { id: "pdi-2", action: "Certificação em AWS Architect", category: "Technical", dueDate: "2024-07-31T10:00:00Z", status: "In Progress" },
      { id: "pdi-3", action: "Workshop de Comunicação Não-Violenta", category: "Soft Skill", dueDate: "2024-06-20T10:00:00Z", status: "Not Started" },
    ],
    diagnosis: {
        status: "Em Andamento",
        date: "2024-05-15T10:00:00Z",
        details: "Apresenta excelente conhecimento técnico, mas precisa desenvolver habilidades de comunicação para gerenciar conflitos na equipe de forma mais eficaz."
    }
  },
  {
    id: "user-3",
    name: "Bruno Lima",
    email: "bruno.lima@example.com",
    avatarUrl: "https://picsum.photos/seed/BrunoL/100/100",
    role: "Colaborador",
    team: "Engenharia",
    position: "Desenvolvedor Sênior",
    lastOneOnOne: "2024-04-05T10:00:00Z",
    oneOnOneStatus: "Atrasado",
    risk: { score: 70, health: 50, satisfaction: 40, performance: 65 },
    timeline: [
      { id: "int-5", type: "1:1", date: "2024-04-05T10:00:00Z", notes: "Mencionou estar se sentindo desmotivado com as tarefas atuais.", authorId: "user-2" },
    ],
    pdi: [
      { id: "pdi-4", action: "Aprender nova linguagem de programação (Rust)", category: "Technical", dueDate: "2024-12-31T10:00:00Z", status: "Not Started" },
    ],
    diagnosis: {
        status: "Pendente",
        date: "2024-01-01T10:00:00Z",
        details: "Diagnóstico ainda não iniciado. Agendar reunião para levantamento de pontos fortes e de desenvolvimento."
    }
  },
  {
    id: "user-4",
    name: "Daniela Costa",
    email: "daniela.costa@example.com",
    avatarUrl: "https://picsum.photos/seed/DanielaC/100/100",
    role: "Colaborador",
    team: "Engenharia",
    position: "Desenvolvedora Pleno",
    lastOneOnOne: "2024-05-28T10:00:00Z",
    oneOnOneStatus: "Em dia",
    risk: { score: 25, health: 80, satisfaction: 90, performance: 88 },
    timeline: [
      { id: "int-6", type: "1:1", date: "2024-05-28T10:00:00Z", notes: "Alinhamento semanal, tudo correndo bem. Mostrou interesse em novos desafios.", authorId: "user-2" },
    ],
    pdi: [
      { id: "pdi-5", action: "Participar como palestrante em um meetup interno", category: "Soft Skill", dueDate: "2024-08-15T10:00:00Z", status: "Not Started" },
    ],
    diagnosis: {
        status: "Concluído",
        date: "2024-04-20T10:00:00Z",
        details: "Colaboradora proativa e com rápido aprendizado. Apresenta grande potencial para assumir mais responsabilidades em projetos complexos. Ponto de atenção é a gestão de tempo em tarefas múltiplas."
    }
  },
  {
    id: "user-5",
    name: "Eduardo Pinto",
    email: "eduardo.pinto@example.com",
    avatarUrl: "https://picsum.photos/seed/EduardoP/100/100",
    role: "Líder",
    team: "Produto",
    position: "Gerente de Produto",
    lastOneOnOne: "2024-05-29T10:00:00Z",
    oneOnOneStatus: "Em dia",
    risk: { score: 30, health: 85, satisfaction: 75, performance: 85 },
    timeline: [
      { id: "int-7", type: "1:1", date: "2024-05-29T10:00:00Z", notes: "Discussão sobre o roadmap do Q3.", authorId: "user-1" },
    ],
    pdi: [],
    diagnosis: {
        status: "Em Andamento",
        date: "2024-05-05T10:00:00Z",
        details: "Ótima visão de produto e mercado. Precisa aprimorar a forma como comunica as prioridades e o racional por trás das decisões para o time de desenvolvimento."
    }
  },
  {
    id: "user-6",
    name: "Fernanda Dias",
    email: "fernanda.dias@example.com",
    avatarUrl: "https://picsum.photos/seed/FernandaD/100/100",
    role: "Colaborador",
    team: "Produto",
    position: "UX/UI Designer",
    lastOneOnOne: "2024-05-12T10:00:00Z",
    oneOnOneStatus: "Atenção",
    risk: { score: 40, health: 75, satisfaction: 70, performance: 70 },
    timeline: [],
    pdi: [
      { id: "pdi-6", action: "Curso de Design Systems", category: "Technical", dueDate: "2024-10-31T10:00:00Z", status: "Not Started" },
    ],
    diagnosis: {
        status: "Pendente",
        date: "2024-02-15T10:00:00Z",
        details: "Diagnóstico pendente. Agendar sessão para avaliar as competências de UX e alinhar expectativas de carreira."
    }
  },
];
