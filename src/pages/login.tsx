import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const { currentUser, loading: authLoading, login, loginWithGoogle, logout, checkEmailVerified, loginWithVerificationCheck, resetPassword } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to start page
  useEffect(() => {
    if (!authLoading && currentUser) {
      router.replace('/start');
    }
  }, [currentUser, authLoading, router]);

  // Check for verification success message
  useEffect(() => {
    if (router.query.verified === 'true') {
      setSuccessMessage('Email successfully verified! You can now log in to your account.');
    } else if (router.query.error === 'verification-failed') {
      setError('Email verification failed. The link may be expired or invalid.');
    }
  }, [router.query]);

  // Email validation regex
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate form before submitting
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Login with verification check - throws EMAIL_NOT_VERIFIED if not verified
      await loginWithVerificationCheck(email, password);
      router.push('/start'); // Redirect to chat after login
    } catch (error: any) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email address before logging in. Check your inbox for the verification link.');
      } else {
        setError('Failed to log in: ' + error.message);
      }
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      const result = await loginWithGoogle();
      
      // Google accounts are usually verified, but let's check to be safe
      if (result.user && !result.user.emailVerified) {
        await logout();
        setError('Please verify your email address before logging in.');
        setLoading(false);
        return;
      }
      
      router.push('/start'); // Redirect to chat after login
    } catch (error: any) {
      setError('Failed to log in with Google: ' + error.message);
    }

    setLoading(false);
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate email before sending reset
    if (!validateEmail(resetEmail)) {
      setResetMessage('Please enter a valid email address');
      return;
    }
    
    try {
      setResetMessage('');
      setResetLoading(true);
      await resetPassword(resetEmail);
      setResetMessage('Password reset email sent! Check your inbox for instructions.');
      setResetEmail('');
      // Keep modal open to show success message
    } catch (error: any) {
      setResetMessage('Failed to send reset email: ' + error.message);
    }
    
    setResetLoading(false);
  }

  function openResetModal() {
    setShowResetModal(true);
    setResetEmail(email); // Pre-fill with current email if entered
    setResetMessage('');
  }

  function closeResetModal() {
    setShowResetModal(false);
    setResetEmail('');
    setResetMessage('');
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Don't render login page if user is authenticated (redirect is happening)
  if (currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Log In to MedAI</h2>
        
        {successMessage && (
          <div className="p-3 text-green-700 bg-green-100 border border-green-300 rounded">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="p-3 text-red-700 bg-red-100 border border-red-300 rounded">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={openResetModal}
                className="text-sm text-pink-600 hover:text-pink-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-md shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'Sign in with Google'}
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-pink-600 hover:text-pink-500">
              Sign up
            </Link>
          </span>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
                <button
                  onClick={closeResetModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {resetMessage && (
                <div className={`p-3 mb-4 rounded ${resetMessage.includes('sent') 
                  ? 'text-green-700 bg-green-100 border border-green-300' 
                  : 'text-red-700 bg-red-100 border border-red-300'}`}>
                  {resetMessage}
                </div>
              )}

              <form onSubmit={handlePasswordReset}>
                <div className="mb-4">
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your email address and we'll send you a link to reset your password.
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeResetModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-md hover:bg-pink-700 disabled:opacity-50"
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Email'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
