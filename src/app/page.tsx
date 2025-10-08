
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import Image from "next/image";
import { LoginButton } from "@/components/login-button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4" style={{ backgroundColor: '#2B2A27' }}>
      <Card className="w-full max-w-sm rounded-2xl border-none p-8">
        <div className="flex justify-center mb-8">
            <Image 
                src="https://firebasestorage.googleapis.com/v0/b/a-riva-hub.firebasestorage.app/o/Imagens%20institucionais%20(logos%20e%20etc)%2Flogo%20oficial%20preta.png?alt=media&token=ce88dc80-01cd-4295-b443-951e6c0210aa" 
                alt="3A RIVA Investimentos" 
                width={200} 
                height={100} 
                className="h-auto"
            />
        </div>
        <CardContent className="p-0">
          <LoginButton />
        </CardContent>
      </Card>
    </main>
  );
}
