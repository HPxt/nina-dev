
"use client";

import { useState, useMemo } from "react";
import type { Employee, Diagnosis, PDIAction } from "@/lib/types";
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
import { Separator } from "@/components/ui/separator";
import { PdiTable } from "@/components/pdi-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pen } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { DiagnosisFormDialog } from "@/components/diagnosis-form-dialog";

export default function PdiPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isDiagnosisFormOpen, setIsDiagnosisFormOpen] = useState(false);
  
  const firestore = useFirestore();

  const employeesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, "employees") : null),
    [firestore]
  );
  const { data: employees, isLoading: areEmployeesLoading } = useCollection<Employee>(employeesCollection);

  const pdiActionsCollection = useMemoFirebase(
    () => (firestore && selectedEmployeeId ? collection(firestore, "employees", selectedEmployeeId, "pdiActions") : null),
    [firestore, selectedEmployeeId]
  );
  const { data: pdiActions, isLoading: arePdiActionsLoading } = useCollection<PDIAction>(pdiActionsCollection);
  
  const sortedEmployees = useMemo(() => {
    if (!employees) return [];
    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  const selectedEmployee = useMemo(() => {
    return employees?.find((member) => member.id === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);

  const handleMemberChange = (id: string) => {
    setSelectedEmployeeId(id);
  };
  
  const getStatusBadge = (status: "Concluído" | "Em Andamento" | "Pendente") => {
    switch (status) {
        case "Concluído":
            return "default";
        case "Em Andamento":
            return "secondary";
        case "Pendente":
            return "outline";
    }
  };

  const diagnosis = selectedEmployee?.diagnosis;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seleção de Colaborador</CardTitle>
          <CardDescription>
            Escolha um membro da equipe para visualizar ou gerenciar o PDI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {areEmployeesLoading ? (
            <Skeleton className="h-10 w-full md:w-[300px]" />
          ) : (
            <Select
              onValueChange={handleMemberChange}
              value={selectedEmployeeId ?? ""}
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Selecione um colaborador" />
              </SelectTrigger>
              <SelectContent>
                {sortedEmployees.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedEmployeeId && (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Diagnóstico Profissional</CardTitle>
                        <CardDescription>Status do último diagnóstico do colaborador.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsDiagnosisFormOpen(true)}>
                        <Pen className="mr-2 h-4 w-4"/>
                        {diagnosis ? 'Editar' : 'Adicionar'} Diagnóstico
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                   {areEmployeesLoading ? (
                     <div className="space-y-4">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-12 w-full" />
                     </div>
                   ) : diagnosis ? (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Status do Diagnóstico</span>
                            <Badge variant={getStatusBadge(diagnosis.status)}>{diagnosis.status}</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Data da Última Atualização</span>
                            <span className="text-sm font-medium">{formatDate(diagnosis.date)}</span>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Detalhes</h4>
                            <p className={cn("text-sm text-foreground/90", !diagnosis.details && "italic")}>
                                {diagnosis.details || "Nenhum detalhe fornecido."}
                            </p>
                        </div>
                    </>
                   ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        <p>Nenhum diagnóstico profissional registrado para este colaborador.</p>
                    </div>
                   )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Plano de Desenvolvimento Individual (PDI)</CardTitle>
                    <CardDescription>Ações para o crescimento profissional de {selectedEmployee?.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    {arePdiActionsLoading ? (
                        <div className="space-y-2">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <PdiTable pdiActions={pdiActions ?? []} employeeId={selectedEmployeeId} />
                    )}
                </CardContent>
            </Card>
        </>
      )}

      {selectedEmployee && (
        <DiagnosisFormDialog 
            open={isDiagnosisFormOpen}
            onOpenChange={setIsDiagnosisFormOpen}
            employee={selectedEmployee}
        />
      )}
    </div>
  );
}

