
"use client";

import { useAuth, useFirestore, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { Employee } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const adminEmails = ['matheus@3ainvestimentos.com.br', 'lucas.nogueira@3ainvestimentos.com.br'];

export function LoginButton() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // O useEffect cuidará do redirecionamento após a verificação
    } catch (error) {
      console.error("Google sign-in failed", error);
      toast({
        variant: "destructive",
        title: "Erro de Login",
        description: "Falha ao autenticar com o Google.",
      });
    }
  };

  useEffect(() => {
    const verifyAccess = async () => {
      // Aguarda o usuário ser carregado e não estar em outra verificação
      if (isUserLoading || !user || !firestore || isVerifying) return;

      setIsVerifying(true);

      if (user.email && adminEmails.includes(user.email)) {
        router.push("/dashboard/v2");
        setIsVerifying(false);
        return;
      }

      const employeesRef = collection(firestore, "employees");
      const q = query(employeesRef, where("email", "==", user.email));
      
      try {
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error("Usuário não encontrado no sistema.");
        }

        const employeeDoc = querySnapshot.docs[0];
        const employeeData = employeeDoc.data() as Employee;

        // Verifica se o usuário tem a função ou permissão necessária
        const hasAccess = employeeData.role === 'Líder' || employeeData.isDirector === true || employeeData.isAdmin === true;

        if (hasAccess) {
          router.push("/dashboard/v2");
        } else {
          throw new Error("Seu perfil de 'Colaborador' não tem permissão de acesso.");
        }

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Acesso Negado",
          description: error.message || "Você não tem permissão para acessar este sistema.",
        });
        if (auth) {
          await signOut(auth);
        }
      } finally {
        setIsVerifying(false);
      }
    };

    if (user) {
        verifyAccess();
    }
  }, [user, isUserLoading, firestore, router, auth, toast, isVerifying]);

  const isLoading = isUserLoading || isVerifying;

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      className="w-full bg-white text-slate-800 hover:bg-white/90"
      disabled={isLoading}
    >
      {isLoading ? (
        "Verificando..."
      ) : (
        <>
          <Icons.google className="mr-2 h-4 w-4" />
          Entrar com Google
        </>
      )}
    </Button>
  );
}
