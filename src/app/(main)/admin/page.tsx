
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getAllUsers, updateUserRole, deleteHabitForUser, seedUsersAndProfiles, createFakeUser } from '@/lib/firestore-service';
import { FirestoreUser, FirestoreHabit } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ShieldCheck, BarChart4, Trash2, Eye, TestTube2, PlusCircle, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

const fakeUserSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  completedHabits: z.coerce.number().min(0).max(100),
  hasActiveHabits: z.boolean(),
  streakDays: z.coerce.number().min(0).max(365),
});

export default function AdminPage() {
  const { user, userDoc, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  
  const isUserAdmin = useMemo(() => userDoc?.data()?.role === 'admin', [userDoc]);

  const form = useForm<z.infer<typeof fakeUserSchema>>({
    resolver: zodResolver(fakeUserSchema),
    defaultValues: {
      name: '',
      completedHabits: 0,
      hasActiveHabits: true,
      streakDays: 3,
    },
  });

  const fetchAllUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los usuarios.' });
      }
    };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (userDoc && !isUserAdmin) {
        router.push('/home');
      } else if(userDoc && isUserAdmin) {
        setLoading(true);
        fetchAllUsers().finally(() => setLoading(false));
      }
    }
  }, [authLoading, user, isUserAdmin, userDoc, router, toast]);

  const handleRoleChange = async (uid: string, newRole: 'user' | 'admin') => {
    try {
      await updateUserRole(uid, newRole);
      setAllUsers(prevUsers => prevUsers.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      toast({ title: 'Éxito', description: `Rol actualizado para el usuario.` });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el rol.' });
    }
  };

  const handleOpenUserHabits = (user: FirestoreUser) => {
    setSelectedUser(user);
    setIsHabitDialogOpen(true);
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!selectedUser) return;
    try {
        await deleteHabitForUser(selectedUser.uid, habitId);
        const updatedUserHabits = selectedUser.habits.filter(h => h.id !== habitId);
        const updatedUser = { ...selectedUser, habits: updatedUserHabits };
        setSelectedUser(updatedUser);
        setAllUsers(prevUsers => prevUsers.map(u => u.uid === selectedUser.uid ? updatedUser : u));
        toast({ title: 'Éxito', description: 'El reto ha sido eliminado.' });
    } catch (error) {
        console.error("Error deleting habit:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el reto.' });
    }
  };
  
  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedUsersAndProfiles(50);
      await fetchAllUsers(); // Refresh user list
      toast({ title: 'Éxito', description: 'Se han generado 50 usuarios ficticios.' });
    } catch (error) {
      console.error("Error seeding data:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron generar los datos de prueba.' });
    } finally {
      setSeeding(false);
    }
  };

  const handleCreateFakeUser = async (values: z.infer<typeof fakeUserSchema>) => {
      setSeeding(true);
      try {
          await createFakeUser(values);
          await fetchAllUsers();
          toast({ title: 'Éxito', description: `Usuario "${values.name}" creado.`});
          form.reset();
          // Keep dialog open for more creation? For now, we close it.
      } catch (error) {
          console.error("Error creating fake user:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el usuario.' });
      } finally {
          setSeeding(false);
      }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;
    return allUsers.filter(u => 
        (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allUsers, searchTerm]);
  
  const totalHabits = useMemo(() => {
      return allUsers.reduce((acc, user) => acc + (user.habits?.length || 0), 0);
  }, [allUsers]);

  if (authLoading || loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }
  
  if (!isUserAdmin) {
     return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
       <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary">Panel de Administración</h1>
            <p className="mt-2 text-lg text-muted-foreground">Gestiona la aplicación y los usuarios.</p>
       </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allUsers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Retos Activos</CardTitle>
              <BarChart4 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHabits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allUsers.filter(u => u.role === 'admin').length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Herramientas de Simulación</CardTitle>
            <CardDescription>Crea datos de prueba para verificar el funcionamiento de la aplicación.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
              <Dialog>
                <DialogTrigger asChild>
                    <Button><UserPlus className="mr-2 h-4 w-4" />Crear Usuario Ficticio</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Usuario Ficticio</DialogTitle>
                        <DialogDescription>Genera un nuevo usuario con datos de prueba personalizables.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCreateFakeUser)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Ej: Usuario de Prueba" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="completedHabits" render={({ field }) => (
                                <FormItem><FormLabel>Retos Completados (para Rango)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="hasActiveHabits" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none"><FormLabel>¿Añadir reto activo con racha?</FormLabel></div>
                                </FormItem>
                            )}/>
                            {form.watch('hasActiveHabits') && (
                               <FormField control={form.control} name="streakDays" render={({ field }) => (
                                    <FormItem><FormLabel>Días de Racha</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            )}
                            <DialogFooter>
                                <Button type="submit" disabled={seeding}>
                                    {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                    Crear Usuario
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="secondary" disabled={seeding}>
                      {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />}
                       Poblar Base de Datos (50)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>¿Generar 50 usuarios de prueba?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Esta acción creará 50 usuarios ficticios con sus perfiles públicos. Es útil para probar el ranking y la carga general de usuarios.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleSeedData}>
                              Sí, poblar datos
                          </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </CardContent>
        </Card>

       <Card>
            <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <div className="pt-4">
                    <Input 
                        placeholder="Buscar por nombre o correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Correo</TableHead>
                            <TableHead>Retos Activos</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((u) => (
                            <TableRow key={u.uid}>
                                <TableCell className="font-medium">{u.displayName}</TableCell>
                                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                <TableCell>{u.habits?.length || 0}</TableCell>
                                <TableCell>
                                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                                </TableCell>
                                <TableCell className="text-right flex items-center justify-end gap-2">
                                     <Button variant="outline" size="sm" onClick={() => handleOpenUserHabits(u)} disabled={!u.habits || u.habits.length === 0}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Select onValueChange={(newRole: 'user' | 'admin') => handleRoleChange(u.uid, newRole)} defaultValue={u.role}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Cambiar rol" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">Usuario</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
       </Card>

        {selectedUser && (
            <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Retos de {selectedUser.displayName}</DialogTitle>
                        <DialogDescription>
                            Aquí puedes ver y gestionar los retos del usuario.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-4">
                        <ScrollArea className="h-72">
                            <div className="space-y-4 pr-6">
                                {selectedUser.habits && selectedUser.habits.length > 0 ? (
                                    selectedUser.habits.map((habit: FirestoreHabit) => (
                                        <div key={habit.id} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div>
                                                <p className="font-semibold">{habit.name}</p>
                                                <p className="text-sm text-muted-foreground">{habit.category} - {habit.duration} días</p>
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. Se eliminará el reto "{habit.name}" para este usuario.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteHabit(habit.id)}>
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-10">Este usuario no tiene retos activos.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsHabitDialogOpen(false)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
    </div>
  );
}
