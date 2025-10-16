
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { BookOpen } from "lucide-react";
import readmeContent from '!!raw-loader!../../README.md';

function Markdown({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return <h1 key={i}>{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i}>{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i}>{line.substring(4)}</h3>;
        }
        if (line.startsWith('-   **')) {
          const boldPart = line.match(/\*\*(.*?)\*\*/)?.[1] || '';
          const rest = line.replace(`-   **${boldPart}**`, '');
          return <p key={i}><strong className="font-semibold">{boldPart}</strong>{rest.substring(1)}</p>;
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4 list-disc">{line.substring(2)}</li>;
        }
        if (line.startsWith('`')) {
          return <code key={i} className="text-sm bg-muted p-1 rounded-md">{line.replace(/`/g, '')}</code>
        }
        if (line.trim() === '---') {
            return <hr key={i} className="my-4 border-border" />
        }
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

export function UsageGuideDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton tooltip="Guia de Uso" className="w-full">
          <BookOpen />
          <span>Guia de Uso</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Guia de Uso da Plataforma</DialogTitle>
          <DialogDescription>
            Encontre aqui todas as informações sobre as funcionalidades da Nina 1.0.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-6 -mr-6">
          <Markdown content={readmeContent} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
