
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
import { MoreHorizontal, PlusCircle, Upload, ArrowUpDown, X, Filter, User, ShieldCheck } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CsvUploadDialog } from "@/components/csv-upload-dialog";
import { useState, useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, deleteDoc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Role } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmployeeFormDialog } from "@/components/employee-form-dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";


const roles: Role[] = ["Colaborador", "Líder", "Diretor"];

type SortConfig = {
  key: keyof Employee;
  direction: "ascending" | "descending";
} | null;

export default function AdminPage() {
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

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
  
    const { leaders, directors, admins, uniqueValues } = useMemo(() => {
        if (!employees) return { leaders: [], directors: [], admins: [], uniqueValues: { positions: [], axes: [], areas: [], segments: [], leaders: [], cities: [], roles: [] } };
        const positions = [...new Set(employees.map(e => e.position).filter(Boolean))].sort();
        const axes = [...new Set(employees.map(e => e.axis).filter(Boolean))].sort();
        const areas = [...new Set(employees.map(e => e.area).filter(Boolean))].sort();
        const segments = [...new Set(employees.map(e => e.segment).filter(Boolean))].sort();
        const leaderNames = [...new Set(employees.map(e => e.leader).filter(Boolean))].sort();
        const cities = [...new Set(employees.map(e => e.city).filter(Boolean))].sort();
        const roles = [...new Set(employees.map(e => e.role).filter(e => e !== 'Admin'))].sort() as Role[];

        const leaders = employees.filter(e => e.role === 'Líder' || e.role === 'Diretor' || e.role === 'Admin');
        const directors = employees.filter(e => e.role === 'Diretor').sort((a,b) => a.name.localeCompare(b.name));
        const admins = employees.filter(e => e.role === 'Admin').sort((a,b) => a.name.localeCompare(b.name));

        return { 
          leaders,
          directors,
          admins,
          uniqueValues: { positions, axes, areas, segments, leaders: leaderNames, cities, roles }
        };
    }, [employees]);


  const filteredAndSortedEmployees = useMemo(() => {
    if (!employees) return [];
    
    let filtered = employees.filter(employee => {
        return (
            (employee.role !== 'Admin') &&
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

  const teams = useMemo(() => {
    if (!employees) return new Map<string, Employee[]>();
  
    const groupedByLeader = new Map<string, Employee[]>();
  
    employees.forEach(employee => {
      const leaderId = employee.leaderId || "sem-lider";
  
      if (!groupedByLeader.has(leaderId)) {
        groupedByLeader.set(leaderId, []);
      }
      groupedByLeader.get(leaderId)?.push(employee);
    });
  
    const leaderIdToNameMap = new Map<string, string>();
    employees.forEach(e => {
        if(e.role === 'Líder' || e.role === 'Diretor' || e.role === 'Admin') {
            leaderIdToNameMap.set(e.id, e.name);
        }
    });
    leaderIdToNameMap.set('sem-lider', 'Sem Líder');


    // Sort leaders alphabetically by name
    const sortedLeaderIds = [...groupedByLeader.keys()].sort((a, b) => {
      const nameA = leaderIdToNameMap.get(a) || '';
      const nameB = leaderIdToNameMap.get(b) || '';
      return nameA.localeCompare(nameB);
    });
  
    const sortedMap = new Map<string, Employee[]>();
    sortedLeaderIds.forEach(leaderId => {
      // Sort employees within each team alphabetically
      const sortedEmployees = groupedByLeader.get(leaderId)?.sort((a, b) => a.name.localeCompare(b.name));
      if (sortedEmployees) {
        sortedMap.set(leaderId, sortedEmployees);
      }
    });
  
    return sortedMap;
  }, [employees]);
  
  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };


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

  const handleAddEmployee = () => {
    setSelectedEmployee(undefined);
    setIsEmployeeFormOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeFormOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!firestore || !employeeToDelete) return;
    const docRef = doc(firestore, "employees", employeeToDelete.id);
    try {
      await deleteDoc(docRef);
      toast({
        title: "Funcionário Removido",
        description: `${employeeToDelete.name} foi removido com sucesso.`,
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Remover",
        description: "Não foi possível remover o funcionário.",
      });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };


  const handleLeaderChange = (employeeId: string, newLeaderId: string) => {
    if (!firestore || !employees) return;
    
    const employeeDocRef = doc(firestore, "employees", employeeId);
    
    // If newLeaderId is 'no-leader', it means "Sem Líder" was selected
    if (newLeaderId === "no-leader") {
        const dataToSave = {
            leaderId: "",
            leader: "",
            leaderEmail: ""
        };
        setDocumentNonBlocking(employeeDocRef, dataToSave, { merge: true });
        return;
    }

    const newLeader = leaders.find(l => l.id === newLeaderId);

    const dataToSave = {
        leaderId: newLeader?.id || "",
        leader: newLeader?.name || "",
        leaderEmail: newLeader?.email || ""
    };
    
    setDocumentNonBlocking(employeeDocRef, dataToSave, { merge: true });
  };
  
  const handleManagementToggle = (employeeId: string, isUnderManagement: boolean) => {
    if (!firestore) return;
    const docRef = doc(firestore, "employees", employeeId);
    setDocumentNonBlocking(docRef, { isUnderManagement }, { merge: true });
  }

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
              {options.map((option, index) => (
                <DropdownMenuCheckboxItem
                  key={`${option}-${index}`}
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
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="employees">Funcionários</TabsTrigger>
        <TabsTrigger value="teams">Equipes</TabsTrigger>
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
                    <Button size="sm" onClick={handleAddEmployee}>
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
                    <FilterComponent title="Líder" filterKey="leader" options={uniqueValues.leaders} />
                  </TableHead>
                  <TableHead>
                    <FilterComponent title="Função" filterKey="role" options={uniqueValues.roles} />
                  </TableHead>
                  <TableHead>Gerenciamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-9 w-[180px]" /></TableCell>
                        <TableCell><Skeleton className="h-9 w-[180px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    </TableRow>
                ))}
                {!isLoading && filteredAndSortedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                       <Select 
                        value={employee.leaderId || "no-leader"}
                        onValueChange={(newLeaderId) => handleLeaderChange(employee.id, newLeaderId)}
                        disabled={!leaders || leaders.length === 0}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sem Líder" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-leader">Sem Líder</SelectItem>
                          {leaders
                            .filter(leader => leader.id !== employee.id) // Cannot be their own leader
                            .map((leader) => (
                            <SelectItem key={leader.id} value={leader.id}>
                               {leader.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={employee.role}
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
                    <TableCell>
                        <div className="flex items-center space-x-2">
                            <Switch 
                                id={`management-${employee.id}`}
                                checked={employee.isUnderManagement}
                                onCheckedChange={(checked) => handleManagementToggle(employee.id, checked)}
                            />
                            <Label htmlFor={`management-${employee.id}`}>{employee.isUnderManagement ? 'Sim' : 'Não'}</Label>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>Editar</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(employee)}>Remover</DropdownMenuItem>
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
       <TabsContent value="teams">
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Diretores</CardTitle>
                    <CardDescription>
                        Usuários com permissão para visualizar todos os colaboradores.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-2/3" />
                            <Skeleton className="h-10 w-1/2" />
                        </div>
                    ) : directors.length > 0 ? (
                        <ul className="space-y-3">
                            {directors.map(director => (
                                <li key={director.id} className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={director.photoURL} alt={director.name} />
                                        <AvatarFallback>{getInitials(director.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <span className="font-medium">{director.name}</span>
                                        <p className="text-sm text-muted-foreground">{director.position}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center">Nenhum diretor cadastrado.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Equipes e Colaboradores</CardTitle>
                <CardDescription>Visualize as equipes com base na liderança.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="mb-4">
                            <Skeleton className="h-12 w-1/3 mb-2" />
                            <div className="pl-6 space-y-2">
                                <Skeleton className="h-8 w-2/3" />
                                <Skeleton className="h-8 w-1/2" />
                            </div>
                        </div>
                    ))
                ) : (
                <Accordion type="multiple" className="w-full">
                {[...teams.entries()].map(([leaderId, members]) => {
                    const leaderEmployee = employees?.find(e => e.id === leaderId);
                    const leaderName = leaderEmployee?.name || "Sem Líder";

                    return (
                    <AccordionItem value={leaderId} key={leaderId}>
                        <AccordionTrigger>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={leaderEmployee?.photoURL} alt={leaderName} />
                                    <AvatarFallback>{getInitials(leaderName)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{leaderName}</span>
                                <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-white bg-primary rounded-full">
                                    {members.length}
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                        <ul className="pl-6 space-y-3">
                            {members.map((member) => (
                            <li key={member.id} className="flex items-center gap-3 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{member.name}</span>
                                <span className="text-muted-foreground">({member.position})</span>
                            </li>
                            ))}
                        </ul>
                        </AccordionContent>
                    </AccordionItem>
                    )
                })}
                </Accordion>
                )}
            </CardContent>
            </Card>
        </div>
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
                    <h3 className="text-base font-medium">Modo de Manutenção</h3>
                    <p className="text-sm text-muted-foreground">
                        Ative para desabilitar o acesso ao aplicativo para todos, exceto administradores.
                    </p>
                </div>
                <Switch id="maintenance-mode" />
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Administradores</CardTitle>
                            <CardDescription>Gerencie quem tem acesso de administrador.</CardDescription>
                        </div>
                        <Button>Gerenciar Admins</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-3">
                            <Skeleton className="h-10 w-2/3" />
                            <Skeleton className="h-10 w-1/2" />
                        </div>
                    ) : admins.length > 0 ? (
                        <ul className="space-y-4">
                            {admins.map(admin => (
                                <li key={admin.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={admin.photoURL} alt={admin.name} />
                                            <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <span className="font-medium">{admin.name}</span>
                                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                                        </div>
                                    </div>
                                    <ShieldCheck className="h-5 w-5 text-primary"/>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum administrador cadastrado.</p>
                    )}
                </CardContent>
            </Card>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    <CsvUploadDialog open={isCsvDialogOpen} onOpenChange={setIsCsvDialogOpen} />
    <EmployeeFormDialog 
        open={isEmployeeFormOpen} 
        onOpenChange={setIsEmployeeFormOpen}
        employee={selectedEmployee}
        leaders={leaders}
        roles={roles}
    />
    <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Isso irá remover permanentemente o funcionário
            "{employeeToDelete?.name}" do banco de dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteEmployee} className="bg-destructive hover:bg-destructive/90">
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
