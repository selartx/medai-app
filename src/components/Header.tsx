import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-light-surface dark:bg-dark-surface shadow-md dark:shadow-lg-dark transition-colors duration-300">
      <nav className="container mx-auto py-4 px-6 flex items-center justify-between">
       <Link href="/index" className="flex items-center">
  <span className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
    MedAI
  </span>
</Link>

        <div className="flex items-center space-x-6">
          <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-accent transition-colors duration-300">
            Home
          </Link>
          <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-accent transition-colors duration-300">
            About
          </Link>
          <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-accent transition-colors duration-300">
            Log In
          </Link>
          <Link href="/signup" className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded">
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;