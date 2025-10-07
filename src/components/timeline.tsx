
import type { Interaction } from "@/lib/types";
import {
  MessageSquare,
  Users,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

const interactionIcons: Record<Interaction["type"], React.ReactNode> = {
  "1:1": <Calendar className="h-4 w-4" />,
  "Feedback": <MessageSquare className="h-4 w-4" />,
  "N3 Individual": <Users className="h-4 w-4" />,
  "Índice de Risco": <ShieldAlert className="h-4 w-4" />,
};

export function Timeline({ interactions, isLoading }: { interactions: Interaction[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-3 w-[80px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (interactions.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-8">Nenhuma interação registrada para este colaborador.</p>
  }

  const sortedInteractions = [...interactions].sort((a,b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });
  
  return (
    <div className="relative space-y-6">
      <div className="absolute left-3 top-3 h-full w-0.5 bg-border" aria-hidden="true" />
      {sortedInteractions.map((item) => (
        <div key={item.id} className="relative flex items-start gap-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary z-10">
            <span className={cn("flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground", item.type === 'Índice de Risco' && "text-destructive")}>
                {item.type ? interactionIcons[item.type] : null}
            </span>
          </div>
          <div className="flex-1 pt-0.5">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{item.type}</p>
              {item.type === 'Índice de Risco' && typeof item.riskScore === 'number' && (
                <p className="text-sm font-bold">
                  Pontuação: {item.riskScore}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{item.date ? formatDate(item.date) : 'Data indisponível'}</p>
            <p className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">{item.notes}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
