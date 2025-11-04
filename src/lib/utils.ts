
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { subDays, format, isSameDay, parseISO } from 'date-fns';
import type { Habit, HabitEntry, ChatMessage } from './types';
import { BookOpen, Dumbbell, HeartPulse, TrendingUp } from 'lucide-react';
import { ACHIEVEMENTS } from "./achievements";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateStreak(entries: HabitEntry[]): { count: number, justIncreased: boolean } {
    if (!entries || entries.length === 0) {
        return { count: 0, justIncreased: false };
    }

    let streak = 0;
    let justIncreased = false;
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Filter out future entries and sort remaining ones by date descending
    const pastOrTodayEntries = entries
        .filter(e => parseISO(e.date) <= today)
        .sort((a, b) => b.date.localeCompare(a.date));

    // Find the most recent completed entry
    const lastCompletedEntry = pastOrTodayEntries.find(e => e.completed);

    if (!lastCompletedEntry) {
        return { count: 0, justIncreased: false };
    }

    const lastCompletionDate = parseISO(lastCompletedEntry.date);

    // Check if the last completed entry is today or yesterday
    const isToday = isSameDay(lastCompletionDate, today);
    const isYesterday = isSameDay(lastCompletionDate, subDays(today, 1));
    const lastEntryIsToday = isSameDay(parseISO(pastOrTodayEntries[0].date), today);


    if (!isToday && !isYesterday) {
        // Streak is broken
        return { count: 0, justIncreased: false };
    }

    // If we are here, there is a potential streak. Let's count it.
    let currentStreak = 0;
    let expectedDate = lastCompletionDate;

    for (const entry of pastOrTodayEntries) {
        const entryDate = parseISO(entry.date);
        if (isSameDay(entryDate, expectedDate)) {
            if (entry.completed) {
                currentStreak++;
                expectedDate = subDays(expectedDate, 1);
            } else {
                // Gap in completions, streak ends
                break;
            }
        }
        // If entry date does not match expected date, it means there is a gap.
        // We allow for gaps of non-completed days if they are not the current day.
    }
    
    // Check if the streak was just updated today
    if (isToday && lastCompletedEntry.completed && pastOrTodayEntries[1] && isSameDay(parseISO(pastOrTodayEntries[1].date), subDays(today, 1)) && pastOrTodayEntries[1].completed) {
        justIncreased = true;
    } else if (isToday && lastCompletedEntry.completed && currentStreak === 1) {
        // Special case for starting a new streak today after a break
        justIncreased = false;
    }


    return { count: currentStreak, justIncreased };
}


// Map stored habit IDs to Lucide icons
const ICONS: { [key: string]: React.ElementType } = {
  'habit-1': BookOpen,
  'habit-2': Dumbbell,
  'habit-3': HeartPulse,
};

export const getIconForHabit = (habitId: string) => {
  return ICONS[habitId] || TrendingUp;
};


export function calculateCompletedHabitsByCategory(habits: Habit[]): { [category: string]: number, total: number } {
  const counts: { [category: string]: number } = {};
  let total = 0;

  habits.forEach(habit => {
    const mainEntriesCount = habit.entries.filter(e => !e.isExtra).length;
    if (mainEntriesCount >= habit.duration) {
      // Habit challenge is completed
      counts[habit.category] = (counts[habit.category] || 0) + 1;
      total++;
    }
  });

  return { ...counts, total };
}

export function checkAndUnlockAchievements(
    habits: Habit[],
    chatHistory: ChatMessage[],
    existingAchievements: string[]
): { newlyUnlocked: string[], allUnlocked: string[] } {
  const newlyUnlocked: string[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    // Check if it's already unlocked
    if (!existingAchievements.includes(achievement.id)) {
      // If not, check if the condition is met now
      if (achievement.checker(habits, chatHistory)) {
        newlyUnlocked.push(achievement.id);
      }
    }
  });
  
  const allUnlocked = [...new Set([...existingAchievements, ...newlyUnlocked])];

  return { newlyUnlocked, allUnlocked };
}
