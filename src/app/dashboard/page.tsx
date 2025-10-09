
"use client";

import { useState, useMemo, useEffect } from "react";
import type { Employee, Interaction, InteractionStatus, InteractionType } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker } from "@/components/ui/date-range-picker";


interface TrackedEmployee extends Employee {
  lastInteraction?: string;
  interactionStatus: InteractionStatus;
}

const interactionTypes: { value: InteractionType, label: string }[] = [
    { value: "1:1", label: "1:1" },
    { value: "Feedback", label: "Feedback" },
    { value: "N3 Individual", label: "N3 Individual" },
    { value: "Índice de Risco", label: "Índice de Risco" },
];


export default function LeadershipDashboard() {
  const firestore = useFirestore();
  const { user } = useUser();

  const employeesCollection = useMemoFirebase(
    () => (firestore && user ? collection(firestore, "employees") : null),
    [firestore, user]
  );
  const { data: employees, isLoading: areEmployeesLoading } = useCollection<Employee>(employeesCollection);

  const [interactions, setInteractions] = useState<Map<string, Interaction[]>>(new Map());
  const [loadingInteractions, setLoadingInteractions] = useState(true);

  const [leaderFilter, setLeaderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | InteractionStatus>("all");
  const [interactionTypeFilter, setInteractionTypeFilter] = useState<InteractionType>("1:1");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });


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

  useEffect(() => {
    if (currentUserEmployee?.role === 'Líder' && !currentUserEmployee.isDirector) {
      setLeaderFilter(currentUserEmployee.id);
    }
  }, [currentUserEmployee]);


  useEffect(() => {
    const fetchInteractions = async () => {
      if (!firestore || !employees || !currentUserEmployee) return;

      setLoadingInteractions(true);
      const managedEmployeeIds = employees
        .filter(e => e.isUnderManagement && (currentUserEmployee.isAdmin || currentUserEmployee.isDirector || e.leaderId === currentUserEmployee.id))
        .map(e => e.id);

      const interactionsMap = new Map<string, Interaction[]>();
      for (const id of managedEmployeeIds) {
        const interactionsQuery = query(collection(firestore, "employees", id, "interactions"));
        const snapshot = await getDocs(interactionsQuery);
        const employeeInteractions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Interaction);
        interactionsMap.set(id, employeeInteractions);
      }
      
      setInteractions(interactionsMap);
      setLoadingInteractions(false);
    };

    fetchInteractions();
  }, [employees, firestore, currentUserEmployee]);
  
  const trackedEmployees = useMemo((): TrackedEmployee[] => {
    if (!employees || !currentUserEmployee) return [];

    return employees
      .filter(e => {
         if (!e.isUnderManagement) return false;
         if (currentUserEmployee.isAdmin || currentUserEmployee.isDirector) return true;
         if (currentUserEmployee.role === 'Líder') return e.leaderId === currentUserEmployee.id;
         return false;
      })
      .map(employee => {
        const employeeInteractions = interactions.get(employee.id) || [];
        
        const interactionsInPeriod = employeeInteractions
          .filter(int => {
              const interactionDate = new Date(int.date);
              const isInRange = dateRange?.from && dateRange?.to && isWithinInterval(interactionDate, { start: dateRange.from, end: dateRange.to });
              return int.type === interactionTypeFilter && isInRange;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const lastInteractionInPeriod = interactionsInPeriod.length > 0 ? interactionsInPeriod[0] : undefined;
        
        let status: InteractionStatus;
        if (lastInteractionInPeriod) {
            status = "Executada";
        } else {
            // Se não houve interação no período, verificamos se o período já passou
            if (dateRange?.to && new Date() > dateRange.to) {
                status = "Atrasado";
            } else {
                status = "Pendente";
            }
        }
        
        // Pega a última interação geral para exibir a data, independente do período
        const allTypedInteractions = employeeInteractions
            .filter(int => int.type === interactionTypeFilter)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const lastOverallInteraction = allTypedInteractions.length > 0 ? allTypedInteractions[0] : undefined;
        
        return {
          ...employee,
          lastInteraction: lastOverallInteraction?.date,
          interactionStatus: status,
        };
      });
  }, [employees, interactions, currentUserEmployee, interactionTypeFilter, dateRange]);


  const filteredEmployees = useMemo(() => {
    return trackedEmployees.filter(member => {
        const leaderMatch = leaderFilter === 'all' || member.leaderId === leaderFilter;
        const statusMatch = statusFilter === 'all' || member.interactionStatus === statusFilter;
        return leaderMatch && statusMatch;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [trackedEmployees, leaderFilter, statusFilter]);

  const leadersWithTeams = useMemo(() => {
    if (!employees) return [];
    
    return employees
      .filter(e => e.role === 'Líder')
      .sort((a, b) => a!.name.localeCompare(b!.name));
      
  }, [employees]);


  const getBadgeVariant = (status: InteractionStatus) => {
    switch (status) {
      case "Executada":
        return "default";
      case "Atrasado":
        return "destructive";
      case "Pendente":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0]?.substring(0, 2) || '';
  };
  
  const formatDate = (dateString?: string) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  const isLoading = areEmployeesLoading || loadingInteractions;
  const isLeaderOnly = currentUserEmployee?.role === 'Líder' && !currentUserEmployee.isDirector && !currentUserEmployee.isAdmin;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre as interações por equipe, tipo, status e período.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Select onValueChange={setLeaderFilter} value={leaderFilter} disabled={isLoading || isLeaderOnly}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as Equipes" />
              </SelectTrigger>
              <SelectContent>
                {!isLeaderOnly && <SelectItem value="all">Todas as Equipes</SelectItem>}
                {leadersWithTeams.map((leader) => (
                  <SelectItem key={leader.id} value={leader.id}>
                    {leader.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={value => setInteractionTypeFilter(value as any)} value={interactionTypeFilter} disabled={isLoading}>
                <SelectTrigger>
                    <SelectValue placeholder="Tipo de Interação" />
                </SelectTrigger>
                <SelectContent>
                    {interactionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select onValueChange={value => setStatusFilter(value as any)} value={statusFilter} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Executada">Executada</SelectItem>
                <SelectItem value="Atrasado">Atrasado</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequência de Interações</CardTitle>
          <CardDescription>
            Acompanhe a frequência das interações com sua equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead className="hidden md:table-cell">Líder</TableHead>
                <TableHead className="hidden sm:table-cell">Última Interação</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    </TableRow>
                ))
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.photoURL} alt={member.name} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                          <span className="font-medium">{member.name}</span>
                          <span className="text-xs text-muted-foreground hidden lg:inline">
                            {member.position}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{member.leader}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatDate(member.lastInteraction)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(member.interactionStatus)}>
                        {member.interactionStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    Nenhum colaborador gerenciado encontrado ou correspondente aos filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    