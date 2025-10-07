
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useFirestore } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import type { PDIAction } from "@/lib/types";

const actionSchema = z.object({
  action: z.string().min(1, "A descrição da ação é obrigatória."),
  category: z.enum(["Technical", "Soft Skill", "Leadership", "Career"]),
  dueDate: z.date({
    required_error: "A data de prazo é obrigatória.",
  }),
  status: z.enum(["Not Started", "In Progress", "Completed"]),
});

type ActionFormData = z.infer<typeof actionSchema>;

interface PdiActionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  action?: PDIAction;
}

export function PdiActionFormDialog({
  open,
  onOpenChange,
  employeeId,
  action,
}: PdiActionFormDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const isEditMode = !!action;

  const form = useForm<ActionFormData>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      action: "",
      category: "Technical",
      status: "Not Started",
    },
  });

  useEffect(() => {
    if (action) {
      form.reset({
        action: action.action,
        category: action.category,
        status: action.status,
        dueDate: new Date(action.dueDate),
      });
    } else {
      form.reset({
        action: "",
        category: "Technical",
        status: "Not Started",
        dueDate: undefined
      });
    }
  }, [action, form]);

  const onSubmit = async (data: ActionFormData) => {
    if (!firestore) return;
    
    const collectionRef = collection(firestore, "employees", employeeId, "pdiActions");
    const docId = isEditMode ? action.id : doc(collectionRef).id;
    const docRef = doc(collectionRef, docId);

    const actionData = {
        ...data,
        id: docId,
        dueDate: data.dueDate.toISOString(),
    };

    try {
      await setDocumentNonBlocking(docRef, actionData, { merge: isEditMode });
      toast({
        title: isEditMode ? "Ação PDI Atualizada" : "Ação PDI Adicionada",
        description: `A ação foi salva com sucesso.`,
      });
      onOpenChange(false);
    } catch (e) {
      console.error("Erro ao salvar ação PDI:", e);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Ocorreu um erro ao salvar a ação. Verifique o console para detalhes.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Ação PDI" : "Adicionar Ação PDI"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos para {isEditMode ? "atualizar a" : "adicionar uma nova"} ação no PDI.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ação</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a ação de desenvolvimento."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Technical">Técnica</SelectItem>
                        <SelectItem value="Soft Skill">Comportamental</SelectItem>
                        <SelectItem value="Leadership">Liderança</SelectItem>
                        <SelectItem value="Career">Carreira</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Not Started">Não Iniciado</SelectItem>
                      <SelectItem value="In Progress">Em Progresso</SelectItem>
                      <SelectItem value="Completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Data de Prazo</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
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
