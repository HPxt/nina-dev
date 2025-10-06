
"use client";

import type { Employee, Role } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Upload, ArrowUpDown, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CsvUploadDialog } from "@/components/csv-upload-dialog";
import { useState, useMemo, useEffect } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const roles: Role[] = ["Colaborador", "Líder", "Diretor", "Admin"];

type SortConfig = {
  key: keyof Employee;
  direction: "ascending" | "descending";
} | null;

export default function AdminPage() {
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const [filters, setFilters] = useState({
    email: "",
    position: "",
    axis: "",
    area: "",
    segment: "",
    leader: "",
    city: "",
    role: "",
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });

  const employeesCollection = useMemoFirebase(
    () => (firestore && user ? collection(firestore, "employees") : null),
    [firestore, user]
  );
  
  const { data: employees, isLoading: areEmployeesLoading } = useCollection<Employee>(employeesCollection);

  const handleRoleChange = (employeeId: string, newRole: Role) => {
    if (!firestore) return;
    const docRef = doc(firestore, "employees", employeeId);
    setDocumentNonBlocking(docRef, { role: newRole }, { merge: true });
  };
  
  const uniqueValues = useMemo(() => {
    if (!employees) return { positions: [], axes: [], areas: [], segments: [], leaders: [], cities: [] };
    const positions = [...new Set(employees.map(e => e.position).filter(Boolean))] as string[];
    const axes = [...new Set(employees.map(e => e.axis).filter(Boolean))] as string[];
    const areas = [...new Set(employees.map(e => e.area).filter(Boolean))] as string[];
    const segments = [...new Set(employees.map(e => e.segment).filter(Boolean))] as string[];
    const leaders = [...new Set(employees.map(e => e.leader).filter(Boolean))] as string[];
    const cities = [...new Set(employees.map(e => e.city).filter(Boolean))] as string[];
    return { positions, axes, areas, segments, leaders, cities };
  }, [employees]);


  const filteredAndSortedEmployees = useMemo(() => {
    if (!employees) return [];
    
    let filtered = employees.filter(employee => {
        return (
            (!filters.email || employee.email?.toLowerCase().includes(filters.email.toLowerCase())) &&
            (!filters.position || employee.position === filters.position) &&
            (!filters.axis || employee.axis === filters.axis) &&
            (!filters.area || employee.area === filters.area) &&
            (!filters.segment || employee.segment === filters.segment) &&
            (!filters.leader || employee.leader === filters.leader) &&
            (!filters.city || employee.city === filters.city) &&
            (!filters.role || employee.role === filters.role)
        );
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === undefined || bValue === undefined || aValue === null || bValue === null) return 0;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [employees, filters, sortConfig]);

  const requestSort = (key: keyof Employee) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({ email: "", position: "", axis: "", area: "", segment: "", leader: "", city: "", role: "" });
  };

  const isLoading = isUserLoading || areEmployeesLoading;

  return (
    <>
    <Tabs defaultValue="employees">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="employees">Funcionários</TabsTrigger>
        <TabsTrigger value="settings">Geral</TabsTrigger>
      </TabsList>
      <TabsContent value="employees">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Gerenciar Funcionários</CardTitle>
                    <CardDescription>
                        Adicione, edite e gerencie funções e permissões dos funcionários.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsCsvDialogOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload CSV
                    </Button>
                    <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Funcionário
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <Input 
                      placeholder="Filtrar por Email..."
                      value={filters.email}
                      onChange={(e) => handleFilterChange('email', e.target.value)}
                      className="bg-background"
                  />
                   <Select value={filters.position} onValueChange={(value) => handleFilterChange('position', value)}>
                      <SelectTrigger><SelectValue placeholder="Cargo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os Cargos</SelectItem>
                        {uniqueValues.positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                  </Select>
                  <Select value={filters.axis} onValueChange={(value) => handleFilterChange('axis', value)}>
                      <SelectTrigger><SelectValue placeholder="Eixo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os Eixos</SelectItem>
                        {uniqueValues.axes.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                  </Select>
                   <Select value={filters.area} onValueChange={(value) => handleFilterChange('area', value)}>
                      <SelectTrigger><SelectValue placeholder="Área" /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="">Todas as Áreas</SelectItem>
                        {uniqueValues.areas.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                  </Select>
                   <Select value={filters.segment} onValueChange={(value) => handleFilterChange('segment', value)}>
                      <SelectTrigger><SelectValue placeholder="Segmento" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os Segmentos</SelectItem>
                        {uniqueValues.segments.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                  </Select>
                   <Select value={filters.leader} onValueChange={(value) => handleFilterChange('leader', value)}>
                      <SelectTrigger><SelectValue placeholder="Líder" /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="">Todos os Líderes</SelectItem>
                        {uniqueValues.leaders.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                  </Select>
                   <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                      <SelectTrigger><SelectValue placeholder="Cidade" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as Cidades</SelectItem>
                        {uniqueValues.cities.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                  </Select>
                   <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                      <SelectTrigger><SelectValue placeholder="Função" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as Funções</SelectItem>
                        {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                  </Select>
                  <Button variant="ghost" onClick={clearFilters} className="lg:col-start-5">
                    <X className="mr-2 h-4 w-4" />
                    Limpar Filtros
                  </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('name')}>
                      Nome
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Eixo</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Líder</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-9 w-[180px]" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    </TableRow>
                ))}
                {!isLoading && filteredAndSortedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.axis}</TableCell>
                    <TableCell>{employee.area}</TableCell>
                    <TableCell>{employee.segment}</TableCell>
                    <TableCell>{employee.leader}</TableCell>
                    <TableCell>{employee.city}</TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={employee.role}
                        onValueChange={(newRole) => handleRoleChange(employee.id, newRole as Role)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Remover</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>
              Gerencie as configurações globais do aplicativo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="maintenance-mode" className="text-base font-medium">Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                        Ative para desabilitar o acesso ao aplicativo para todos, exceto administradores.
                    </p>
                </div>
                <Switch id="maintenance-mode" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    <CsvUploadDialog open={isCsvDialogOpen} onOpenChange={setIsCsvDialogOpen} />
    </>
  );
}
