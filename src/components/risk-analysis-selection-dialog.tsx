
"use client";

import { useState, useMemo, useEffect } from "react";
import type { Employee } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";

interface RiskAnalysisSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allEmployees: Employee[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading: boolean;
}

export function RiskAnalysisSelectionDialog({
  open,
  onOpenChange,
  allEmployees,
  selectedIds,
  onSelectionChange,
  isLoading,
}: RiskAnalysisSelectionDialogProps) {
  const [localSelectedIds, setLocalSelectedIds] = useState(selectedIds);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setLocalSelectedIds(selectedIds);
  }, [selectedIds, open]);

  const filteredEmployees = useMemo(() => {
    if (!allEmployees) return [];
    return allEmployees.filter(employee =>
      employee.name.toLowerCase().includes(filter.toLowerCase()) ||
      employee.area?.toLowerCase().includes(filter.toLowerCase()) ||
      employee.position?.toLowerCase().includes(filter.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [allEmployees, filter]);

  const handleSelect = (id: string) => {
    setLocalSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (localSelectedIds.length === filteredEmployees.length) {
      setLocalSelectedIds([]);
    } else {
      setLocalSelectedIds(filteredEmployees.map(e => e.id));
    }
  };

  const handleConfirm = () => {
    onSelectionChange(localSelectedIds);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar Colaboradores para Análise</DialogTitle>
          <DialogDescription>
            Use os filtros para encontrar e selecionar os colaboradores que deseja comparar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-none">
            <Input 
                placeholder="Filtrar por nome, área ou cargo..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
            />
        </div>
        <div className="flex-1 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-secondary">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={filteredEmployees.length > 0 && localSelectedIds.length === filteredEmployees.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Líder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredEmployees.map(employee => (
                  <TableRow key={employee.id} data-state={localSelectedIds.includes(employee.id) && "selected"}>
                    <TableCell>
                      <Checkbox
                        checked={localSelectedIds.includes(employee.id)}
                        onCheckedChange={() => handleSelect(employee.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.area || "N/A"}</TableCell>
                    <TableCell>{employee.position || "N/A"}</TableCell>
                    <TableCell>{employee.leader || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!isLoading && filteredEmployees.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    Nenhum colaborador encontrado.
                </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar ({localSelectedIds.length} selecionado(s))
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
