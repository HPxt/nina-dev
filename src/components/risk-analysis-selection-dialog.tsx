
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { X } from "lucide-react";

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
  const [nameFilter, setNameFilter] = useState("");
  const [leaderFilter, setLeaderFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    setLocalSelectedIds(selectedIds);
  }, [selectedIds, open]);
  
  const { uniqueLeaders, uniqueCities } = useMemo(() => {
    if (!allEmployees) return { uniqueLeaders: [], uniqueCities: [] };
    const leaders = [...new Set(allEmployees.map(e => e.leader).filter(Boolean))].sort();
    const cities = [...new Set(allEmployees.map(e => e.city).filter(Boolean))].sort();
    return { uniqueLeaders: leaders, uniqueCities: cities };
  }, [allEmployees]);


  const filteredEmployees = useMemo(() => {
    if (!allEmployees) return [];
    return allEmployees.filter(employee => {
        const nameMatch = !nameFilter || employee.name.toLowerCase().includes(nameFilter.toLowerCase());
        const leaderMatch = leaderFilter === 'all' || employee.leader === leaderFilter;
        const cityMatch = cityFilter === 'all' || employee.city === cityFilter;
        return nameMatch && leaderMatch && cityMatch;
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [allEmployees, nameFilter, leaderFilter, cityFilter]);

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
  
  const clearFilters = () => {
    setNameFilter("");
    setLeaderFilter("all");
    setCityFilter("all");
  };
  
  const isFilterActive = nameFilter || leaderFilter !== 'all' || cityFilter !== 'all';


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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <Input 
                    placeholder="Filtrar por nome..."
                    value={nameFilter}
                    onChange={e => setNameFilter(e.target.value)}
                    className="sm:col-span-2"
                />
                <Select value={leaderFilter} onValueChange={setLeaderFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrar por líder" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Líderes</SelectItem>
                        {uniqueLeaders.map(leader => <SelectItem key={leader} value={leader}>{leader}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrar por cidade" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Cidades</SelectItem>
                        {uniqueCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            {isFilterActive && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2 text-primary">
                <X className="mr-2 h-4 w-4" />
                Limpar filtros
              </Button>
            )}
        </div>
        <div className="flex-1 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-secondary">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={filteredEmployees.length > 0 && localSelectedIds.length === filteredEmployees.length && localSelectedIds.length > 0}
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
                    Nenhum colaborador encontrado para os filtros selecionados.
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
