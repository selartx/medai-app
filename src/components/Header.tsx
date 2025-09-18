import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  isStart: boolean;
}

const Header: React.FC<HeaderProps> = ({ isStart }) => {
  const router = useRouter();
  const { currentUser, logout, sendVerificationEmail } = useAuth();

  const headerClass = (isStart
    ? 'bg-purple-100 border-b border-purple-200'
    : 'bg-pink-200 border-b border-pink-300')
    + ' flex justify-between items-center px-6 py-4 shadow-md relative z-50';

  const loginBtnClass = isStart
    ? 'bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition'
    : 'bg-pink-400 text-white font-semibold py-2 px-4 rounded-lg hover:bg-pink-500 transition';

  const signupBtnClass = isStart
    ? 'bg-white text-purple-700 font-semibold py-2 px-4 rounded-lg border border-purple-400 hover:bg-purple-50 transition'
    : 'bg-white text-pink-500 font-semibold py-2 px-4 rounded-lg border border-pink-400 hover:bg-pink-100 transition';

  const logoutBtnClass = isStart
    ? 'bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition'
    : 'bg-red-400 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-500 transition';

  const userTextClass = isStart
    ? 'text-purple-800 font-medium'
    : 'text-pink-900 font-medium';

  async function handleLogout() {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  function handleLoginClick() {
    router.push('/login');
  }

  function handleSignupClick() {
    router.push('/signup');
  }

  async function handleResendVerification() {
    try {
      await sendVerificationEmail();
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Failed to send verification email:', error);
      alert('Failed to send verification email. Please try again.');
    }
  }

  return (
    <header className={headerClass}>
      <Link href="/" legacyBehavior>
        <a className={isStart ? 'text-2xl font-bold text-purple-800' : 'text-2xl font-bold text-pink-900'}>
          MedAI
        </a>
      </Link>

      <div className="flex items-center space-x-4">
        {currentUser ? (
          // Logged in user
          <>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className={userTextClass}>
                  Welcome, {currentUser.displayName || currentUser.email?.split('@')[0]}!
                </span>
                {!currentUser.emailVerified && (
                  <div className="text-xs text-orange-600">
                    Email not verified
                    <button 
                      onClick={handleResendVerification}
                      className="ml-2 text-orange-700 hover:text-orange-800 underline"
                    >
                      Resend
                    </button>
                  </div>
                )}
              </div>
              {currentUser.photoURL && (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              )}
            </div>
            <button 
              className={logoutBtnClass} 
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          // Not logged in
          <>
            <button className={loginBtnClass} onClick={handleLoginClick}>
              Log In
            </button>
            <button className={signupBtnClass} onClick={handleSignupClick}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;