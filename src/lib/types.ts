

export type Role = "Colaborador" | "Líder";

export type InteractionStatus = "Executada" | "Atrasado" | "Pendente";
export type InteractionType = "1:1" | "Feedback" | "N3 Individual" | "Índice de Risco";

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
  leaderId?: string;
  leader?: string;
  leaderEmail?: string;
  city?: string;
  role?: Role;
  team?: string;
  diagnosis?: Diagnosis;
  riskScore?: number;
  isUnderManagement?: boolean;
  isDirector?: boolean;
  isAdmin?: boolean;
}

export interface Interaction {
  id: string;
  type: InteractionType;
  date: string; // ISO 8601 string
  notes: string;
  authorId: string;
  riskScore?: number; // Add riskScore to interaction
}

export interface PDIAction {
  id: string;
  employeeId: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "To Do" | "In Progress" | "Completed";
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
  oneOnOneStatus: InteractionStatus;
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

