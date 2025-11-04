
import { 
    Flame, 
    Zap, 
    Target, 
    Crown, 
    BookOpen, 
    HeartPulse, 
    BrainCircuit, 
    Bot, 
    PlusSquare,
    Trophy,
    Feather,
    Sunrise
} from 'lucide-react';
import type { Achievement, Habit } from './types';
import { calculateStreak, calculateCompletedHabitsByCategory } from './utils';

export const ACHIEVEMENTS: Achievement[] = [
  // --- CONSISTENCY & STREAKS ---
  {
    id: 'first_step',
    name: 'Primer Paso',
    description: 'Completa tu primer día de cualquier reto.',
    icon: Sunrise,
    checker: (habits) => habits.some(h => h.entries.some(e => e.completed)),
  },
  {
    id: 'streak_3_days',
    name: '¡En Racha!',
    description: 'Mantén una racha de 3 días en cualquier reto.',
    icon: Flame,
    checker: (habits) => habits.some(h => calculateStreak(h.entries).count >= 3),
  },
  {
    id: 'streak_7_days',
    name: 'Semana Perfecta',
    description: 'Mantén una racha de 7 días en cualquier reto.',
    icon: Zap,
    checker: (habits) => habits.some(h => calculateStreak(h.entries).count >= 7),
  },
  {
    id: 'streak_21_days',
    name: 'Hábito Forjado',
    description: 'Mantén una racha de 21 días. ¡Esto ya es un hábito!',
    icon: Target,
    checker: (habits) => habits.some(h => calculateStreak(h.entries).count >= 21),
  },
  
  // --- HABIT COMPLETION ---
  {
    id: 'first_habit_completed',
    name: 'Reto Superado',
    description: 'Completa tu primer reto (alcanza la duración total).',
    icon: Trophy,
    checker: (habits) => calculateCompletedHabitsByCategory(habits).total >= 1,
  },
  {
    id: 'five_habits_completed',
    name: 'Coleccionista de Hábitos',
    description: 'Completa 5 retos en total.',
    icon: Crown,
    checker: (habits) => calculateCompletedHabitsByCategory(habits).total >= 5,
  },

  // --- CATEGORY SPECIALIZATION ---
  {
    id: 'health_adept',
    name: 'Cuerpo Activo',
    description: 'Completa 2 retos en la categoría "Salud".',
    icon: HeartPulse,
    checker: (habits) => (calculateCompletedHabitsByCategory(habits)['Salud'] || 0) >= 2,
  },
  {
    id: 'personal_growth_adept',
    name: 'Mente Curiosa',
    description: 'Completa 2 retos en la categoría "Crecimiento Personal".',
    icon: BookOpen,
    checker: (habits) => (calculateCompletedHabitsByCategory(habits)['Crecimiento Personal'] || 0) >= 2,
  },
  {
    id: 'wellness_adept',
    name: 'Paz Interior',
    description: 'Completa 2 retos en la categoría "Bienestar".',
    icon: Feather,
    checker: (habits) => (calculateCompletedHabitsByCategory(habits)['Bienestar'] || 0) >= 2,
  },
  
  // --- AI INTERACTION ---
  {
    id: 'ai_coach_consult',
    name: 'Buscando Guía',
    description: 'Pide tu primera sugerencia al Coach IA.',
    icon: Bot,
    checker: (habits, chatHistory) => (chatHistory || []).some(msg => msg.role === 'user'),
  },
  {
    id: 'ai_habit_added',
    name: 'Plan en Marcha',
    description: 'Añade un reto sugerido directamente por el Coach IA.',
    icon: PlusSquare,
    isSecret: true,
    checker: (habits, chatHistory) => {
        const suggestions = (chatHistory || []).flatMap(msg => msg.suggestions || []);
        return habits.some(habit => suggestions.some(suggestion => suggestion.name === habit.name && suggestion.category === habit.category));
    },
  },
];
