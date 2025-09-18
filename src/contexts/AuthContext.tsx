// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName?: string) => Promise<any>;
  createAccountOnly: (email: string, password: string, displayName?: string) => Promise<void>;
  checkEmailVerified: (email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  async function signup(email: string, password: string, displayName?: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    
    // Send email verification for email/password signups
    if (result.user) {
      await sendEmailVerification(result.user);
    }
    
    return result;
  }

  // Create account without signing in (for verification flow)
  async function createAccountOnly(email: string, password: string, displayName?: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    
    // Send email verification
    if (result.user) {
      await sendEmailVerification(result.user);
    }
    
    // Immediately sign out so user must verify before logging in
    await signOut(auth);
  }

  // Check if email is verified without creating a persistent session
  async function checkEmailVerified(email: string, password: string): Promise<boolean> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const isVerified = result.user.emailVerified;
      
      // Immediately sign out to not create a session
      await signOut(auth);
      
      return isVerified;
    } catch (error) {
      throw error; // Re-throw login errors (wrong password, etc.)
    }
  }

  // Login with email and password
  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Login with Google
  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  // Send email verification
  async function sendVerificationEmail() {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    } else {
      throw new Error('No user is currently signed in');
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    createAccountOnly,
    checkEmailVerified,
    login,
    loginWithGoogle,
    logout,
    sendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}