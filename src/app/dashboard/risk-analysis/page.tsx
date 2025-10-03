import { teamMembers } from "@/lib/data";
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
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";

const chartData = teamMembers.map(member => ({ name: member.name.split(' ')[0], risk: member.risk.score }));

const chartConfig = {
  risk: {
    label: "Risco",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function RiskAnalysisPage() {

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
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Distribuição de Risco</CardTitle>
          <CardDescription>
            Visualização do índice de risco por membro da equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />
              <Tooltip cursor={false} content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              <Bar dataKey="risk" fill="var(--color-risk)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Índice de Risco dos Membros</CardTitle>
          <CardDescription>
            Detalhes sobre as métricas de saúde, satisfação e desempenho.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>Índice de Risco</TableHead>
                <TableHead>Saúde</TableHead>
                <TableHead>Satisfação</TableHead>
                <TableHead>Desempenho</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={member.risk.score} className="w-24" />
                      <Badge variant={getRiskBadge(member.risk.score)}>{getRiskLabel(member.risk.score)}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{member.risk.health}%</TableCell>
                  <TableCell>{member.risk.satisfaction}%</TableCell>
                  <TableCell>{member.risk.performance}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
