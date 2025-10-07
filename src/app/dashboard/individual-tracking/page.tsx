
"use client";

import { useState, useMemo }from "react";
import type { Employee, Interaction } from "@/lib/types";
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
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

type NewInteraction = Omit<Interaction, "id" | "date" | "authorId">;

export default function IndividualTrackingPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newInteraction, setNewInteraction] = useState<NewInteraction>({ type: "1:1", notes: "" });
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

  const sortedEmployees = useMemo(() => {
    if (!employees) return [];
    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  const selectedEmployee = useMemo(() => {
    return employees?.find((employee) => employee.id === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);


  const handleMemberChange = (id: string) => {
    setSelectedEmployeeId(id);
  };
  
  const resetForm = () => {
    setNewInteraction({ type: "1:1", notes: "" });
  }

  const handleSaveInteraction = async () => {
    if (!interactionsCollection || !user || !newInteraction.notes.trim()) {
        toast({
            variant: "destructive",
            title: "Erro de Validação",
            description: "As anotações não podem estar vazias.",
        });
        return;
    }
    setIsSaving(true);
    
    const interactionToSave = {
        ...newInteraction,
        authorId: user.uid,
        date: new Date().toISOString(),
    };

    try {
        await addDocumentNonBlocking(interactionsCollection, interactionToSave);
        toast({
            title: "Interação Salva!",
            description: "O registro da sua interação foi salvo com sucesso.",
        });
        setOpenDialog(false);
        resetForm();
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
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpenDialog(isOpen);
    if (!isOpen) {
      resetForm();
    }
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
                  {member.name}
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
            <Dialog open={openDialog} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nova Interação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Interação</DialogTitle>
                  {selectedEmployee && 
                    <DialogDescription>
                        Preencha os detalhes da interação com {selectedEmployee.name}.
                    </DialogDescription>
                  }
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="interaction-type">Tipo de Interação</Label>
                    <Select 
                        value={newInteraction.type} 
                        onValueChange={(value) => setNewInteraction(prev => ({...prev, type: value as Interaction["type"]}))}
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
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Anotações</Label>
                    <Textarea
                      id="notes"
                      placeholder="Detalhes da conversa, pontos de ação, etc."
                      className="min-h-[120px]"
                      value={newInteraction.notes}
                      onChange={(e) => setNewInteraction(prev => ({...prev, notes: e.target.value}))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>Cancelar</Button>
                  <Button type="submit" onClick={handleSaveInteraction} disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar Interação"}
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
    </div>
  );
}
