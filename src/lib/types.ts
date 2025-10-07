
export type Role = "Colaborador" | "Líder" | "Diretor" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
}

export interface Employee {
  id: string; 
  id3a: string;
  name: string;
  email: string;
  photoURL?: string;
  axis?: string;
  area?: string;
  position?: string;
  segment?: string;
  leader?: string;
  city?: string;
  role?: Role;
  team?: string;
  diagnosis?: Diagnosis;
  riskScore?: number;
}

export interface Interaction {
  id: string;
  type: "1:1" | "Feedback" | "N3 Individual" | "Índice de Risco";
  date: string; // ISO 8601 string
  notes: string;
  authorId: string;
  riskScore?: number; // Add riskScore to interaction
}

export interface PDIAction {
  id: string;
  action: string;
  category: "Technical" | "Soft Skill" | "Leadership" | "Career";
  dueDate: string; // ISO 8601 string
  status: "Not Started" | "In Progress" | "Completed";
}

export interface Diagnosis {
    status: "Concluído" | "Em Andamento" | "Pendente";
    date: string; // ISO 8601 string
    details: string;
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
  diagnosis: Diagnosis;
}
