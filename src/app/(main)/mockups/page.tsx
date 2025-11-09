
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { AIChatPanel } from "@/components/AIChatPanel";
import { HabitProgress } from "@/components/HabitProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RANKS } from "@/lib/constants";
import { ChatMessage, Habit } from "@/lib/types";
import { CheckCircle, Dumbbell, Star } from "lucide-react";
import { useState } from "react";

const mockHabit: Habit = {
  id: 'mock-habit-1',
  name: 'Leer 20 páginas al día',
  category: 'Crecimiento Personal',
  description: 'Leer al menos 20 páginas de un libro de no ficción para expandir conocimientos.',
  duration: 30,
  icon: Dumbbell,
  entries: [
    { date: '2024-07-20', completed: true, journal: 'Leí sobre arquitectura limpia. Muy interesante.' },
    { date: '2024-07-19', completed: true, journal: '' },
    { date: '2024-07-18', completed: false, journal: 'No tuve tiempo hoy.' },
    { date: '2024-07-17', completed: true, journal: 'Terminé el capítulo 3.' },
  ],
};

const mockChatHistory: ChatMessage[] = [
    { role: 'user', content: 'Quiero ser más saludable' },
    { 
        role: 'assistant', 
        content: '¡Claro! Aquí tienes un par de ideas para empezar:',
        suggestions: [
            { name: 'Caminata de 30 minutos', category: 'Salud', description: 'Realizar una caminata a paso ligero cada mañana.', duration: 21 },
            { name: 'Beber 2L de agua al día', category: 'Salud', description: 'Mantente hidratado durante todo el día para mejorar tu energía.', duration: 14 }
        ]
    }
];

export default function MockupsPage() {
    const { userDoc, loading: authLoading } = useAuth();
    const router = useRouter();
    const [habit, setHabit] = useState(mockHabit);

    const isUserAdmin = useMemo(() => userDoc?.data()?.role === 'admin', [userDoc]);

    useEffect(() => {
        if (!authLoading && !isUserAdmin) {
            router.push('/home');
        }
    }, [authLoading, isUserAdmin, router]);

    const handleUpdateEntry = (habitId: string, entryDate: string, newValues: Partial<any>) => {
        setHabit(prev => ({
            ...prev,
            entries: prev.entries.map(e => e.date === entryDate ? { ...e, ...newValues } : e)
        }));
    };

    if (authLoading || !isUserAdmin) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }
    
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Galería de Componentes (Mockups)</h1>
                <p className="mt-2 text-lg text-muted-foreground">Esta es una demostración visual de los componentes clave de Habitica.</p>
            </div>

            {/* Componente de Progreso de Hábito */}
            <Card>
                <CardHeader>
                    <CardTitle>Mockup: Tarjeta de Reto</CardTitle>
                    <CardDescription>Así es como los usuarios ven y gestionan cada uno de sus retos diarios.</CardDescription>
                </CardHeader>
                <CardContent>
                     <HabitProgress 
                        habit={habit}
                        onAddNewEntry={() => {}}
                        onUpdateEntry={handleUpdateEntry}
                        onDelete={() => {}}
                        isNewlyAdded={false}
                    />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Panel de Chat con IA */}
                <div className="lg:col-span-1">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Mockup: Coach IA</h2>
                    <AIChatPanel
                        chatHistory={mockChatHistory}
                        onSubmit={async (msg) => {
                            console.log(msg);
                            return { answer: "Esta es una respuesta simulada.", suggestions: [] };
                        }}
                        onAddHabit={() => {}}
                    />
                </div>

                {/* Sistema de Rangos */}
                <div className="lg:col-span-2 space-y-8">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Mockup: Sistema de Rangos</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {RANKS.slice(0, 4).map((rank, index) => {
                            const isCurrent = index === 1;
                            const isAchieved = index <= 1;
                            const Icon = rank.icon;

                            return (
                                <Card key={rank.name} className={`transition-all ${isCurrent ? 'border-primary ring-2 ring-primary shadow-lg' : ''} ${isAchieved ? 'bg-primary/5' : 'bg-card'}`}>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Icon className={`h-10 w-10 ${isAchieved ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <div>
                                                <CardTitle className="font-headline">{rank.name}</CardTitle>
                                                <CardDescription>{rank.description}</CardDescription>
                                            </div>
                                        </div>
                                        {isAchieved && <CheckCircle className="h-6 w-6 text-green-500" />}
                                    </CardHeader>
                                    <CardContent>
                                        <h4 className="font-semibold mb-2 text-sm">Requisitos:</h4>
                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                            {Object.entries(rank.requirements).map(([category, count]) => (
                                                <li key={category} className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2">
                                                        <Star className="h-4 w-4" />
                                                        Retos de "{category}": {count}
                                                    </span>
                                                    <span className={`font-mono px-2 py-0.5 rounded-full text-xs bg-muted`}>
                                                        0/{count}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </div>

             {/* Otros componentes de UI */}
            <Card>
                <CardHeader>
                    <CardTitle>Mockup: Elementos de UI Generales</CardTitle>
                    <CardDescription>Botones y otros elementos interactivos que definen la estética de la app.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                     <Button>Botón Primario</Button>
                     <Button variant="secondary">Botón Secundario</Button>
                     <Button variant="outline">Botón Outline</Button>
                     <Button variant="destructive">Botón Peligro</Button>
                     <Button variant="ghost">Botón Fantasma</Button>
                     <Button variant="link">Botón Link</Button>
                </CardContent>
            </Card>

        </div>
    );
}
