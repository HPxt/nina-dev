"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SobrePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Sobre a Plataforma Nina 1.0</CardTitle>
          <CardDescription>
            Uma ferramenta dedicada à gestão de liderança e desenvolvimento de equipes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            A Nina 1.0 foi desenvolvida para centralizar e otimizar o acompanhamento de performance,
            o registro de interações e o planejamento do desenvolvimento individual dos colaboradores
            na 3A RIVA Investimentos.
          </p>
          <p>
            Utilizando tecnologias modernas como Next.js e Firebase, a plataforma oferece uma experiência
            segura, rápida e em tempo real para líderes, diretores e administradores.
          </p>
          <Button asChild>
            <Link href="/">Voltar para o Login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
