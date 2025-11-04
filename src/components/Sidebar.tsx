
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Home, LogOut, MessageCircle, Trophy, Settings, BarChart, Users, Image, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { RANKS } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from './icons';
import { SheetHeader, SheetTitle } from './ui/sheet';
import { Habit, FirestoreHabit } from '@/lib/types';
import { calculateCompletedHabitsByCategory, getIconForHabit } from '@/lib/utils';
import { cn } from '@/lib/utils';


export function SidebarHeader() {
    return (
        <SheetHeader className="p-4 pb-4 border-b text-left">
            <SheetTitle>
                <div className="flex items-center gap-2">
                    <Logo className="size-8 text-primary" />
                    <span className="text-xl font-bold text-primary">Habitica</span>
                </div>
            </SheetTitle>
        </SheetHeader>
    )
}

const navItems = [
    { href: '/home', label: 'Inicio', icon: Home },
    { href: '/ranks', label: 'Rangos', icon: Trophy },
    { href: '/leaderboard', label: 'Ranking', icon: Users },
    { href: '/reports', label: 'Reportes', icon: BarChart },
    { href: '/mockups', label: 'Mockups', icon: Image },
];

const adminNavItems = [
    { href: '/admin', label: 'Admin', icon: ShieldCheck },
]

const bottomNavItems = [
    { href: '/settings', label: 'Configuración', icon: Settings },
]

export function SidebarNavContent() {
  const pathname = usePathname();
  const { user, signOut, userDoc } = useAuth();
  const displayName = userDoc?.data()?.displayName || user?.displayName || 'Usuario';
  const isUserAdmin = userDoc?.data()?.role === 'admin';
  
  const userHabits: Habit[] = useMemo(() => {
    if (!userDoc?.exists()) return [];
    const userData = userDoc.data();
    return (userData?.habits || []).map((h: FirestoreHabit) => ({
      ...h,
      icon: getIconForHabit(h.id),
      entries: h.entries || [],
    }));
  }, [userDoc]);

  const completedHabitsByCategory = useMemo(() => calculateCompletedHabitsByCategory(userHabits), [userHabits]);

  const currentRank = useMemo(() => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      const rank = RANKS[i];
      const requirementsMet = Object.entries(rank.requirements).every(([category, requiredCount]) => {
        const userCount = completedHabitsByCategory[category] || 0;
        return userCount >= requiredCount;
      });
      if (requirementsMet) {
        return rank;
      }
    }
    return RANKS[0];
  }, [completedHabitsByCategory]);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
        <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => {
                 const isActive = pathname.startsWith(item.href);
                 return (
                     <Link key={item.href} href={item.href}>
                        <Button variant={isActive ? 'secondary' : 'ghost'} className={cn("w-full justify-start", { "bg-primary/15 text-primary hover:bg-primary/20": isActive })}>
                            <item.icon className="size-4 mr-2" />
                            <span>{item.label}</span>
                        </Button>
                     </Link>
                 );
            })}
             <a href="https://chat.whatsapp.com/BHhcW7kOWKxApJOyu9nyNm" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="w-full justify-start">
                    <MessageCircle className="size-4 mr-2" />
                    <span>Comunidad WhatsApp</span>
                </Button>
             </a>
        </nav>

        {isUserAdmin && (
             <div className="px-4">
                <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Admin
                </h3>
                <nav className="flex flex-col gap-2">
                    {adminNavItems.map((item) => {
                         const isActive = pathname.startsWith(item.href);
                         return (
                            <Link key={item.href} href={item.href}>
                                <Button variant={isActive ? 'secondary' : 'ghost'} className={cn("w-full justify-start", { "bg-primary/15 text-primary hover:bg-primary/20": isActive })}>
                                    <item.icon className="size-4 mr-2" />
                                    <span>{item.label}</span>
                                </Button>
                            </Link>
                         );
                    })}
                </nav>
             </div>
        )}

        <div className="mt-auto flex flex-col gap-2 border-t p-4">
            {user && (
                <>
                    <div className="flex items-center gap-2 rounded-md p-2">
                        <Avatar className="size-8">
                            {user.photoURL && <AvatarImage src={user.photoURL} alt={displayName} />}
                            <AvatarFallback>{displayName?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-sm">
                            <span className="font-semibold">{displayName}</span>
                            <span className="text-xs text-muted-foreground">{currentRank.name}</span>
                        </div>
                    </div>

                    {bottomNavItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button variant={isActive ? 'secondary' : 'ghost'} className={cn("w-full justify-start", { "bg-primary/15 text-primary hover:bg-primary/20": isActive })}>
                                    <item.icon className="size-4 mr-2" />
                                    <span>{item.label}</span>
                                </Button>
                            </Link>
                        );
                    })}

                     <Button variant="ghost" size="sm" onClick={signOut} className="justify-start">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </>
            )}
        </div>
    </div>
  );
}
