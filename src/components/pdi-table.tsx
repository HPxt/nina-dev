
"use client"

import { useState } from "react";
import type { PDIAction } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Pen, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PdiActionFormDialog } from "./pdi-action-form-dialog";

type PdiTableProps = {
    pdiActions: PDIAction[];
    employeeId: string;
};

export function PdiTable({ pdiActions, employeeId }: PdiTableProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState<PDIAction | undefined>(undefined);

    const handleAdd = () => {
        setSelectedAction(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (action: PDIAction) => {
        setSelectedAction(action);
        setIsFormOpen(true);
    };

    const handleDelete = (actionId: string) => {
        // TODO: Implement deletion logic
        console.log("Delete action:", actionId);
    };

    const getStatusBadge = (status: "Not Started" | "In Progress" | "Completed") => {
        switch (status) {
          case "Completed":
            return "default";
          case "In Progress":
            return "secondary";
          case "Not Started":
            return "outline";
        }
    };
    
  return (
    <>
        <div className="flex justify-end mb-4">
            <Button size="sm" onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Ação
            </Button>
        </div>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Ação</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {pdiActions.length > 0 ? pdiActions.map((item) => (
            <TableRow key={item.id}>
                <TableCell className="font-medium">{item.action}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{new Date(item.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                <Badge variant={getStatusBadge(item.status)}>{item.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEdit(item)}><Pen className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id)}><Trash className="mr-2 h-4 w-4" /> Remover</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">Nenhuma ação PDI encontrada.</TableCell>
                </TableRow>
            )}
        </TableBody>
        </Table>
        <PdiActionFormDialog
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            employeeId={employeeId}
            action={selectedAction}
        />
    </>
  );
}

