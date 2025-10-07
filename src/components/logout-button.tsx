
"use client";

import { useAuth } from "@/firebase";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <SidebarMenuButton onClick={handleLogout} tooltip="Sair">
      <LogOut />
      <span>Sair</span>
    </SidebarMenuButton>
  );
}
