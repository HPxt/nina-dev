
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Employee } from "@/lib/types";
import { cn } from "@/lib/utils";

const riskCategories = [
  { id: "performance", label: "Performance", red: "Dificuldade em atingir as metas", neutral: "Atingiu as metas (100% do target)", green: "Superação consistente das metas" },
  { id: "quality", label: "Qualidade/Cliente", red: "Recebeu feedback negativo de clientes", neutral: "Sem feedback notável (nem positivo, nem negativo)", green: "Recebeu feedback positivo espontâneo de clientes" },
  { id: "remuneration", label: "Remuneração", red: "Remuneração abaixo da referência", neutral: "Remuneração na referência de mercado/função", green: "Remuneração acima da referência" },
  { id: "development", label: "Desenvolvimento", red: "Resistência a feedback e a novas práticas", neutral: "Aceita feedback e implementa o básico", green: "Busca proativa por feedback e implementação imediata" },
  { id: "processes", label: "Processos/Ferramentas", red: "Dificuldades com ferramentas ou processos internos", neutral: "Utiliza ferramentas e segue processos corretamente", green: "Domínio das ferramentas e processos" },
  { id: "presence", label: "Presença/Rotina", red: "Ausência do escritório (não justificada)", neutral: "Presença e disponibilidade dentro do esperado", green: "Alta disponibilidade e presença estratégica" },
  { id: "engagement", label: "Engajamento", red: "Baixo engajamento nas reuniões de equipe", neutral: "Participação básica e passiva nas reuniões", green: "Engajamento ativo e contribuições valiosas nas reuniões" },
];

type Selections = {
  [key: string]: "red" | "neutral" | "green";
};

const SCORES = { red: 1, neutral: 0, green: -1 };

interface RiskAssessmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onSave: (score: number, details: string) => Promise<void>;
  isSaving: boolean;
}

export function RiskAssessmentFormDialog({ open, onOpenChange, employee, onSave, isSaving }: RiskAssessmentFormDialogProps) {
  const [selections, setSelections] = useState<Selections>({});

  // Initialize selections with neutral
  useEffect(() => {
    if (open) {
      const initialSelections: Selections = {};
      riskCategories.forEach(category => {
        initialSelections[category.id] = "neutral";
      });
      setSelections(initialSelections);
    }
  }, [open]);

  const totalScore = useMemo(() => {
    return Object.values(selections).reduce((sum, value) => sum + SCORES[value], 0);
  }, [selections]);

  const handleSelectionChange = (categoryId: string, value: "red" | "neutral" | "green") => {
    setSelections(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleSaveClick = () => {
    let details = `Avaliação de Risco - Pontuação Total: ${totalScore}\n\n`;
    riskCategories.forEach(cat => {
        const selection = selections[cat.id];
        const selectionText = cat[selection];
        const score = SCORES[selection];
        details += `${cat.label}: ${selectionText} (Pontuação: ${score})\n`;
    });
    onSave(totalScore, details);
  };
  
  const getScoreColor = (score: number) => {
    if (score > 0) return 'text-destructive';
    if (score < 0) return 'text-green-600';
    return 'text-muted-foreground';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Avaliação de Índice de Risco</DialogTitle>
          <DialogDescription>
            Avalie cada categoria para o colaborador {employee.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-6">
          {riskCategories.map((category, index) => (
            <div key={category.id}>
              <h3 className="font-medium mb-3">{category.label}</h3>
              <RadioGroup
                value={selections[category.id] || "neutral"}
                onValueChange={(value) => handleSelectionChange(category.id, value as "red" | "neutral" | "green")}
                className="grid grid-cols-3 gap-4"
              >
                <Label className={cn("flex flex-col items-start justify-start rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", selections[category.id] === 'red' && "border-destructive")}>
                  <RadioGroupItem value="red" id={`${category.id}-red`} className="sr-only" />
                  <span className="font-semibold text-destructive mb-2">Red Flag (+1)</span>
                  <span className="text-sm">{category.red}</span>
                </Label>
                <Label className={cn("flex flex-col items-start justify-start rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", selections[category.id] === 'neutral' && "border-primary")}>
                  <RadioGroupItem value="neutral" id={`${category.id}-neutral`} className="sr-only" />
                  <span className="font-semibold text-muted-foreground mb-2">Neutro (0)</span>
                  <span className="text-sm">{category.neutral}</span>
                </Label>
                <Label className={cn("flex flex-col items-start justify-start rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", selections[category.id] === 'green' && "border-green-600")}>
                  <RadioGroupItem value="green" id={`${category.id}-green`} className="sr-only" />
                  <span className="font-semibold text-green-600 mb-2">Green Flag (-1)</span>
                  <span className="text-sm">{category.green}</span>
                </Label>
              </RadioGroup>
              {index < riskCategories.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>

        <DialogFooter className="sm:justify-between items-center border-t pt-4">
            <div className="text-lg font-bold">
                Índice de Risco Total: <span className={cn("font-extrabold", getScoreColor(totalScore))}>{totalScore}</span>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
                <Button onClick={handleSaveClick} disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar Avaliação"}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
