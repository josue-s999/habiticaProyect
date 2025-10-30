
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getAllUsers, updateUserRole } from '@/lib/firestore-service';
import { FirestoreUser } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ShieldCheck, BarChart4 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function AdminPage() {
  const { user, userDoc, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const isUserAdmin = useMemo(() => userDoc?.data()?.role === 'admin', [userDoc]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (userDoc && !isUserAdmin) {
        router.push('/home'); // Redirect non-admins
      } else if(userDoc && isUserAdmin) {
        // Fetch admin data
        const fetchAllUsers = async () => {
          setLoading(true);
          try {
            const users = await getAllUsers();
            setAllUsers(users);
          } catch (error) {
            console.error("Error fetching users:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los usuarios.' });
          } finally {
            setLoading(false);
          }
        };
        fetchAllUsers();
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

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;
    return allUsers.filter(u => 
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);
  
  const totalHabits = useMemo(() => {
      return allUsers.reduce((acc, user) => acc + (user.habits?.length || 0), 0);
  }, [allUsers]);

  if (authLoading || loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }
  
  if (!isUserAdmin) {
    // This is a fallback for the brief moment before redirection
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
              <p className="text-xs text-muted-foreground">Usuarios registrados en la plataforma.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Retos</CardTitle>
              <BarChart4 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHabits}</div>
              <p className="text-xs text-muted-foreground">Retos activos creados por los usuarios.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allUsers.filter(u => u.role === 'admin').length}</div>
              <p className="text-xs text-muted-foreground">Usuarios con permisos de administrador.</p>
            </CardContent>
          </Card>
        </div>

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
                <div className="overflow-x-auto">
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
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.habits?.length || 0}</TableCell>
                                <TableCell>
                                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
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
                </div>
            </CardContent>
       </Card>
    </div>
  );
}
