
"use client";

import { useState, useMemo } from "react";
import type { Employee, Interaction, OneOnOneNotes, N3IndividualNotes } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Timeline } from "@/components/timeline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { RiskAssessmentFormDialog } from "@/components/risk-assessment-form-dialog";
import { Input } from "@/components/ui/input";

type NewInteraction = Omit<Interaction, "id" | "date" | "authorId" | "notes"> & { notes: string | OneOnOneNotes | N3IndividualNotes };

const initialOneOnOneNotes: OneOnOneNotes = {
    companyGrowth: "",
    leaderGrowth: "",
    teamGrowth: "",
    personalLife: "",
    observations: "",
};

const initialN3Notes: N3IndividualNotes = {
    captacao: "",
    churnPF: "",
    roa: "",
    esforcos: "",
    planoAcao: ""
};


export default function IndividualTrackingPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [openInteractionDialog, setOpenInteractionDialog] = useState(false);
  const [openRiskDialog, setOpenRiskDialog] = useState(false);
  const [interactionType, setInteractionType] = useState<Interaction['type']>('1:1');
  const [simpleNotes, setSimpleNotes] = useState("");
  const [oneOnOneNotes, setOneOnOneNotes] = useState<OneOnOneNotes>(initialOneOnOneNotes);
  const [n3Notes, setN3Notes] = useState<N3IndividualNotes>(initialN3Notes);
  const [isSaving, setIsSaving] = useState(false);

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const employeesCollection = useMemoFirebase(
    () => (firestore && user ? collection(firestore, "employees") : null),
    [firestore, user]
  );
  
  const { data: employees, isLoading: areEmployeesLoading } = useCollection<Employee>(employeesCollection);

  const interactionsCollection = useMemoFirebase(
    () => (firestore && selectedEmployeeId ? collection(firestore, "employees", selectedEmployeeId, "interactions") : null),
    [firestore, selectedEmployeeId]
  );

  const { data: interactions, isLoading: areInteractionsLoading } = useCollection<Interaction>(interactionsCollection);
  
  const currentUserEmployee = useMemo(() => {
    if (!user || !employees) return null;
    // Special override for the admin user
    if (user.email === 'matheus@3ainvestimentos.com.br') {
        const employeeData = employees.find(e => e.email === user.email) || {};
        return {
            ...employeeData,
            name: user.displayName || 'Admin',
            email: user.email,
            isAdmin: true,
            isDirector: true,
            role: 'Líder',
        } as Employee;
    }

    const employeeData = employees.find(e => e.email === user.email);

    if (!employeeData) return null;

    // Enhance permissions for other admins
    if (employeeData.isAdmin) {
      return {
        ...employeeData,
        role: 'Líder',
        isDirector: true,
      };
    }
    
    return employeeData;
  }, [user, employees]);


  const managedEmployees = useMemo(() => {
    if (!currentUserEmployee || !employees) return [];
    if (currentUserEmployee.isAdmin || currentUserEmployee.isDirector) {
        return employees;
    }
    if (currentUserEmployee.role === 'Líder') {
        return employees.filter(e => e.leaderId === currentUserEmployee.id);
    }
    return [];
  }, [currentUserEmployee, employees]);


  const sortedEmployees = useMemo(() => {
    if (!managedEmployees) return [];
    return [...managedEmployees].sort((a, b) => a.name.localeCompare(b.name));
  }, [managedEmployees]);

  const selectedEmployee = useMemo(() => {
    return employees?.find((employee) => employee.id === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);


  const handleMemberChange = (id: string) => {
    setSelectedEmployeeId(id);
  };
  
  const resetForms = () => {
    setSimpleNotes("");
    setOneOnOneNotes(initialOneOnOneNotes);
    setN3Notes(initialN3Notes);
    setInteractionType('1:1');
  }

  const handleSaveInteraction = async () => {
    if (!interactionsCollection || !user ) {
        toast({
            variant: "destructive",
            title: "Erro de Validação",
            description: "Não foi possível salvar, tente novamente.",
        });
        return;
    }

    let notesToSave: string | OneOnOneNotes | N3IndividualNotes;
    let isNotesEmpty = true;

    if (interactionType === '1:1') {
        notesToSave = oneOnOneNotes;
        isNotesEmpty = Object.values(oneOnOneNotes).every(note => note?.trim() === '');
    } else if (interactionType === 'N3 Individual') {
        notesToSave = n3Notes;
        isNotesEmpty = Object.values(n3Notes).every(note => note?.trim() === '');
    } else {
        notesToSave = simpleNotes;
        isNotesEmpty = simpleNotes.trim() === '';
    }

    if (isNotesEmpty) {
        toast({
            variant: "destructive",
            title: "Erro de Validação",
            description: "As anotações não podem estar vazias.",
        });
        return;
    }
    
    setIsSaving(true);
    
    const interactionToSave = {
        type: interactionType,
        notes: notesToSave,
        authorId: user.uid,
        date: new Date().toISOString(),
    };

    try {
        await addDoc(interactionsCollection, interactionToSave);
        toast({
            title: "Interação Salva!",
            description: "O registro da sua interação foi salvo com sucesso.",
        });
        setOpenInteractionDialog(false);
        resetForms();
    } catch (error) {
        console.error("Error saving interaction: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar a interação. Verifique as permissões e tente novamente.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleSaveRiskAssessment = async (score: number, details: string) => {
    if (!interactionsCollection || !user || !selectedEmployee) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível salvar a avaliação de risco.",
        });
        return;
    }
    setIsSaving(true);

    const interactionToSave = {
        type: 'Índice de Risco',
        notes: details,
        riskScore: score,
        authorId: user.uid,
        date: new Date().toISOString(),
    };

    const employeeDocRef = doc(firestore, "employees", selectedEmployee.id);

    try {
        // Save interaction
        await addDoc(interactionsCollection, interactionToSave);
        // Update employee's risk score
        await setDoc(employeeDocRef, { riskScore: score }, { merge: true });

        toast({
            title: "Avaliação de Risco Salva!",
            description: `O índice de risco de ${selectedEmployee.name} foi atualizado.`,
        });
        setOpenRiskDialog(false);
    } catch (error) {
        console.error("Error saving risk assessment: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar a avaliação de risco. Verifique as permissões.",
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpenInteractionDialog(isOpen);
    if (!isOpen) {
      resetForms();
    }
  }

  const handleInteractionTypeChange = (value: string) => {
    const type = value as Interaction["type"];
    
    if (type === 'Índice de Risco') {
        setOpenInteractionDialog(false); // Fecha o modal atual
        setOpenRiskDialog(true); // Abre o modal de risco
        resetForms();
    } else {
        setInteractionType(type);
    }
  };
  
  const handleOneOnOneNotesChange = (field: keyof OneOnOneNotes, value: string) => {
    setOneOnOneNotes(prev => ({...prev, [field]: value}));
  }

  const handleN3NotesChange = (field: keyof N3IndividualNotes, value: string) => {
    setN3Notes(prev => ({...prev, [field]: value}));
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seleção de Colaborador</CardTitle>
          <CardDescription>
            Escolha um membro da equipe para visualizar ou registrar interações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            onValueChange={handleMemberChange}
            value={selectedEmployeeId ?? ""}
            disabled={areEmployeesLoading}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder={areEmployeesLoading ? "Carregando..." : "Selecione um colaborador"} />
            </SelectTrigger>
            <SelectContent>
              {sortedEmployees.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} {member.area && `(${member.area})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEmployeeId && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Linha do Tempo de Interação</CardTitle>
              {selectedEmployee &&
                <CardDescription>
                    Histórico de interações com {selectedEmployee.name}.
                </CardDescription>
              }
            </div>
            <Dialog open={openInteractionDialog} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nova Interação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Interação</DialogTitle>
                  {selectedEmployee && 
                    <DialogDescription>
                        Preencha os detalhes da interação com {selectedEmployee.name}.
                    </DialogDescription>
                  }
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-6">
                  <div className="space-y-2">
                    <Label htmlFor="interaction-type">Tipo de Interação</Label>
                    <Select 
                        value={interactionType} 
                        onValueChange={handleInteractionTypeChange}
                    >
                      <SelectTrigger id="interaction-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">1:1</SelectItem>
                        <SelectItem value="Feedback">Feedback</SelectItem>
                        <SelectItem value="N3 Individual">
                          N3 Individual
                        </SelectItem>
                        <SelectItem value="Índice de Risco">Índice de Risco</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {interactionType === '1:1' ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company-growth">Como você acredita que a empresa poderia contribuir para crescimento do liderado?</Label>
                            <Textarea id="company-growth" value={oneOnOneNotes.companyGrowth} onChange={e => handleOneOnOneNotesChange('companyGrowth', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="leader-growth">Como você acredita que o líder poderia contribuir para crescimento do liderado?</Label>
                            <Textarea id="leader-growth" value={oneOnOneNotes.leaderGrowth} onChange={e => handleOneOnOneNotesChange('leaderGrowth', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="team-growth">Como você acredita que o nosso time poderia contribuir para o seu crescimento?</Label>
                            <Textarea id="team-growth" value={oneOnOneNotes.teamGrowth} onChange={e => handleOneOnOneNotesChange('teamGrowth', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="personal-life">Como está a vida pessoal do liderado?</Label>
                            <Textarea id="personal-life" value={oneOnOneNotes.personalLife} onChange={e => handleOneOnOneNotesChange('personalLife', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="observations">Observações</Label>
                            <Textarea id="observations" value={oneOnOneNotes.observations} onChange={e => handleOneOnOneNotesChange('observations', e.target.value)} />
                        </div>
                    </div>
                  ) : interactionType === 'N3 Individual' ? (
                    <div className="space-y-4">
                        <div>
                            <Label className="text-base font-semibold">Indicadores Principais</Label>
                            <div className="grid grid-cols-3 gap-4 mt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="captacao">Captação</Label>
                                    <Input id="captacao" value={n3Notes.captacao} onChange={e => handleN3NotesChange('captacao', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="churnPF">Churn PF</Label>
                                    <Input id="churnPF" value={n3Notes.churnPF} onChange={e => handleN3NotesChange('churnPF', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="roa">ROA</Label>
                                    <Input id="roa" value={n3Notes.roa} onChange={e => handleN3NotesChange('roa', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="esforcos" className="text-base font-semibold">Indicadores de Esforços</Label>
                            <Textarea id="esforcos" value={n3Notes.esforcos} onChange={e => handleN3NotesChange('esforcos', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="planoAcao" className="text-base font-semibold">Plano de Ação</Label>
                            <Textarea id="planoAcao" value={n3Notes.planoAcao} onChange={e => handleN3NotesChange('planoAcao', e.target.value)} />
                        </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                        <Label htmlFor="notes">Anotações</Label>
                        <Textarea
                        id="notes"
                        placeholder="Detalhes da conversa, pontos de ação, etc."
                        className="min-h-[120px]"
                        value={simpleNotes}
                        onChange={(e) => setSimpleNotes(e.target.value)}
                        />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>Cancelar</Button>
                  <Button type="submit" onClick={handleSaveInteraction} disabled={isSaving}>
                    {isSaving ? "Salvando..." : 'Salvar Interação'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Timeline interactions={interactions ?? []} isLoading={areInteractionsLoading} />
          </CardContent>
        </Card>
      )}

      {selectedEmployee && (
        <RiskAssessmentFormDialog
            open={openRiskDialog}
            onOpenChange={setOpenRiskDialog}
            employee={selectedEmployee}
            onSave={handleSaveRiskAssessment}
            isSaving={isSaving}
        />
      )}
    </div>
  );
}

    
