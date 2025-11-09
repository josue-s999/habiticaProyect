
'use client';

import { useEffect } from 'react';
import { useAuth } from './use-auth';
import { Habit } from '@/lib/types';
import { isSameDay, parseISO } from 'date-fns';

// Store timeout IDs to prevent scheduling multiple notifications
const notificationTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Schedules daily reminders for all active habits that haven't been completed today.
 * @param habits The user's list of habits.
 */
function scheduleDailyReminders(habits: Habit[]) {
  // Clear any previously scheduled reminders to avoid duplicates
  clearAllReminders();

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  habits.forEach((habit) => {
    // Check if the habit has already been completed today
    const hasCompletedToday = habit.entries.some(
      (entry) => isSameDay(parseISO(entry.date), today) && entry.completed
    );

    if (hasCompletedToday) {
      return; // Don't schedule a reminder if already completed
    }

    // Schedule a reminder for 7 PM today
    const reminderTime = new Date();
    reminderTime.setHours(19, 0, 0, 0); // 7:00 PM

    // If it's already past 7 PM, don't schedule for today
    if (now > reminderTime) {
      return;
    }

    const delay = reminderTime.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      new Notification('¡No te olvides de tu reto!', {
        body: `Aún no has completado: "${habit.name}". ¡Tú puedes!`,
        icon: '/logo.png', // Ensure you have a logo.png in your /public folder
        tag: `habit-reminder-${habit.id}`,
      });
      notificationTimeouts.delete(habit.id); // Clean up after showing
    }, delay);

    notificationTimeouts.set(habit.id, timeoutId);
  });
}

/**
 * Clears all scheduled notification timeouts.
 */
function clearAllReminders() {
  notificationTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  notificationTimeouts.clear();
}


/**
 * Main hook to manage notification logic based on user settings.
 */
export function useNotifications() {
  const { userDoc, loading } = useAuth();

  useEffect(() => {
    // This effect should only run on the client side
    if (typeof window === 'undefined' || loading || !userDoc) {
      return;
    }
    
    // Listen for changes in localStorage to enable/disable notifications
    const handleStorageChange = () => {
        const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
        const habits: Habit[] = userDoc.data()?.habits || [];

        if (notificationsEnabled && Notification.permission === 'granted') {
            scheduleDailyReminders(habits);
        } else {
            clearAllReminders();
        }
    };
    
    // Initial setup
    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);

    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearAllReminders();
    };

  }, [userDoc, loading]);
}

/**
 * A helper function to request notification permission and update settings.
 * This should be called from a user interaction (e.g., a button click).
 * @param enable - Whether to enable or disable notifications.
 */
export async function setNotificationPreference(enable: boolean): Promise<boolean> {
  if (enable) {
    if (!('Notification' in window)) {
      alert('Este navegador no soporta notificaciones de escritorio.');
      return false;
    }

    if (Notification.permission === 'granted') {
      localStorage.setItem('notificationsEnabled', 'true');
      window.dispatchEvent(new Event('storage')); // Trigger update
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem('notificationsEnabled', 'true');
        window.dispatchEvent(new Event('storage')); // Trigger update
        return true;
      }
    }
    // If permission is denied or dismissed, reflect that.
    localStorage.setItem('notificationsEnabled', 'false');
    window.dispatchEvent(new Event('storage'));
    return false;
  } else {
    // User is disabling notifications
    localStorage.setItem('notificationsEnabled', 'false');
    window.dispatchEvent(new Event('storage')); // Trigger update to clear reminders
    return true;
  }
}
