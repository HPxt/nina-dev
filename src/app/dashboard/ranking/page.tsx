
"use client";

import { useState, useMemo, useEffect } from "react";
import type { Employee, Interaction } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { isSameYear, differenceInMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";

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
import { DateRangePicker } from "@/components/ui/date-range-picker";


interface LeaderRanking extends Employee {
  adherenceScore: number;
  completedCount: number;
  totalCount: number;
}

const calculateAnnualInteractions = (employee: Employee): number => {
    let total = 0;
    // PDI: semestral = 2/ano
    total += 2;
    // 1:1: trimestral = 4/ano
    total += 4;
    // Índice de Risco: mensal = 12/ano
    total += 12;
    // N3 Individual: varia com segmento
    switch (employee.segment) {
    case 'Alfa':
        total += 52; // semanal
        break;
    case 'Beta':
        total += 26; // quinzenal
        break;
    case 'Senior':
        total += 12; // mensal
        break;
    }
    return total;
};


export default function RankingPage() {
  const firestore = useFirestore();
  const [axisFilter, setAxisFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });


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
    
    // Calculate the number of months in the selected range for prorating
    const monthsInRange = dateRange?.from && dateRange?.to 
      ? differenceInMonths(dateRange.to, dateRange.from) + 1 
      : 12;
    const yearlyProportion = monthsInRange / 12;

  
    const rankings = leaders.map(leader => {
      const teamMembers = employees.filter(e => e.leaderId === leader.id && e.isUnderManagement);
      
      if (teamMembers.length === 0) {
        return {
          ...leader,
          adherenceScore: 0,
          completedCount: 0,
          totalCount: 0,
        };
      }
  
      // Calculate prorated total count based on the date range
      const totalCount = teamMembers.reduce((acc, member) => {
        const annualInteractions = calculateAnnualInteractions(member);
        return acc + (annualInteractions * yearlyProportion);
      }, 0);
      
      // Calculate completed count within the date range
      const completedCount = teamMembers.reduce((acc, member) => {
          const memberInteractions = interactions.get(member.id) || [];
          const interactionsInRange = memberInteractions.filter(interaction => {
              const interactionDate = new Date(interaction.date);
              return dateRange?.from && dateRange?.to && isWithinInterval(interactionDate, { start: dateRange.from, end: dateRange.to }) &&
                     ['1:1', 'Feedback', 'N3 Individual', 'Índice de Risco'].includes(interaction.type);
          }).length;
          
          // Prorate PDI actions as well, simplified for now
          const annualPdiActions = 2; // Semestral
          const expectedPdiInPeriod = annualPdiActions * yearlyProportion;
          const completedPdiActions = (member.diagnosis?.status === 'Concluído' ? 2 : (member.diagnosis?.status === 'Em Andamento' ? 1 : 0));
          const proratedCompletedPdi = Math.min(completedPdiActions, expectedPdiInPeriod);

          return acc + interactionsInRange + proratedCompletedPdi;
      }, 0);
  
      const adherenceScore = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      
      return {
        ...leader,
        adherenceScore,
        completedCount: Math.round(completedCount),
        totalCount: Math.round(totalCount),
      };
    }).sort((a, b) => b.adherenceScore - a.adherenceScore);
  
    return { leaderRankings: rankings, uniqueAxes: axes };
  
  }, [employees, interactions, dateRange]);
  
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Ranking de Aderência de Líderes</CardTitle>
            <CardDescription>
              Percentual de interações anuais realizadas por cada líder com sua equipe.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
             <Select onValueChange={setAxisFilter} value={axisFilter} disabled={isLoading || uniqueAxes.length === 0}>
              <SelectTrigger className="w-[180px]">
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
                <p>Nenhum líder encontrado para os filtros selecionados.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
