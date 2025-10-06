
export type Role = "Colaborador" | "Líder" | "Diretor" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
}

export interface Employee {
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
}

export interface Interaction {
  id: string;
  type: "1:1" | "Feedback" | "N3 Individual";
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

export interface Diagnosis {
    status: "Concluído" | "Em Andamento" | "Pendente";
    date: string;
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
