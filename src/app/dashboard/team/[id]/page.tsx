import { teamMembers } from "@/lib/data";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Timeline } from "@/components/timeline";
import { PdiTable } from "@/components/pdi-table";

export default function TeamMemberPage({ params }: { params: { id: string } }) {
  const member = teamMembers.find((m) => m.id === params.id);

  if (!member) {
    notFound();
  }

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].substring(0, 2);
  };
  
  const getRiskBadge = (score: number) => {
    if (score > 60) return "destructive";
    if (score > 30) return "secondary";
    return "default";
  };

  const getRiskLabel = (score: number) => {
    if (score > 60) return "Alto";
    if (score > 30) return "Médio";
    return "Baixo";
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader className="items-center">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback className="text-3xl">{getInitials(member.name)}</AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent className="text-center">
            <CardTitle className="font-headline text-2xl">{member.name}</CardTitle>
            <CardDescription>{member.position}</CardDescription>
            <div className="mt-4 flex justify-center gap-2">
                <Badge variant="outline">{member.role}</Badge>
                <Badge variant={getRiskBadge(member.risk.score)}>Risco: {getRiskLabel(member.risk.score)}</Badge>
            </div>
            <Separator className="my-4" />
            <div className="text-left space-y-2 text-sm text-muted-foreground">
                <p><strong>Email:</strong> {member.email}</p>
                <p><strong>Equipe:</strong> {member.team}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Linha do Tempo de Interação</CardTitle>
              <CardDescription>Um registro cronológico das interações.</CardDescription>
            </div>
            {/* The Dialog for adding interaction would be implemented here */}
            <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Interação
            </Button>
          </CardHeader>
          <CardContent>
            <Timeline interactions={member.timeline} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Plano de Desenvolvimento Individual (PDI)</CardTitle>
              <CardDescription>Ações para o crescimento profissional.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <PdiTable pdiActions={member.pdi} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
