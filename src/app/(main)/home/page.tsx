
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast"
import type { Habit, FirestoreHabit, ChatMessage, ChatOutput, HabitEntry } from '@/lib/types';
import { chat } from '@/ai/flows/chat-flow';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { format, startOfDay, isSameDay, parseISO } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp } from 'lucide-react';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { AIChatPanel } from '@/components/AIChatPanel';
import { HabitProgress } from '@/components/HabitProgress';
import { Loader2 } from 'lucide-react';
import { getIconForHabit, checkAndUnlockAchievements } from '@/lib/utils';
import { ACHIEVEMENTS } from '@/lib/achievements';


export default function HomePage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { toast } = useToast();
  const { user, userDoc, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [newlyAddedHabitId, setNewlyAddedHabitId] = useState<string | null>(null);

  
  const userRef = useMemo(() => user ? doc(db, "users", user.uid) : null, [user]);

  const loadUserData = useCallback(async () => {
    if (!userDoc) {
        setIsDataLoaded(true);
        return;
    }

    if (userDoc.exists()) {
        try {
            const userData = userDoc.data();
            const loadedHabits = (userData.habits || []).map((habit: FirestoreHabit) => ({
                ...habit,
                entries: habit.entries || [],
                icon: getIconForHabit(habit.id),
            }));
            setHabits(loadedHabits);
            
            // Check for new achievements on load
            const { newlyUnlocked } = checkAndUnlockAchievements(loadedHabits, chatHistory, userData.unlockedAchievements || []);
            if (newlyUnlocked.length > 0) {
                const updatedAchievements = [...(userData.unlockedAchievements || []), ...newlyUnlocked];
                if(userRef) {
                  await updateDoc(userRef, { unlockedAchievements: updatedAchievements });
                }
                newlyUnlocked.forEach(achievementId => {
                    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
                    if (achievement) {
                        toast({
                            title: "🏆 ¡Logro Desbloqueado!",
                            description: achievement.name,
                        });
                    }
                });
            }

        } catch (error) {
            console.error("Error processing user data:", error);
            setHabits([]);
        }
    } else {
        setHabits([]);
    }
    setIsDataLoaded(true);
}, [userDoc, userRef, chatHistory, toast]);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && !isDataLoaded) { // Simplified condition
      loadUserData();
    } else if (!user && !authLoading) {
      setIsDataLoaded(true); // Handle case for logged out users
    }
  }, [user, authLoading, router, isDataLoaded, loadUserData]);


 const saveData = useCallback(async (updatedHabits: Habit[], updatedChatHistory: ChatMessage[], xpGained = 0) => {
    if (!userRef || !userDoc) return;
    try {
        const currentUserData = userDoc.data() || {};
        const existingAchievements = currentUserData.unlockedAchievements || [];

        const { newlyUnlocked, allUnlocked } = checkAndUnlockAchievements(updatedHabits, updatedChatHistory, existingAchievements);

        const dataToSave: any = {
            habits: updatedHabits.map(({ icon, ...rest }) => rest),
        };

        const currentXp = currentUserData.xp || 0;
        if (xpGained > 0) {
            dataToSave.xp = currentXp + xpGained;
        }

        if (newlyUnlocked.length > 0) {
            dataToSave.unlockedAchievements = allUnlocked;
            newlyUnlocked.forEach(achievementId => {
                const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
                if (achievement) {
                    toast({
                        title: "🏆 ¡Logro Desbloqueado!",
                        description: achievement.name,
                    });
                }
            });
        }

        await setDoc(userRef, dataToSave, { merge: true });

    } catch (error) {
        console.error("Error saving data:", error);
        toast({
            variant: "destructive",
            title: "Error de guardado",
            description: "No se pudo guardar tu progreso.",
        });
    }
}, [userRef, userDoc, toast]);


  const handleUpdateEntry = (habitId: string, entryDate: string, newValues: Partial<HabitEntry>) => {
    let xpChange = 0;
    const updatedHabits = habits.map(h => {
        if (h.id === habitId) {
            const oldEntry = h.entries.find(e => e.date === entryDate);
            const oldCompleted = oldEntry?.completed;

            const updatedEntries = h.entries.map(e => e.date === entryDate ? { ...e, ...newValues } : e);
            const newCompleted = updatedEntries.find(e => e.date === entryDate)?.completed;

            if (newCompleted && !oldCompleted && !oldEntry?.isExtra) {
                xpChange = 1;
            }
            return { ...h, entries: updatedEntries };
        }
        return h;
    });

    setHabits(updatedHabits);
    saveData(updatedHabits, chatHistory, xpChange);
  };
  
  const handleAddNewEntry = (habitId: string) => {
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
  
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        let newEntries = [...h.entries];
        const mainEntries = newEntries.filter(e => !e.isExtra);
        const lastMainEntry = mainEntries.length > 0 ? mainEntries.sort((a, b) => b.date.localeCompare(a.date))[0] : null;

        let newEntry: HabitEntry;
        if (!lastMainEntry || !isSameDay(parseISO(lastMainEntry.date), parseISO(todayStr))) {
          newEntry = { date: todayStr, completed: false, journal: '', isExtra: false };
          toast({ title: `¡Nuevo día, nuevo reto!`, description: 'Has registrado tu avance para hoy.' });
        } else {
          newEntry = { date: todayStr, completed: false, journal: '', isExtra: true };
          toast({ title: '¡Imparable!', description: 'Has añadido una entrada extra para hoy.' });
        }
        newEntries.push(newEntry);
        return { ...h, entries: newEntries };
      }
      return h;
    });
  
    setHabits(updatedHabits);
    saveData(updatedHabits, chatHistory);
  };

  const handleAddHabit = (name: string, category: string, description: string, duration: number) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name,
      category,
      description,
      duration,
      icon: TrendingUp,
      entries: [],
    };
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    saveData(updatedHabits, chatHistory);
    setNewlyAddedHabitId(newHabit.id);
    toast({
      title: "Reto añadido",
      description: `¡Empezaste el reto "${name}"!`,
    })
  };

  const handleDeleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    setHabits(updatedHabits);
    saveData(updatedHabits, chatHistory);
    toast({
      title: "Reto eliminado",
      description: "El reto ha sido eliminado de tu lista.",
    });
  };
  
  const handleChatSubmit = async (message: string): Promise<ChatOutput> => {
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(newHistory);
    
    try {
      const result = await chat({
        history: newHistory,
      });

      const assistantMessage: ChatMessage = { role: 'assistant', content: result.answer, suggestions: result.suggestions };
      const finalHistory = [...newHistory, assistantMessage];
      setChatHistory(finalHistory);
      
      // Save data after chat to check for chat-related achievements
      saveData(habits, finalHistory);
      
      return result;
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errMessage: ChatMessage = { role: 'assistant', content: "Lo siento, tuve un problema. Inténtalo de nuevo." };
      setChatHistory([...newHistory, errMessage]);
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "No se pudo obtener respuesta del coach.",
      });
      throw error; // Re-throw to be caught by the caller if needed
    }
  };


  if (authLoading || !isDataLoaded) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline">Mis Retos</CardTitle>
            <AddHabitDialog onAddHabit={handleAddHabit}>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Reto
                </Button>
            </AddHabitDialog>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {habits.length > 0 ? habits.map(habit => (
                <HabitProgress 
                    key={habit.id} 
                    habit={habit} 
                    onAddNewEntry={handleAddNewEntry}
                    onUpdateEntry={handleUpdateEntry}
                    onDelete={handleDeleteHabit}
                    isNewlyAdded={habit.id === newlyAddedHabitId}
                />
                )) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Aún no tienes retos.</p>
                    <p>¡Añade uno y empieza a ganar XP!</p>
                </div>
                )}
            </div>
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <AIChatPanel 
            chatHistory={chatHistory}
            onSubmit={handleChatSubmit}
            onAddHabit={handleAddHabit}
        />
      </div>
    </div>
  );
}
