import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from './firebase';
import { mockData } from './mockData';
import { User } from '@/app/types';

type Role = 'USER_A' | 'USER_B';

export class AuthService {
  // =====================
  // Sign Up
  // =====================
  static async signUp(email: string, password: string, role: Role): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser: FirebaseUser = userCredential.user;

      if (!firebaseUser.email) throw new Error('User email is null');

      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        role,
        createdAt: new Date(),
      };

      AuthService.saveUserToStorage(userData);
      return userData;
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error('Failed to sign up');
    }
  }

  // =====================
  // Sign In
  // =====================
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser: FirebaseUser = userCredential.user;

      if (!firebaseUser.email) throw new Error('User email is null');

      // Initialize storage if empty
      const storedUsers: User[] = JSON.parse(localStorage.getItem('allUsers') || '[]');

      const existingUser = storedUsers.find(u => u.email === firebaseUser.email);

      if (!existingUser) {
        throw new Error('User not found. Please sign up first.');
      }

      mockData.setUser(existingUser);
      return existingUser;
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error('Failed to sign in');
    }
  }

  // =====================
  // Logout
  // =====================
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
      mockData.logout();
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error('Failed to log out');
    }
  }

  // =====================
  // Helpers
  // =====================
  private static saveUserToStorage(user: User) {
    const storedUsers: User[] = JSON.parse(localStorage.getItem('allUsers') || '[]');

    // Avoid duplicates
    const exists = storedUsers.some(u => u.email === user.email);
    if (!exists) {
      storedUsers.push(user);
      localStorage.setItem('allUsers', JSON.stringify(storedUsers));
    }

    mockData.setUser(user);
  }
}
