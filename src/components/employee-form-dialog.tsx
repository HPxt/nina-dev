
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import type { Employee, Role } from "@/lib/types";

const formSchema = z.object({
  id3a: z.string().min(1, "O ID externo é obrigatório."),
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("O email é inválido."),
  position: z.string().optional(),
  axis: z.string().optional(),
  area: z.string().optional(),
  segment: z.string().optional(),
  // leaderId, leader, and leaderEmail removed from here
  city: z.string().optional(),
  role: z.string().optional(),
  photoURL: z.string().url().optional().or(z.literal('')),
});

type EmployeeFormData = z.infer<typeof formSchema>;

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee;
  leaders: Employee[];
  roles: Role[];
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  leaders,
  roles,
}: EmployeeFormDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const isEditMode = !!employee;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id3a: "",
      name: "",
      email: "",
      position: "",
      axis: "",
      area: "",
      segment: "",
      city: "",
      role: "Colaborador",
      photoURL: "",
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        id3a: employee.id3a || "",
        name: employee.name || "",
        email: employee.email || "",
        position: employee.position || "",
        axis: employee.axis || "",
        area: employee.area || "",
        segment: employee.segment || "",
        city: employee.city || "",
        role: employee.role || "Colaborador",
        photoURL: employee.photoURL || "",
      });
    } else {
      form.reset({
        id3a: "",
        name: "",
        email: "",
        position: "",
        axis: "",
        area: "",
        segment: "",
        city: "",
        role: "Colaborador",
        photoURL: "",
      });
    }
  }, [employee, form]);

  const onSubmit = async (data: EmployeeFormData) => {
    if (!firestore) return;

    const docId = isEditMode ? employee.id : data.id3a;
    const docRef = doc(firestore, "employees", docId);
    
    // We don't set leader info here anymore
    const dataToSave = {
        ...data,
    };
    
    try {
      // For a new employee, we also save the leader fields as empty
      const finalData = isEditMode 
        ? dataToSave 
        : { ...dataToSave, leaderId: "", leader: "", leaderEmail: "" };

      await setDocumentNonBlocking(docRef, finalData, { merge: isEditMode });
      toast({
        title: isEditMode ? "Funcionário Atualizado" : "Funcionário Adicionado",
        description: `Os dados de ${data.name} foram salvos com sucesso.`,
      });
      onOpenChange(false);
    } catch (e) {
      console.error("Erro ao salvar funcionário:", e);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description:
          "Ocorreu um erro ao salvar os dados. Verifique o console para detalhes.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Funcionário" : "Adicionar Funcionário"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para{" "}
            {isEditMode ? "atualizar os dados do" : "adicionar um novo"}{" "}
            funcionário.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="id3a"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Externo (id3a)</FormLabel>
                  <FormControl>
                    <Input placeholder="ID do sistema antigo" {...field} disabled={isEditMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do funcionário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Analista de RH" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="axis"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Eixo</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Operações" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Área</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Tecnologia" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="segment"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Segmento</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Varejo" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((roleName) => (
                        <SelectItem key={roleName} value={roleName}>
                          {roleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="photoURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Foto</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/foto.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
