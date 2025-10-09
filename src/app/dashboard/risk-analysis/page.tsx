
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
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ReferenceLine, Legend, ReferenceArea } from "recharts";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskAnalysisSelectionDialog } from "@/components/risk-analysis-selection-dialog";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

export default function RiskAnalysisPage() {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);

  const firestore = useFirestore();
  const { user } = useUser();

  const employeesCollection = useMemoFirebase(
    () => (firestore && user ? collection(firestore, "employees") : null),
    [firestore, user]
  );
  const { data: employees, isLoading: areEmployeesLoading } = useCollection<Employee>(employeesCollection);

  const currentUserEmployee = useMemo(() => {
    if (!user || !employees) return null;
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
    return selectedEmployees.map(emp => {
      const risk = emp.riskScore ?? 0;
      let fillColor;
      if (risk > 0) {
        fillColor = "hsl(var(--destructive))";
      } else if (risk < 0) {
        fillColor = "hsl(var(--chart-1))";
      } else {
        fillColor = "hsl(var(--muted-foreground))";
      }
      return {
        name: emp.name.split(' ')[0],
        risk: risk,
        fill: fillColor,
      }
    }).sort((a,b) => b.risk - a.risk);
  }, [selectedEmployees]);

  const barChartConfig = {
    risk: {
      label: "Índice de Risco",
    },
  } satisfies ChartConfig


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
  
  const isLoading = areEmployeesLoading || loadingInteractions;

  return (
    <div className="flex flex-col h-full space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Seleção de Colaboradores</CardTitle>
                <CardDescription>Escolha um ou mais colaboradores para analisar os dados de risco.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button 
                  variant="outline" 
                  onClick={() => setIsSelectionDialogOpen(true)}
                  className="w-full md:w-[400px]"
                >
                  <Users className="mr-2 h-4 w-4" />
                  {selectedEmployeeIds.length > 0 
                    ? `${selectedEmployeeIds.length} colaborador(es) selecionado(s)`
                    : "Selecionar Colaboradores"
                  }
                </Button>
            </CardContent>
        </Card>

        <div className="grid gap-6 flex-1 lg:grid-cols-5">
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader>
              <CardTitle>Distribuição de Risco Atual</CardTitle>
              <CardDescription>
                Índice de risco atual por membro.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              {isLoading ? ( <Skeleton className="h-full w-full" /> ) : selectedEmployees.length > 0 ? (
                  <ChartContainer config={barChartConfig} className="w-full h-full min-h-[250px]">
                    <BarChart
                        accessibilityLayer
                        data={barChartData}
                        layout="vertical"
                        margin={{ left: 10, right: 30 }}
                    >
                      <CartesianGrid horizontal={false} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tick={{ fill: "hsl(var(--foreground))" }}
                      />
                       <XAxis dataKey="risk" type="number" domain={[-10, 10]} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <ReferenceArea x1={0} x2={10} y1={undefined} y2={undefined} fill="hsl(var(--destructive) / 0.1)" strokeOpacity={0.5}>
                         <Legend content={() => <text x={"100%"} y={15} dominantBaseline="middle" textAnchor="end" fill="hsl(var(--destructive))" fontSize="10">Risco Potencial</text>} />
                      </ReferenceArea>
                       <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                       <ReferenceLine 
                          x={5} 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeDasharray="3 3" 
                          label={{ 
                            value: "Risco Alto", 
                            position: "insideTop", 
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 10,
                            dy: -5,
                          }}
                        />
                      <Bar dataKey="risk" name="Índice de Risco" radius={4} />
                    </BarChart>
                  </ChartContainer>
              ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      Selecione um colaborador.
                  </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3 flex flex-col">
            <CardHeader>
              <CardTitle>Série Histórica do Índice de Risco</CardTitle>
              <CardDescription>
                Evolução das pontuações de risco.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              {isLoading ? ( <Skeleton className="h-full w-full" /> ) : selectedEmployees.length > 0 ? (
                  <ChartContainer config={lineChartConfig} className="w-full h-full min-h-[250px]">
                    <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tickMargin={10} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        {selectedEmployeeIds.map((id, index) => (
                            <Line 
                                key={id} 
                                type="monotone" 
                                dataKey={id} 
                                stroke={lineChartConfig[id]?.color || chartColors[index % chartColors.length]} 
                                name={employees?.find(e => e.id === id)?.name}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                  </ChartContainer>
              ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      Selecione um colaborador para ver o histórico.
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
        <RiskAnalysisSelectionDialog 
            open={isSelectionDialogOpen}
            onOpenChange={setIsSelectionDialogOpen}
            allEmployees={managedEmployees}
            selectedIds={selectedEmployeeIds}
            onSelectionChange={setSelectedEmployeeIds}
            isLoading={areEmployeesLoading}
        />
    </div>
  );
}
