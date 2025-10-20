"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, FileCheck2, AlertCircle } from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection, doc, getDocs, query, where, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Employee, InteractionType } from "@/lib/types";

type CsvInteractionData = { [key: string]: string };

const EXPECTED_COLUMNS = [
    'employeeEmail',
    'interactionDate',
    'interactionType',
    'notes'
];

const VALID_INTERACTION_TYPES: InteractionType[] = ['1:1', 'Feedback', 'N3 Individual', 'Índice de Risco'];

export function InteractionCsvUploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; }) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CsvInteractionData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setFile(null);
    setData([]);
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
        if(selectedFile.type !== 'text/csv') {
            setError("Tipo de arquivo inválido. Por favor, selecione um arquivo CSV.");
            return;
        }
      setFile(selectedFile);
      parseCsv(selectedFile);
    }
  }, []);

  const parseCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        setError("O arquivo CSV está vazio ou contém apenas o cabeçalho.");
        return;
      }
      const header = lines[0].split(',').map(h => h.trim());
      
      const missingColumns = EXPECTED_COLUMNS.filter(col => !header.includes(col));
      if (missingColumns.length > 0) {
          setError(`As seguintes colunas obrigatórias estão faltando: ${missingColumns.join(', ')}`);
          return;
      }

      const rows = lines.slice(1).map((line) => {
        // Simple CSV split, doesn't handle commas within quoted fields.
        const values = line.split(',');
        return header.reduce((obj, nextKey, index) => {
            obj[nextKey] = values[index] ? values[index].trim() : '';
            return obj;
        }, {} as CsvInteractionData);
      });

      // Data validation
      for(let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!VALID_INTERACTION_TYPES.includes(row.interactionType as InteractionType)) {
            setError(`Linha ${i + 2}: Tipo de interação inválido "${row.interactionType}". Use um de: ${VALID_INTERACTION_TYPES.join(', ')}`);
            return;
        }
        if (isNaN(Date.parse(row.interactionDate))) {
            setError(`Linha ${i + 2}: Formato de data inválido "${row.interactionDate}". Use AAAA-MM-DD.`);
            return;
        }
      }

      setData(rows);
    };
    reader.onerror = () => {
        setError("Ocorreu um erro ao ler o arquivo.");
    }
    reader.readAsText(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  const handleClose = () => {
    setFile(null);
    setData([]);
    setError(null);
    setIsImporting(false);
    onOpenChange(false);
  }

  const handleImport = async () => {
    if (!firestore || data.length === 0) return;

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
        // 1. Fetch all employees to create a local map for quick lookup.
        const employeesRef = collection(firestore, "employees");
        const querySnapshot = await getDocs(employeesRef);
        const employeeMapByEmail = new Map<string, Employee>();
        querySnapshot.forEach(doc => {
            const employee = { id: doc.id, ...doc.data() } as Employee;
            if (employee.email) {
                employeeMapByEmail.set(employee.email.toLowerCase(), employee);
            }
        });

        // 2. Process each row from the CSV
        for (const row of data) {
            const employeeEmail = row.employeeEmail?.toLowerCase();
            const employee = employeeMapByEmail.get(employeeEmail);

            if (!employee) {
                console.warn(`Funcionário com email ${row.employeeEmail} não encontrado. Linha ignorada.`);
                errorCount++;
                continue;
            }

            const interactionCollectionRef = collection(firestore, "employees", employee.id, "interactions");
            
            const interactionData = {
                type: row.interactionType,
                date: new Date(row.interactionDate).toISOString(),
                notes: row.notes,
                source: "Pipedrive", // Mark as imported
                authorId: "import",
                riskScore: row.riskScore ? parseInt(row.riskScore, 10) : undefined,
                nextInteractionDate: row.nextInteractionDate ? new Date(row.nextInteractionDate).toISOString() : undefined,
            };

            try {
                await addDoc(interactionCollectionRef, interactionData);
                successCount++;
            } catch (e) {
                console.error(`Erro ao importar interação para ${employee.name}:`, e);
                errorCount++;
            }
        }

        toast({
            title: "Importação Concluída",
            description: `${successCount} interações importadas com sucesso. ${errorCount} linhas falharam (ver console para detalhes).`,
        });

    } catch (e) {
      console.error("Erro durante a importação:", e);
      toast({
        variant: "destructive",
        title: "Erro na Importação",
        description: "Ocorreu um erro ao salvar os dados. Verifique o console para mais detalhes.",
      });
    } finally {
      handleClose();
    }
  };


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload de Interações Históricas via CSV</DialogTitle>
          <DialogDescription>
            O CSV deve conter as colunas: {EXPECTED_COLUMNS.join(', ')}. Outras colunas como 'riskScore' e 'nextInteractionDate' são opcionais.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="text-center">
                    <FileCheck2 className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-2 font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{data.length} registros encontrados</p>
                </div>
              ) : (
                <div className="text-center">
                    <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                    {isDragActive ? (
                        <p className="mt-2 text-primary">Solte o arquivo aqui...</p>
                    ) : (
                        <p className="mt-2">
                        Arraste e solte o arquivo CSV aqui, ou{" "}
                        <span className="font-semibold text-primary">clique para selecionar</span>.
                        </p>
                    )}
                </div>
              )}
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>Cancelar</Button>
          <Button onClick={handleImport} disabled={data.length === 0 || !!error || isImporting}>
            {isImporting ? "Importando..." : `Importar ${data.length > 0 ? `${data.length} interações` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
