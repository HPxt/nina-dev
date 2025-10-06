
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { LoginButton } from "@/components/login-button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Image src="https://firebasestorage.googleapis.com/v0/b/a-riva-hub.firebasestorage.app/o/Imagens%20institucionais%20(logos%20e%20etc)%2Flogo%20oficial%20preta.png?alt=media&token=ce88dc80-01cd-4295-b443-951e6c0210aa" alt="Nina 1.0 Logo" width={128} height={64} className="h-16 w-auto" />
          <CardTitle className="font-headline text-3xl pt-4">Nina 1.0</CardTitle>
          <CardDescription>
            Bem-vindo(a) de volta! Faça login para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginButton />
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
