"use client";

import { useState } from "react";
import { teamMembers } from "@/lib/data";
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
import { formatDate } from "@/lib/utils";

export default function PdiPage() {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    teamMembers.length > 0 ? teamMembers[0].id : null
  );

  const selectedMember = teamMembers.find(
    (member) => member.id === selectedMemberId
  );

  const handleMemberChange = (id: string) => {
    setSelectedMemberId(id);
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
  }

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
          <Select
            onValueChange={handleMemberChange}
            defaultValue={selectedMemberId ?? ""}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Selecione um colaborador" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedMember && (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Diagnóstico Profissional</CardTitle>
                    <CardDescription>Status do último diagnóstico do colaborador.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Status do Diagnóstico</span>
                        <Badge variant={getStatusBadge(selectedMember.diagnosis.status)}>{selectedMember.diagnosis.status}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Data da Última Atualização</span>
                        <span className="text-sm font-medium">{formatDate(selectedMember.diagnosis.date)}</span>
                    </div>
                     <Separator />
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Detalhes</h4>
                        <p className="text-sm text-foreground/90">{selectedMember.diagnosis.details}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Plano de Desenvolvimento Individual (PDI)</CardTitle>
                    <CardDescription>Ações para o crescimento profissional de {selectedMember.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PdiTable pdiActions={selectedMember.pdi} />
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}
