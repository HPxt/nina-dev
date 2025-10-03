export type Role = "Colaborador" | "Líder" | "Diretor" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
}

export interface Interaction {
  id: string;
  type: "1-on-1" | "Feedback" | "Goal Setting" | "Performance Review" | "General Note";
  date: string;
  notes: string;
  authorId: string;
}

export interface PDIAction {
  id: string;
  action: string;
  category: "Technical" | "Soft Skill" | "Leadership" | "Career";
  dueDate: string;
  status: "Not Started" | "In Progress" | "Completed";
}

export interface TeamMember extends User {
  team: string;
  position: string;
  lastOneOnOne: string;
  oneOnOneStatus: "Em dia" | "Atenção" | "Atrasado";
  risk: {
    score: number;
    health: number;
    satisfaction: number;
    performance: number;
  };
  timeline: Interaction[];
  pdi: PDIAction[];
}
