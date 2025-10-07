
"use client";

import { useAuth, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useEffect } from "react";

export function LoginButton() {
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);


  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      className="w-full bg-white hover:bg-slate-100 text-slate-800"
      disabled={isUserLoading}
    >
      {isUserLoading ? (
        "Entrando..."
      ) : (
        <>
          <Icons.google className="mr-2 h-4 w-4" />
          Entrar com Google
        </>
      )}
    </Button>
  );
}
