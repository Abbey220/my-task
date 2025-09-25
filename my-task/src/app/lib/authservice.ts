import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { auth } from './firebase';
import { mockData } from './mockData';

export class AuthService {
  static async signUp(email: string, password: string, role: 'USER_A' | 'USER_B') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user in our mock data
      const userData = {
        id: user.uid,
        email: user.email!,
        role: role,
        createdAt: new Date(),
      };
      
      mockData.setUser(userData);
      return userData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // For demo purposes, we'll create a user if they don't exist in our mock data
      // In a real app, you'd fetch this from Firestore
      let userData = mockData.getCurrentUser();
      
      if (!userData) {
        userData = {
          id: user.uid,
          email: user.email!,
          role: 'USER_A', // Default role
          createdAt: new Date(),
        };
        mockData.setUser(userData);
      }
      
      return userData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async logout() {
    try {
      await signOut(auth);
      mockData.logout();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}