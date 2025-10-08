
"use client";

import { useState, useMemo, useEffect } from "react";
import type { Employee, Interaction } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { differenceInDays, parseISO } from "date-fns";

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

type OneOnOneStatus = "Em dia" | "Atenção" | "Atrasado";

interface TrackedEmployee extends Employee {
  lastOneOnOne?: string;
  oneOnOneStatus: OneOnOneStatus;
}

export default function LeadershipDashboard() {
  const firestore = useFirestore();
  const { user } = useUser();

  const employeesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, "employees") : null),
    [firestore]
  );
  const { data: employees, isLoading: areEmployeesLoading } = useCollection<Employee>(employeesCollection);

  const [interactions, setInteractions] = useState<Map<string, Interaction[]>>(new Map());
  const [loadingInteractions, setLoadingInteractions] = useState(true);

  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | OneOnOneStatus>("all");
  const [periodFilter, setPeriodFilter] = useState("all"); // Not implemented yet, but state is ready

  const currentUserEmployee = useMemo(() => {
    if (!user || !employees) return null;
    return employees.find(e => e.email === user.email);
  }, [user, employees]);

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!firestore || !employees || !currentUserEmployee) return;

      setLoadingInteractions(true);
      const managedEmployeeIds = employees
        .filter(e => e.isUnderManagement && (currentUserEmployee.role === 'Admin' || currentUserEmployee.role === 'Diretor' || e.leaderId === currentUserEmployee.id))
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
         if (currentUserEmployee.role === 'Admin' || currentUserEmployee.role === 'Diretor') return true;
         if (currentUserEmployee.role === 'Líder') return e.leaderId === currentUserEmployee.id;
         return false;
      })
      .map(employee => {
        const employeeInteractions = interactions.get(employee.id) || [];
        const oneOnOnes = employeeInteractions
          .filter(int => int.type === "1:1")
          .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
        
        const lastOneOnOne = oneOnOnes.length > 0 ? oneOnOnes[0] : undefined;
        
        let status: OneOnOneStatus;
        if (!lastOneOnOne) {
            status = "Atrasado";
        } else {
            const daysSinceLast = differenceInDays(new Date(), parseISO(lastOneOnOne.date));
            if (daysSinceLast <= 15) {
                status = "Em dia";
            } else if (daysSinceLast <= 30) {
                status = "Atenção";
            } else {
                status = "Atrasado";
            }
        }
        
        return {
          ...employee,
          lastOneOnOne: lastOneOnOne?.date,
          oneOnOneStatus: status,
        };
      });
  }, [employees, interactions, currentUserEmployee]);


  const filteredEmployees = useMemo(() => {
    return trackedEmployees.filter(member => {
        const teamMatch = teamFilter === 'all' || member.team === teamFilter;
        const statusMatch = statusFilter === 'all' || member.oneOnOneStatus === statusFilter;
        // Period filter logic would go here
        return teamMatch && statusMatch;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [trackedEmployees, teamFilter, statusFilter]);

  const teams = useMemo(() => {
    if (!employees) return [];
    return [...new Set(employees.map((m) => m.team).filter(Boolean))] as string[];
  }, [employees]);


  const getBadgeVariant = (status: OneOnOneStatus) => {
    switch (status) {
      case "Em dia":
        return "default";
      case "Atenção":
        return "secondary";
      case "Atrasado":
        return "destructive";
    }
  };

  const getInitials = (name: string) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre as reuniões 1:1 por equipe, status e período.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select onValueChange={setTeamFilter} value={teamFilter} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as Equipes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Equipes</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={value => setStatusFilter(value as any)} value={statusFilter} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Em dia">Em dia</SelectItem>
                <SelectItem value="Atenção">Atenção</SelectItem>
                <SelectItem value="Atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setPeriodFilter} value={periodFilter} disabled={true}>
              <SelectTrigger>
                <SelectValue placeholder="Todo o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                {/* 
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="60">Últimos 60 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem> 
                */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequência de 1:1s</CardTitle>
          <CardDescription>
            Acompanhe a frequência das reuniões individuais com sua equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead className="hidden md:table-cell">Equipe</TableHead>
                <TableHead className="hidden sm:table-cell">Última 1:1</TableHead>
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
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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
                    <TableCell className="hidden md:table-cell">{member.team}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatDate(member.lastOneOnOne)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(member.oneOnOneStatus)}>
                        {member.oneOnOneStatus}
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
