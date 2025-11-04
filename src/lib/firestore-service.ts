
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, limit, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import type { PublicProfile, FirestoreUser, FirestoreHabit } from '@/lib/types';
import { RANKS } from './constants';

const PUBLIC_PROFILES_COLLECTION = 'publicProfiles';
const USERS_COLLECTION = 'users';

/**
 * Creates or updates a user's public profile document.
 * @param userId The UID of the user.
 * @param profileData The public profile data to save.
 */
export async function updatePublicProfile(userId: string, profileData: PublicProfile): Promise<void> {
  const publicProfileRef = doc(db, PUBLIC_PROFILES_COLLECTION, userId);
  await setDoc(publicProfileRef, profileData);
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
 * [ADMIN] Seeds the leaderboard with 100 fake users.
 */
export async function seedLeaderboardData(): Promise<void> {
  const batch = writeBatch(db);
  const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Jamie', 'Morgan', 'Skyler', 'Peyton', 'Quinn'];

  for (let i = 0; i < 100; i++) {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const completedHabits = Math.floor(Math.random() * 50); // Random habits from 0 to 49
    
    // Determine rank based on completed habits
    let rankName = RANKS[0].name;
    for (const rank of RANKS) {
      // A simplified logic to assign ranks based on habits
      const totalRequirements = Object.values(rank.requirements).reduce((sum, val) => sum + val, 0);
      if (completedHabits >= totalRequirements * 2) { // just a sample logic
        rankName = rank.name;
      }
    }

    const fakeUser: PublicProfile = {
      uid: `fake-user-${Date.now()}-${i}`,
      displayName: `${randomName} ${i + 1}`,
      photoURL: `https://i.pravatar.cc/150?u=${i}`,
      rankName: rankName,
      completedHabits: completedHabits,
    };
    
    const docRef = doc(db, PUBLIC_PROFILES_COLLECTION, fakeUser.uid);
    batch.set(docRef, fakeUser);
  }

  await batch.commit();
}

    