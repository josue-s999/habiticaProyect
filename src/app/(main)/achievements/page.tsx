
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Award, Lock } from 'lucide-react';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Habit, FirestoreHabit, ChatMessage } from '@/lib/types';
import { getIconForHabit } from '@/lib/utils';
import { ACHIEVEMENTS } from '@/lib/achievements';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function AchievementsPage() {
  const { userDoc, loading } = useAuth();

  const unlockedAchievementIds: string[] = useMemo(() => {
    if (!userDoc?.exists()) return [];
    return userDoc.data()?.unlockedAchievements || [];
  }, [userDoc]);

  const userHabits: Habit[] = useMemo(() => {
    if (!userDoc?.exists()) return [];
    const userData = userDoc.data();
    return (userData?.habits || []).map((h: FirestoreHabit) => ({
      ...h,
      icon: getIconForHabit(h.id),
      entries: h.entries || [],
    }));
  }, [userDoc]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }
  
  const unlockedCount = unlockedAchievementIds.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary">Mis Logros</h1>
            <p className="mt-2 text-lg text-muted-foreground">Colecciona insignias y celebra tus hitos.</p>
            <p className="mt-2 font-semibold">Has desbloqueado {unlockedCount} de {totalCount} logros.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = unlockedAchievementIds.includes(achievement.id);
                const Icon = achievement.icon;
                const isHidden = achievement.isSecret && !isUnlocked;

                return (
                    <TooltipProvider key={achievement.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                            <Card className={`transition-all ${isUnlocked ? 'border-secondary ring-2 ring-secondary shadow-lg' : ''} ${isHidden ? 'bg-muted/50' : 'bg-card'}`}>
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                {isHidden ? (
                                    <>
                                        <Lock className="h-12 w-12 text-muted-foreground mb-4"/>
                                        <h3 className="font-semibold text-lg text-muted-foreground">Logro Secreto</h3>
                                    </>
                                ) : (
                                    <>
                                        <Icon className={`h-12 w-12 mb-4 ${isUnlocked ? 'text-secondary' : 'text-muted-foreground'}`} />
                                        <h3 className={`font-semibold text-lg ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{achievement.name}</h3>
                                    </>
                                )}
                                </CardContent>
                            </Card>
                        </TooltipTrigger>
                        {!isHidden && (
                             <TooltipContent>
                                <p>{achievement.description}</p>
                            </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                )
            })}
        </div>
    </div>
  );
}
