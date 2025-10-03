import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Icons.logo className="h-12 w-12 text-primary" />
          <CardTitle className="font-headline text-3xl pt-4">Nina 1.0</CardTitle>
          <CardDescription>
            Bem-vindo(a) de volta! Faça login para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard" className="w-full">
            <Button className="w-full">
              <Icons.google className="mr-2 h-4 w-4" />
              Entrar com Google
            </Button>
          </Link>
        </CardContent>
        <CardFooter className="flex-col text-xs text-muted-foreground">
          <p>Ao continuar, você concorda com nossos</p>
          <p>
            <Link href="#" className="underline">
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link href="#" className="underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
