
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
import { ScrollArea } from "./ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";


type CsvData = { [key: string]: string };

const EXPECTED_COLUMNS = [
    'id3a',
    'name',
    'email',
    'photoURL',
    'axis',
    'area',
    'position',
    'segment',
    'leader',
    'city'
];

export function CsvUploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; }) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CsvData[]>([]);
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
        const values = line.split(',');
        return header.reduce((obj, nextKey, index) => {
            obj[nextKey] = values[index] ? values[index].trim() : '';
            return obj;
        }, {} as CsvData);
      });
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
    try {
      const importPromises = data.map(row => {
        const docId = row.id3a;
        if (!docId) {
          console.warn("Linha ignorada por falta de id3a:", row);
          return Promise.resolve(); // Ignora a linha se não tiver id
        }
        const docRef = doc(firestore, "employees", docId);
        // Os dados em `row` já estão no formato que queremos salvar.
        return setDocumentNonBlocking(docRef, row, { merge: true });
      });

      // Embora a função seja "non-blocking", esperamos todas as escritas iniciarem.
      await Promise.all(importPromises);

      toast({
        title: "Importação Concluída",
        description: `${data.length} registros foram processados com sucesso.`,
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upload de Funcionários via CSV</DialogTitle>
          <DialogDescription>
            Selecione ou arraste um arquivo CSV para importar os dados dos funcionários.
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
            
            {data.length > 0 && (
                <div>
                    <h3 className="mb-2 font-medium">Pré-visualização dos dados</h3>
                    <ScrollArea className="h-64 w-full rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                {EXPECTED_COLUMNS.map(col => <TableHead key={col}>{col}</TableHead>)}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, i) => (
                                    <TableRow key={i}>
                                        {EXPECTED_COLUMNS.map(col => <TableCell key={col}>{row[col]}</TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>Cancelar</Button>
          <Button onClick={handleImport} disabled={data.length === 0 || !!error || isImporting}>
            {isImporting ? "Importando..." : `Importar ${data.length > 0 ? `${data.length} registros` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
