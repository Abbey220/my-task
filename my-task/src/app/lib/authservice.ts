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

      mockData.setUser(userData);
      return userData;
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error('Failed to sign up');
    }
  }

  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser: FirebaseUser = userCredential.user;

      if (!firebaseUser.email) throw new Error('User email is null');

      let userData = mockData.getCurrentUser();
      if (!userData) {
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          role: 'USER_A',
          createdAt: new Date(),
        };
        mockData.setUser(userData);
      }

      return userData;
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error('Failed to sign in');
    }
  }

  static async logout(): Promise<void> {
    try {
      await signOut(auth);
      mockData.logout();
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error('Failed to log out');
    }
  }
}
