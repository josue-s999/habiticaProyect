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
import { Bell, BellOff, Loader2 } from 'lucide-react';
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
import { setNotificationPreference } from '@/hooks/use-notifications';
 
const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: 'El nombre de usuario debe tener al menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Por favor ingresa un correo válido.',
  }),
});
 
export default function SettingsPage() {
  const { user, userDoc, updateUserProfile, deleteUserAccount, updatePublicProfile, removePublicProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const isGoogleProvider = user?.providerData.some(p => p.providerId === 'google.com') ?? false;


  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  });

   useEffect(() => {
    if (userDoc) {
      const userData = userDoc.data();
      form.reset({
        username: userData?.displayName || '',
        email: userData?.email || '',
      });
      setIsPublic(userData?.isPublic || false);
    }
    // Set notification state from localStorage on mount
    if (typeof window !== 'undefined') {
        setNotificationsEnabled(localStorage.getItem('notificationsEnabled') === 'true');
    }
  }, [userDoc, form]);
 
  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    setLoading(true);
    try {
      if (values.username !== userDoc?.data()?.displayName) {
          await updateUserProfile(values.username);
      }
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
 
  const handleDeleteAccount = async (password?: string) => {
    try {
      await deleteUserAccount(password);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al eliminar la cuenta',
        description: error.message || 'Hubo un problema al eliminar tu cuenta.',
      });
    }
  };

  const handlePublicProfileToggle = async (isToggled: boolean) => {
    if (!userDoc?.exists()) return;
    setIsPublic(isToggled);
    
    const userData = userDoc.data();
    const userHabits: Habit[] = (userData?.habits || []).map((h: FirestoreHabit) => ({
      ...h,
      icon: getIconForHabit(h.id),
      entries: h.entries || [],
    }));
    const completedHabitsByCategory = calculateCompletedHabitsByCategory(userHabits);

    let currentRankName = RANKS[0].name;
    for (let i = RANKS.length - 1; i >= 0; i--) {
        const rank = RANKS[i];
        const requirementsMet = Object.entries(rank.requirements).every(([category, requiredCount]) => {
            return (completedHabitsByCategory[category] || 0) >= requiredCount;
        });
        if (requirementsMet) {
            currentRankName = rank.name;
            break;
        }
    }

    try {
        if (isToggled) {
            const profile: PublicProfile = {
                uid: userDoc.id,
                displayName: userData?.displayName,
                photoURL: user?.photoURL ?? `https://i.pravatar.cc/150?u=${userDoc.id}`,
                completedHabits: completedHabitsByCategory.total,
                rankName: currentRankName,
            };
            await updatePublicProfile(profile);
            toast({ title: 'Perfil Público Activado', description: 'Ahora aparecerás en el ranking.' });
        } else {
            await removePublicProfile();
            toast({ title: 'Perfil Público Desactivado', description: 'Ya no serás visible en el ranking.' });
        }
    } catch (error) {
        setIsPublic(!isToggled);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar la visibilidad del perfil.' });
    }
  };

  const handleNotificationToggle = async (enable: boolean) => {
    const success = await setNotificationPreference(enable);
    setNotificationsEnabled(enable && success);
    if (enable && success) {
        toast({ title: 'Notificaciones Activadas', description: 'Recibirás recordatorios para tus retos.'});
    } else if (enable && !success) {
        toast({ variant: 'destructive', title: 'Permiso Denegado', description: 'No se pudieron activar las notificaciones.'});
    } else {
        toast({ title: 'Notificaciones Desactivadas'});
    }
  };
 
  return (
<div className="container mx-auto py-10 max-w-4xl">
<div className="grid gap-6 md:grid-cols-2">
        {/* ---- CARD PERFIL ---- */}
<Card>
<CardHeader>
<CardTitle>Perfil de Usuario</CardTitle>
<CardDescription>
              Actualiza tu nombre de usuario visible.
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
 
        {/* ---- CARD CONFIGURACIÓN ---- */}
<div className="space-y-6">
    <Card>
        <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>
                Gestiona la configuración de tu cuenta.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="isPublic">Perfil Público</Label>
                    <p className="text-xs text-muted-foreground">
                        Permite que otros te vean en el ranking de la comunidad.
                    </p>
                </div>
                <Switch
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={handlePublicProfileToggle}
                />
            </div>
             <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="notifications">Notificaciones de Recordatorio</Label>
                    <p className="text-xs text-muted-foreground">
                       Recibe un recordatorio diario a las 7 PM si no has completado tus retos.
                    </p>
                </div>
                 <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={handleNotificationToggle}
                />
            </div>
        </CardContent>
    </Card>

    <Card className="border-destructive">
    <CardHeader>
    <CardTitle className='text-destructive'>Zona de Peligro</CardTitle>
    <CardDescription>
                La siguiente acción no se puede deshacer.
    </CardDescription>
    </CardHeader>
    <CardContent>
        <DeleteAccountDialog onDeleteAccount={handleDeleteAccount} isGoogleProvider={isGoogleProvider} />
    </CardContent>
    </Card>
</div>

</div>
</div>
  );
}
