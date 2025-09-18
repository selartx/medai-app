import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Link from 'next/link';

export default function VerifyEmail() {
  const router = useRouter();
  const { email } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email address not found. Please try signing up again.');
      return;
    }

    if (!showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }

    if (!password) {
      setError('Please enter your password to resend verification email.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Temporarily sign in the user to send verification email
      const userCredential = await signInWithEmailAndPassword(auth, email as string, password);
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Sign them out immediately
      await signOut(auth);
      
      setSuccess('Verification email sent successfully! Please check your inbox.');
      setPassword('');
      setShowPasswordInput(false);
      
    } catch (error: any) {
      setError('Failed to resend verification email. Please check your password and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification link to{' '}
            {email && (
              <span className="font-medium text-pink-600">{email}</span>
            )}
            {!email && 'your email address'}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.63a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Verification Email Sent
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Please check your email and click the verification link to activate your account. 
                Once verified, you can return to the login page to access your account.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div className="space-y-3">
              {!showPasswordInput ? (
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                >
                  Resend Verification Email
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Enter your password to resend verification email
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                      placeholder="Password"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleResendVerification}
                      disabled={loading}
                      className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Email'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordInput(false);
                        setPassword('');
                        setError('');
                      }}
                      className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Go to Login
              </Link>
            </div>

            <div className="text-xs text-gray-500">
              <p>Didn't receive the email? Check your spam folder.</p>
              <p className="mt-1">
                Still having trouble? Use the resend button above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}