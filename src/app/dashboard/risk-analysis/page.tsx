
"use client";

import React, { useState, useMemo } from "react";
import type { Employee, Interaction } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ReferenceLine, Legend } from "recharts";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function RiskAnalysisPage() {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const firestore = useFirestore();

  const employeesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, "employees") : null),
    [firestore]
  );
  const { data: employees, isLoading: areEmployeesLoading } = useCollection<Employee>(employeesCollection);

  const sortedEmployees = useMemo(() => {
    if (!employees) return [];
    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  const selectedEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter(e => selectedEmployeeIds.includes(e.id));
  }, [employees, selectedEmployeeIds]);

  const [interactions, setInteractions] = useState<{ [key: string]: Interaction[] }>({});
  const [loadingInteractions, setLoadingInteractions] = useState(false);

  React.useEffect(() => {
    const fetchInteractions = async () => {
      if (!firestore || selectedEmployeeIds.length === 0) {
        setInteractions({});
        return;
      }
      setLoadingInteractions(true);
      const newInteractions: { [key: string]: Interaction[] } = {};
      
      const { getDocs } = await import("firebase/firestore");

      for (const id of selectedEmployeeIds) {
        const interactionsCollection = collection(firestore, "employees", id, "interactions");
        const snapshot = await getDocs(interactionsCollection);
        newInteractions[id] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Interaction));
      }
      setInteractions(newInteractions);
      setLoadingInteractions(false);
    };
    fetchInteractions();
  }, [selectedEmployeeIds, firestore]);
  

  const barChartData = useMemo(() => {
    return selectedEmployees.map(emp => ({
      name: emp.name.split(' ')[0],
      risk: emp.riskScore ?? 0,
      fill: chartColors[selectedEmployees.indexOf(emp) % chartColors.length],
    }));
  }, [selectedEmployees]);

  const lineChartData = useMemo(() => {
    const dateMap = new Map<string, any>();
    
    selectedEmployeeIds.forEach(id => {
      const employeeInteractions = interactions[id] || [];
      employeeInteractions
        .filter(int => int.type === 'Índice de Risco' && typeof int.riskScore === 'number')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .forEach(int => {
          const date = new Date(int.date).toLocaleDateString('pt-BR');
          if (!dateMap.has(date)) {
            dateMap.set(date, { date });
          }
          dateMap.get(date)[id] = int.riskScore;
        });
    });

    return Array.from(dateMap.values()).sort((a,b) => {
        const dateA = a.date.split('/').reverse().join('-');
        const dateB = b.date.split('/').reverse().join('-');
        return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }, [interactions, selectedEmployeeIds]);

  const lineChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    selectedEmployees.forEach((emp, index) => {
      config[emp.id] = {
        label: emp.name,
        color: chartColors[index % chartColors.length],
      };
    });
    return config;
  }, [selectedEmployees]);


  const handleSelectEmployee = (id: string) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]
    );
  };
  
  const isLoading = areEmployeesLoading || loadingInteractions;

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Seleção de Colaboradores</CardTitle>
                <CardDescription>Escolha um ou mais colaboradores para analisar os dados de risco.</CardDescription>
            </CardHeader>
            <CardContent>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full md:w-[400px] justify-between"
                        disabled={areEmployeesLoading}
                    >
                        <span className="truncate">
                        {selectedEmployees.length > 0 ? selectedEmployees.map(e => e.name).join(', ') : areEmployeesLoading ? "Carregando..." : "Selecione colaboradores..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                    <Command>
                        <CommandInput placeholder="Buscar colaborador..." />
                        <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
                        <CommandList>
                            <CommandGroup>
                                {sortedEmployees.map(employee => (
                                <CommandItem
                                    key={employee.id}
                                    value={employee.name}
                                    onSelect={() => handleSelectEmployee(employee.id)}
                                >
                                     <div className={cn(
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        selectedEmployeeIds.includes(employee.id)
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible"
                                    )}>
                                        <Check className="h-4 w-4" />
                                    </div>
                                    {employee.name}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                    </PopoverContent>
                </Popover>
            </CardContent>
        </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribuição de Risco Atual</CardTitle>
            <CardDescription>
              Visualização do índice de risco atual por membro da equipe.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? ( <Skeleton className="h-[300px] w-full" /> ) : selectedEmployees.length > 0 ? (
                <ChartContainer config={{}} className="min-h-[300px] w-full">
                    <BarChart accessibilityLayer data={barChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <YAxis />
                    <Tooltip cursor={false} content={<ChartTooltipContent />} />
                    <Legend />
                    <ReferenceLine y={5} stroke="gray" strokeDasharray="3 3" label={{ value: 'Risco Alto', position: 'left', textAnchor: 'end', fill: 'gray' }} />
                    <ReferenceLine y={2} stroke="gray" strokeDasharray="3 3" label={{ value: 'Risco Baixo', position: 'left', textAnchor: 'end', fill: 'gray' }} />
                    <Bar dataKey="risk" name="Índice de Risco" radius={4} />
                    </BarChart>
                </ChartContainer>
            ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                    Selecione pelo menos um colaborador para ver o gráfico.
                </div>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Série Histórica do Índice de Risco</CardTitle>
            <CardDescription>
              Evolução das pontuações de risco dos colaboradores selecionados.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? ( <Skeleton className="h-[300px] w-full" /> ) : selectedEmployees.length > 0 ? (
                <ChartContainer config={lineChartConfig} className="min-h-[300px] w-full">
                <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickMargin={10} />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    {selectedEmployeeIds.map((id, index) => (
                        <Line 
                            key={id} 
                            type="monotone" 
                            dataKey={id} 
                            stroke={chartColors[index % chartColors.length]} 
                            name={employees?.find(e => e.id === id)?.name}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    ))}
                </LineChart>
                </ChartContainer>
            ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                    Selecione pelo menos um colaborador para ver o histórico.
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
