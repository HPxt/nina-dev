
"use client";

import { useState, useMemo, useEffect } from "react";
import type { Employee, Interaction, InteractionStatus } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { parseISO, isSameMonth, getMonth, isSameYear } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Crown, Medal, Trophy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeaderRanking extends Employee {
  adherenceScore: number;
  completedCount: number;
  totalCount: number;
}

export default function RankingPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [axisFilter, setAxisFilter] = useState("all");

  const employeesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, "employees") : null),
    [firestore]
  );
  const { data: employees, isLoading: areEmployeesLoading } = useCollection<Employee>(employeesCollection);

  const [interactions, setInteractions] = useState<Map<string, Interaction[]>>(new Map());
  const [loadingInteractions, setLoadingInteractions] = useState(true);

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!firestore || !employees) return;

      setLoadingInteractions(true);
      const allManagedEmployeeIds = employees
        .filter(e => e.isUnderManagement)
        .map(e => e.id);

      const interactionsMap = new Map<string, Interaction[]>();
      for (const id of allManagedEmployeeIds) {
        const interactionsQuery = query(collection(firestore, "employees", id, "interactions"));
        const snapshot = await getDocs(interactionsQuery);
        const employeeInteractions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Interaction);
        interactionsMap.set(id, employeeInteractions);
      }
      
      setInteractions(interactionsMap);
      setLoadingInteractions(false);
    };

    fetchInteractions();
  }, [employees, firestore]);
  
  const { leaderRankings, uniqueAxes } = useMemo(() => {
    if (!employees || interactions.size === 0) return { leaderRankings: [], uniqueAxes: [] };

    const leaders = employees.filter(e => e.role === 'Líder');
    const axes = [...new Set(leaders.map(l => l.axis).filter(Boolean))].sort();
    const now = new Date();

    const getInteractionStatus = (employee: Employee): InteractionStatus => {
        const employeeInteractions = interactions.get(employee.id) || [];
        const oneOnOnes = employeeInteractions
          .filter(int => int.type === "1:1")
          .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
        
        const lastOneOnOne = oneOnOnes.length > 0 ? oneOnOnes[0] : undefined;
        
        const hadOneOnOneThisMonth = lastOneOnOne && isSameMonth(parseISO(lastOneOnOne.date), now);

        if (hadOneOnOneThisMonth) {
            return "Executada";
        }
        
        const currentDay = now.getDate();
        const previousMonth = getMonth(now) === 0 ? 11 : getMonth(now) - 1;
        const yearOfPreviousMonth = previousMonth === 11 ? now.getFullYear() - 1 : now.getFullYear();

        const hadOneOnOneLastMonth = oneOnOnes.some(int => 
            getMonth(parseISO(int.date)) === previousMonth && 
            isSameYear(parseISO(int.date), yearOfPreviousMonth)
        );
        
        if (!hadOneOnOneLastMonth && getMonth(now) !== 0) {
             return "Pendente";
        } else if (currentDay <= 10) {
            return "Pendente"; 
        } else {
            return "Atrasado";
        }
    };

    const rankings = leaders.map(leader => {
      const teamMembers = employees.filter(e => e.leaderId === leader.id && e.isUnderManagement);
      const totalCount = teamMembers.length;
      
      if (totalCount === 0) {
        return {
          ...leader,
          adherenceScore: 0,
          completedCount: 0,
          totalCount: 0,
        };
      }

      const completedCount = teamMembers.filter(member => getInteractionStatus(member) === 'Executada').length;
      const adherenceScore = (completedCount / totalCount) * 100;
      
      return {
        ...leader,
        adherenceScore,
        completedCount,
        totalCount,
      };
    }).sort((a, b) => b.adherenceScore - a.adherenceScore);

    return { leaderRankings: rankings, uniqueAxes: axes };

  }, [employees, interactions]);
  
  const filteredLeaderRankings = useMemo(() => {
    if (axisFilter === "all") {
        return leaderRankings;
    }
    return leaderRankings.filter(leader => leader.axis === axisFilter);
  }, [leaderRankings, axisFilter]);


  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0]?.substring(0, 2) || '';
  };
  
  const isLoading = areEmployeesLoading || loadingInteractions;

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-slate-400" />;
    if (index === 2) return <Trophy className="h-6 w-6 text-amber-700" />;
    return <span className="text-lg font-bold w-6 text-center">{index + 1}</span>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Ranking de Aderência de Líderes</CardTitle>
            <CardDescription>
              Percentual de interações 1:1 mensais realizadas por cada líder com sua equipe.
            </CardDescription>
          </div>
          <div className="w-[200px]">
             <Select onValueChange={setAxisFilter} value={axisFilter} disabled={isLoading || uniqueAxes.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Eixo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Eixos</SelectItem>
                {uniqueAxes.map((axis) => (
                  <SelectItem key={axis} value={axis}>
                    {axis}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-4 w-1/4" />
                           <Skeleton className="h-6 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <ul className="space-y-6">
                {filteredLeaderRankings.map((leader, index) => (
                    <li key={leader.id} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 text-center">
                            {getRankIcon(index)}
                        </div>
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={leader.photoURL} alt={leader.name} />
                            <AvatarFallback>{getInitials(leader.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-medium">{leader.name}</span>
                                <span className="text-sm font-semibold text-foreground">
                                    {leader.adherenceScore.toFixed(0)}%
                                </span>
                            </div>
                            <Progress value={leader.adherenceScore} className="h-3"/>
                            <div className="text-right text-xs text-muted-foreground mt-1">
                                {leader.completedCount} de {leader.totalCount} interações
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        )}
        {(!isLoading && filteredLeaderRankings.length === 0) && (
            <div className="text-center py-10 text-muted-foreground">
                <p>Nenhum líder encontrado para o eixo selecionado.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

