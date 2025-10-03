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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
  import { Textarea } from "./ui/textarea";

export function PdiTable({ pdiActions }: { pdiActions: PDIAction[] }) {
    const [open, setOpen] = useState(false);

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
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Ação
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Adicionar Ação PDI</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes da nova ação de desenvolvimento.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="action" className="text-right">Ação</Label>
                            <Input id="action" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Categoria</Label>
                            <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Technical">Técnica</SelectItem>
                                    <SelectItem value="Soft Skill">Comportamental</SelectItem>
                                    <SelectItem value="Leadership">Liderança</SelectItem>
                                    <SelectItem value="Career">Carreira</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dueDate" className="text-right">Prazo</Label>
                            <Input id="dueDate" type="date" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                    <Button type="submit" onClick={() => setOpen(false)}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                            <DropdownMenuItem><Pen className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Remover</DropdownMenuItem>
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
    </>
  );
}
