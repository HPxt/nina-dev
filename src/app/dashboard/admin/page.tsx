
"use client";

import type { Employee } from "@/lib/types";
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
import { MoreHorizontal, PlusCircle, Upload, ArrowUpDown, X, Filter } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CsvUploadDialog } from "@/components/csv-upload-dialog";
import { useState, useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Role } from "@/lib/types";


const roles: Role[] = ["Colaborador", "Líder", "Diretor", "Admin"];

type SortConfig = {
  key: keyof Employee;
  direction: "ascending" | "descending";
} | null;

export default function AdminPage() {
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const initialFilters = {
    email: "",
    name: "",
    position: new Set<string>(),
    axis: new Set<string>(),
    area: new Set<string>(),
    segment: new Set<string>(),
    leader: new Set<string>(),
    city: new Set<string>(),
    role: new Set<string>(),
  };

  const [filters, setFilters] = useState(initialFilters);
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
    if (!employees) return { positions: [], axes: [], areas: [], segments: [], leaders: [], cities: [], roles: [] };
    const positions = [...new Set(employees.map(e => e.position).filter(Boolean))].sort();
    const axes = [...new Set(employees.map(e => e.axis).filter(Boolean))].sort();
    const areas = [...new Set(employees.map(e => e.area).filter(Boolean))].sort();
    const segments = [...new Set(employees.map(e => e.segment).filter(Boolean))].sort();
    const leaders = [...new Set(employees.map(e => e.leader).filter(Boolean))].sort();
    const cities = [...new Set(employees.map(e => e.city).filter(Boolean))].sort();
    const roles = [...new Set(employees.map(e => e.role).filter(Boolean))].sort() as Role[];
    return { positions, axes, areas, segments, leaders, cities, roles };
  }, [employees]);


  const filteredAndSortedEmployees = useMemo(() => {
    if (!employees) return [];
    
    let filtered = employees.filter(employee => {
        return (
            (!filters.email || employee.email?.toLowerCase().includes(filters.email.toLowerCase())) &&
            (!filters.name || employee.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
            (filters.position.size === 0 || (employee.position && filters.position.has(employee.position))) &&
            (filters.axis.size === 0 || (employee.axis && filters.axis.has(employee.axis))) &&
            (filters.area.size === 0 || (employee.area && filters.area.has(employee.area))) &&
            (filters.segment.size === 0 || (employee.segment && filters.segment.has(employee.segment))) &&
            (filters.leader.size === 0 || (employee.leader && filters.leader.has(employee.leader))) &&
            (filters.city.size === 0 || (employee.city && filters.city.has(employee.city))) &&
            (filters.role.size === 0 || (employee.role && filters.role.has(employee.role)))
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

  const handleMultiSelectFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const newSet = new Set(prev[filterName] as Set<string>);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return { ...prev, [filterName]: newSet };
    });
  };

  const handleTextFilterChange = (filterName: 'email' | 'name', value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const isFilterActive = useMemo(() => {
    return Object.values(filters).some(value => {
      if (typeof value === 'string') return value !== '';
      if (value instanceof Set) return value.size > 0;
      return false;
    });
  }, [filters]);

  const clearFilters = () => setFilters(initialFilters);

  const isLoading = isUserLoading || areEmployeesLoading;

  const FilterComponent = ({ title, filterKey, options, children }: { title: string, filterKey: keyof typeof filters, options: string[], children?: React.ReactNode }) => (
    <div className="flex items-center gap-1">
      <span>{title}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Filter className={`h-4 w-4 ${filters[filterKey] instanceof Set && (filters[filterKey] as Set<string>).size > 0 ? 'text-primary' : ''}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {children ? children :
            <>
              {options.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  checked={filters[filterKey] instanceof Set && (filters[filterKey] as Set<string>).has(option)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() => handleMultiSelectFilterChange(filterKey, option)}
                >
                  {option}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

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
                    {isFilterActive && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="mr-2 h-4 w-4" />
                        Limpar filtros
                      </Button>
                    )}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" onClick={() => requestSort('name')} className="px-1">
                        Nome
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                       <Popover>
                        <PopoverTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Filter className={`h-4 w-4 ${filters.name ? 'text-primary' : ''}`} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2">
                            <Input
                                placeholder="Filtrar por nome..."
                                value={filters.name}
                                onChange={(e) => handleTextFilterChange('name', e.target.value)}
                            />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableHead>
                   <TableHead>
                     <div className="flex items-center gap-1">
                        <span>Email</span>
                        <Popover>
                          <PopoverTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Filter className={`h-4 w-4 ${filters.email ? 'text-primary' : ''}`} />
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-2">
                              <Input
                                  placeholder="Filtrar por email..."
                                  value={filters.email}
                                  onChange={(e) => handleTextFilterChange('email', e.target.value)}
                              />
                          </PopoverContent>
                        </Popover>
                      </div>
                  </TableHead>
                  <TableHead>
                    <FilterComponent title="Cargo" filterKey="position" options={uniqueValues.positions} />
                  </TableHead>
                  <TableHead>
                     <FilterComponent title="Eixo" filterKey="axis" options={uniqueValues.axes} />
                  </TableHead>
                  <TableHead>
                    <FilterComponent title="Área" filterKey="area" options={uniqueValues.areas} />
                  </TableHead>
                  <TableHead>
                    <FilterComponent title="Segmento" filterKey="segment" options={uniqueValues.segments} />
                  </TableHead>
                  <TableHead>
                    <FilterComponent title="Líder" filterKey="leader" options={uniqueValues.leaders} />
                  </TableHead>
                  <TableHead>
                    <FilterComponent title="Cidade" filterKey="city" options={uniqueValues.cities} />
                  </TableHead>
                  <TableHead>
                    <FilterComponent title="Função" filterKey="role" options={uniqueValues.roles} />
                  </TableHead>
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

    