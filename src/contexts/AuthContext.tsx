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
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName?: string) => Promise<any>;
  createAccountOnly: (email: string, password: string, displayName?: string) => Promise<void>;
  checkEmailVerified: (email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<any>;
  loginWithVerificationCheck: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updateProfilePhoto: (file: File) => Promise<string>;
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

  // Login with verification check - returns user if verified, throws error if not
  async function loginWithVerificationCheck(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    if (!result.user.emailVerified) {
      // Sign out immediately if not verified
      await signOut(auth);
      throw new Error('EMAIL_NOT_VERIFIED');
    }
    
    return result;
  }

  // Check if email is verified without creating a persistent session (for verification page resend)
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

  // Basic login function (for backwards compatibility or special cases)
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

  // Reset password
  async function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  // Update display name
  async function updateDisplayName(displayName: string) {
    if (currentUser) {
      await updateProfile(currentUser, { displayName });
      // Trigger a re-render by updating the current user state
      setCurrentUser({ ...currentUser, displayName });
    } else {
      throw new Error('No user is currently signed in');
    }
  }

  // Update profile photo
  async function updateProfilePhoto(file: File): Promise<string> {
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      // Create a reference to the profile photo location
      const photoRef = ref(storage, `profile-photos/${currentUser.uid}/${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(photoRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update the user's profile with the new photo URL
      await updateProfile(currentUser, { photoURL: downloadURL });
      
      // Trigger a re-render by updating the current user state
      setCurrentUser({ ...currentUser, photoURL: downloadURL });
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
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
    loginWithVerificationCheck,
    loginWithGoogle,
    logout,
    sendVerificationEmail,
    resetPassword,
    updateDisplayName,
    updateProfilePhoto,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}