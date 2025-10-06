import type { Interaction } from "@/lib/types";
import {
  MessageSquare,
  Star,
  Target,
  FileText,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const interactionIcons = {
  "1-on-1": <Calendar className="h-4 w-4" />,
  "Feedback": <MessageSquare className="h-4 w-4" />,
  "Goal Setting": <Target className="h-4 w-4" />,
  "Performance Review": <Star className="h-4 w-4" />,
  "General Note": <FileText className="h-4 w-4" />,
};

export function Timeline({ interactions }: { interactions: Interaction[] }) {
  if (interactions.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma interação registrada.</p>
  }
  
  return (
    <div className="relative space-y-6">
      <div className="absolute left-3 top-3 h-full w-0.5 bg-border" aria-hidden="true" />
      {interactions.map((item) => (
        <div key={item.id} className="relative flex items-start gap-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary z-10">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground">
                {interactionIcons[item.type]}
            </span>
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-medium">{item.type}</p>
            <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
            <p className="mt-2 text-sm text-foreground/90">{item.notes}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
