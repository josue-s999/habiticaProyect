
import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';

// A daily entry for a habit challenge
export const HabitEntrySchema = z.object({
  date: z.string().describe('The date for the entry in YYYY-MM-DD format.'),
  completed: z.boolean().describe('Whether the habit was completed on this date.'),
  journal: z.string().optional().describe('A user-written journal entry for the day.'),
  isExtra: z.boolean().optional().describe('True if this is an extra entry for a given day.'),
});
export type HabitEntry = z.infer<typeof HabitEntrySchema>;

export type Habit = {
  id: string;
  name: string;
  category: string;
  description: string; // Detailed description of the habit/challenge
  icon: LucideIcon; // This is for client-side display only
  duration: number; // Duration of the challenge in days
  entries: HabitEntry[]; // Record of daily progress
};

// This is the shape of the habit data stored in Firestore
export type FirestoreHabit = Omit<Habit, 'icon'>;

export type Rank = {
  name: string;
  icon: LucideIcon;
  description: string;
  requirements: {
    [category: string]: number;
  };
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isSecret?: boolean; // Secret achievements are hidden until unlocked
  checker: (habits: Habit[], chatHistory?: ChatMessage[]) => boolean;
};

// Schema for AI chat suggestions for detailed habits/challenges
export const HabitSuggestionSchema = z.object({
    name: z.string().describe('The name of the suggested habit challenge.'),
    category: z.string().describe('The category for the habit (e.g., Health, Productivity, Creativity).'),
    description: z.string().describe("A detailed description of the habit and why it's beneficial."),
    duration: z.number().describe('The suggested duration for the challenge in days (e.g., 7, 21, 30).'),
});

// Schema for a single chat message
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  suggestions: z.array(HabitSuggestionSchema).optional().describe('Actionable habit suggestions, if any.'),
});

// Type for a single chat message
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Input schema for the chat flow
export const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

// Output schema for the chat flow
export const ChatOutputSchema = z.object({
  answer: z.string().describe('The AI coach\'s response.'),
  suggestions: z.array(HabitSuggestionSchema).optional().describe('A list of actionable habit challenges suggested by the AI.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export interface FirestoreUser {
  uid: string;
  displayName: string;
  email: string | null;
  theme: 'light' | 'dark';
  xp: number;
  habits: FirestoreHabit[];
  role: 'user' | 'admin';
  gender?: string;
  isPublic?: boolean;
  unlockedAchievements?: string[];
}

export interface PublicProfile {
    uid: string;
    displayName: string;
    photoURL: string | null;
    rankName: string;
    completedHabits: number;
}
