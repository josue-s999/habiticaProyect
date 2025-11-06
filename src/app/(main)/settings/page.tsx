'use client';
 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog';
import { Switch } from '@/components/ui/switch';
import { PublicProfile, Habit, FirestoreHabit } from '@/lib/types';
import {
  calculateCompletedHabitsByCategory,
  getIconForHabit,
} from '@/lib/utils';
import { RANKS } from '@/lib/constants';
import { Label } from '@/components/ui/label';
 
// --- Esquema de validación del formulario ---
const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: 'El nombre de usuario debe tener al menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Por favor ingresa un correo válido.',
  }),
});
 
export default function SettingsPage() {
  const { user, updateUserProfile, deleteUserAccount } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(
    null
  );
  const [isPublic, setIsPublic] = useState(false);
 
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });
 
  useEffect(() => {
    if (user) {
      setPublicProfile(user.publicProfile || null);
      setIsPublic(user.publicProfile?.visible || false);
    }
  }, [user]);
 
  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      await updateUserProfile(values);
      toast({
        title: 'Perfil actualizado',
        description: 'Tu información se guardó correctamente.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: 'Hubo un problema al guardar los cambios.',
      });
    } finally {
      setLoading(false);
    }
  };
 
  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount();
      toast({
        title: 'Cuenta eliminada',
        description: 'Tu cuenta ha sido eliminada permanentemente.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al eliminar la cuenta',
        description: 'Hubo un problema al eliminar tu cuenta.',
      });
    }
  };
 
  const rank = useMemo(() => {
    const completed = publicProfile?.stats?.completedHabits || 0;
    const rankKeys = Object.keys(RANKS);
    for (let i = rankKeys.length - 1; i >= 0; i--) {
      const key = rankKeys[i];
      if (completed >= RANKS[key].min) return key;
    }
    return 'beginner';
  }, [publicProfile]);
 
  return (
<div className="container mx-auto py-10">
<div className="grid gap-6 md:grid-cols-2">
        {/* ---- CARD PERFIL ---- */}
<Card>
<CardHeader>
<CardTitle>Perfil</CardTitle>
<CardDescription>
              Actualiza tu información de usuario.
</CardDescription>
</CardHeader>
<CardContent>
<Form {...form}>
<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
<FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
<FormItem>
<FormLabel>Nombre de usuario</FormLabel>
<FormControl>
<Input placeholder="Tu nombre de usuario" {...field} />
</FormControl>
<FormMessage />
</FormItem>
                  )}
                />
 
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
<FormItem>
<FormLabel>Correo electrónico</FormLabel>
<FormControl>
<Input
                          placeholder="correo@ejemplo.com"
                          {...field}
                          disabled
                        />
</FormControl>
<FormMessage />
</FormItem>
                  )}
                />
 
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar cambios
</Button>
</form>
</Form>
</CardContent>
</Card>
 
        {/* ---- CARD PERFIL PÚBLICO ---- */}
<Card>
<CardHeader>
<CardTitle>Perfil público</CardTitle>
<CardDescription>
              Configura la visibilidad de tu perfil.
</CardDescription>
</CardHeader>
<CardContent className="space-y-6">
<div className="flex items-center justify-between space-x-2">
<Label htmlFor="isPublic">Hacer perfil público</Label>
<Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
</div>
            {isPublic && publicProfile && (
<div className="rounded-md border p-4">
<p>
<strong>Usuario:</strong> {form.getValues('username')}
</p>
<p>
<strong>Rango:</strong> {RANKS[rank].label}
</p>
<p>
<strong>Hábitos completados:</strong>{' '}
                  {publicProfile.stats?.completedHabits || 0}
</p>
</div>
            )}
</CardContent>
</Card>
 
        {/* ---- CARD ELIMINAR CUENTA ---- */}
<Card className="md:col-span-2">
<CardHeader>
<CardTitle>Eliminar cuenta</CardTitle>
<CardDescription>
              Esta acción no se puede deshacer. Toda tu información será
              eliminada.
</CardDescription>
</CardHeader>
<CardFooter>
<DeleteAccountDialog onConfirm={handleDeleteAccount} />
</CardFooter>
</Card>
</div>
</div>
  );
} // ✅ ← ESTA llave cierra correctamente la función SettingsPage
