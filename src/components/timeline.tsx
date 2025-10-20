

import type { Interaction, OneOnOneNotes, N3IndividualNotes } from "@/lib/types";
import {
  MessageSquare,
  Users,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { Separator } from "./ui/separator";

const interactionIcons: Record<Interaction["type"], React.ReactNode> = {
  "1:1": <Calendar className="h-4 w-4" />,
  "Feedback": <MessageSquare className="h-4 w-4" />,
  "N3 Individual": <Users className="h-4 w-4" />,
  "Índice de Risco": <ShieldAlert className="h-4 w-4" />,
};

const OneOnOneDetails = ({ notes }: { notes: OneOnOneNotes }) => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Visualizar detalhes do 1:1</AccordionTrigger>
        <AccordionContent>
            <div className="space-y-4 text-sm text-foreground/90 p-2">
                {notes.companyGrowth && <div><h4 className="font-semibold mb-1">Crescimento (Empresa)</h4><p className="whitespace-pre-wrap">{notes.companyGrowth}</p></div>}
                {notes.leaderGrowth && <div><h4 className="font-semibold mb-1">Crescimento (Líder)</h4><p className="whitespace-pre-wrap">{notes.leaderGrowth}</p></div>}
                {notes.teamGrowth && <div><h4 className="font-semibold mb-1">Crescimento (Time)</h4><p className="whitespace-pre-wrap">{notes.teamGrowth}</p></div>}
                {notes.personalLife && <div><h4 className="font-semibold mb-1">Vida Pessoal</h4><p className="whitespace-pre-wrap">{notes.personalLife}</p></div>}
                {notes.observations && <div><h4 className="font-semibold mb-1">Observações</h4><p className="whitespace-pre-wrap">{notes.observations}</p></div>}
            </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const N3IndividualDetails = ({ notes }: { notes: N3IndividualNotes }) => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Visualizar detalhes do N3 Individual</AccordionTrigger>
        <AccordionContent>
            <div className="space-y-4 text-sm text-foreground/90 p-2">
                <div>
                    <h4 className="font-semibold mb-2">Indicadores Principais</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-muted-foreground">Captação</p>
                            <p className="font-mono">{notes.captacao || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Churn PF</p>
                            <p className="font-mono">{notes.churnPF || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">ROA</p>
                            <p className="font-mono">{notes.roa || '-'}</p>
                        </div>
                    </div>
                </div>
                <Separator />
                {notes.esforcos && <div><h4 className="font-semibold mb-1">Indicadores de Esforços</h4><p className="whitespace-pre-wrap">{notes.esforcos}</p></div>}
                {notes.planoAcao && <div><h4 className="font-semibold mb-1">Plano de Ação</h4><p className="whitespace-pre-wrap">{notes.planoAcao}</p></div>}
            </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
  
  const RiskAssessmentDetails = ({ notes }: { notes: string }) => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Visualizar detalhes do Índice de Risco</AccordionTrigger>
        <AccordionContent>
            <div className="text-sm text-foreground/90 p-2 whitespace-pre-wrap">
                {notes}
            </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  function isN3IndividualNotes(notes: any): notes is N3IndividualNotes {
    return notes && (typeof notes.captacao !== 'undefined' || typeof notes.esforcos !== 'undefined');
  }
  

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
            <div className="flex items-center text-xs text-muted-foreground gap-2">
                <span>{item.date ? formatDate(item.date) : 'Data indisponível'}</span>
                {item.source && (
                    <>
                        <span className="text-muted-foreground/50">|</span>
                        <span>Origem: {item.source}</span>
                    </>
                )}
            </div>
            <div className="mt-2 text-sm">
                {typeof item.notes === 'string' && item.type === 'Feedback' ? (
                     <p className="whitespace-pre-wrap">{item.notes}</p>
                ) : typeof item.notes === 'string' && item.type === 'Índice de Risco' ? (
                    <RiskAssessmentDetails notes={item.notes} />
                ) : item.type === '1:1' && item.notes ? (
                    <OneOnOneDetails notes={item.notes as OneOnOneNotes} />
                ) : item.type === 'N3 Individual' && isN3IndividualNotes(item.notes) ? (
                    <N3IndividualDetails notes={item.notes as N3IndividualNotes} />
                ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
