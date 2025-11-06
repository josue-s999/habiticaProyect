
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, limit, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import type { PublicProfile, FirestoreUser, FirestoreHabit, HabitEntry } from '@/lib/types';
import { RANKS } from './constants';
import { addDays, format, subDays } from 'date-fns';

const PUBLIC_PROFILES_COLLECTION = 'publicProfiles';
const USERS_COLLECTION = 'users';

/**
 * Creates or updates a user's public profile document.
 * @param userId The UID of the user.
 * @param profileData The public profile data to save.
 */
export async function updatePublicProfile(userId: string, profileData: PublicProfile): Promise<void> {
  const publicProfileRef = doc(db, PUBLIC_PROFILES_COLLECTION, userId);
  await setDoc(publicProfileRef, profileData, { merge: true });
}

/**
 * Removes a user's public profile document.
 * @param userId The UID of the user.
 */
export async function removePublicProfile(userId: string): Promise<void> {
  const publicProfileRef = doc(db, PUBLIC_PROFILES_COLLECTION, userId);
  await deleteDoc(publicProfileRef);
}

/**
 * Fetches the top users for the leaderboard.
 * Users are sorted by completed habits count in descending order.
 * @returns A promise that resolves to an array of public profiles.
 */
export async function getLeaderboardUsers(): Promise<PublicProfile[]> {
  const q = query(
    collection(db, PUBLIC_PROFILES_COLLECTION),
    orderBy('completedHabits', 'desc'),
    limit(50) // Limit to top 50 users for performance
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as PublicProfile);
}

/**
 * [ADMIN] Fetches all users from the users collection.
 * @returns A promise that resolves to an array of all users.
 */
export async function getAllUsers(): Promise<FirestoreUser[]> {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map(doc => doc.data() as FirestoreUser);
}

/**
 * [ADMIN] Updates the role of a specific user.
 * @param uid The UID of the user to update.
 * @param newRole The new role to assign ('user' or 'admin').
 */
export async function updateUserRole(uid: string, newRole: 'user' | 'admin'): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, { role: newRole });
}

/**
 * [ADMIN] Deletes a specific habit for a given user.
 * @param uid The UID of the user whose habit is to be deleted.
 * @param habitId The ID of the habit to delete.
 */
export async function deleteHabitForUser(uid: string, habitId: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDocSnap = await getDoc(userRef);

    if (!userDocSnap.exists()) {
        throw new Error("User not found");
    }

    const userData = userDocSnap.data() as FirestoreUser;
    const updatedHabits = userData.habits.filter((habit: FirestoreHabit) => habit.id !== habitId);
    await updateDoc(userRef, { habits: updatedHabits });
}

/**
 * [ADMIN] Generates a specified number of fake users and their public profiles for testing.
 * @param count The number of fake users to create.
 */
export async function seedUsersAndProfiles(count: number = 50): Promise<void> {
  const batch = writeBatch(db);
  const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Jamie', 'Morgan', 'Skyler', 'Peyton', 'Quinn'];

  for (let i = 0; i < count; i++) {
    const randomName = `${names[Math.floor(Math.random() * names.length)]} #${i + 1}`;
    const uid = `fake-user-${Date.now()}-${i}`;
    const completedHabitsCount = Math.floor(Math.random() * 25);
    
    // Determine rank
    let rankName = RANKS[0].name;
    for (const rank of RANKS) {
        const totalRequirements = Object.values(rank.requirements).reduce((sum, count) => sum + count, 0);
        if (completedHabitsCount >= totalRequirements) {
            rankName = rank.name;
        }
    }
    
    // Create Firestore User
    const fakeUser: FirestoreUser = {
      uid,
      displayName: randomName,
      email: `${uid}@example.com`,
      theme: 'light',
      xp: 0,
      habits: [], // Seeded users start with no habits for simplicity
      role: 'user',
      isPublic: true,
      unlockedAchievements: [],
    };
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    batch.set(userDocRef, fakeUser);
    
    // Create Public Profile
    const publicProfile: PublicProfile = {
      uid,
      displayName: randomName,
      photoURL: `https://i.pravatar.cc/150?u=${uid}`,
      rankName: rankName,
      completedHabits: completedHabitsCount,
    };
    const publicProfileRef = doc(db, PUBLIC_PROFILES_COLLECTION, uid);
    batch.set(publicProfileRef, publicProfile);
  }

  await batch.commit();
}


/**
 * [ADMIN] Creates a single fake user with specified test data.
 */
export async function createFakeUser({
  name,
  completedHabits,
  hasActiveHabits,
  streakDays,
}: {
  name: string;
  completedHabits: number;
  hasActiveHabits: boolean;
  streakDays: number;
}): Promise<void> {
  const batch = writeBatch(db);
  const uid = `fake-user-manual-${Date.now()}`;

  // --- 1. Create Firestore User ---
  const habits: FirestoreHabit[] = [];
  if (hasActiveHabits) {
    const entries: HabitEntry[] = [];
    // Create a fake streak
    if (streakDays > 0) {
      for (let i = 0; i < streakDays; i++) {
        entries.push({
          date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
          completed: true,
          journal: `Entrada del día de racha #${streakDays - i}`,
        });
      }
    }
    habits.push({
      id: `habit-${uid}-1`,
      name: 'Reto de Prueba (Racha)',
      category: 'Crecimiento Personal',
      description: 'Reto de prueba generado por admin.',
      duration: 30,
      entries: entries.reverse(), // Ensure entries are in chronological order
    });
  }

  const fakeUser: FirestoreUser = {
    uid,
    displayName: name,
    email: `${uid}@example.com`,
    theme: 'light',
    xp: 0,
    habits: habits,
    role: 'user',
    isPublic: true,
    unlockedAchievements: [],
  };
  const userDocRef = doc(db, USERS_COLLECTION, uid);
  batch.set(userDocRef, fakeUser);

  // --- 2. Create Public Profile ---
    let rankName = RANKS[0].name;
    for (const rank of RANKS) {
        const totalRequirements = Object.values(rank.requirements).reduce((sum, count) => sum + count, 0);
        if (completedHabits >= totalRequirements) {
            rankName = rank.name;
        }
    }

  const publicProfile: PublicProfile = {
    uid,
    displayName: name,
    photoURL: `https://i.pravatar.cc/150?u=${uid}`,
    rankName,
    completedHabits,
  };
  const publicProfileRef = doc(db, PUBLIC_PROFILES_COLLECTION, uid);
  batch.set(publicProfileRef, publicProfile);
  
  await batch.commit();
}
