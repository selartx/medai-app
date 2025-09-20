import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to start page
  useEffect(() => {
    if (!authLoading && currentUser) {
      router.replace('/start');
    }
  }, [currentUser, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Don't render the landing page if user is authenticated (redirect is happening)
  if (currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }
  return (
    <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
      {/* Section 1: Welcome */}
      <section className="snap-start flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 text-pink-900">
        <h1 className="text-5xl font-bold mb-4">Welcome to MedAI</h1>
        <p className="text-xl text-center max-w-2xl">
          Your AI-powered companion with a touch of elegance and modern design.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/start"
            className="inline-flex items-center justify-center rounded-full font-semibold px-6 py-3 md:px-7 md:py-3.5 bg-pink-500 text-white shadow-sm hover:bg-pink-600 active:bg-pink-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink-500 disabled:opacity-60"
            role="button"
          >
            Let’s start
          </Link>
        </div>
      </section>

      {/* Section 2: What is MedAI? */}
      <section className="snap-start flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400 text-pink-900">
        <h2 className="text-4xl font-bold mb-4">What is MedAI?</h2>
        <p className="text-lg text-center max-w-3xl">
          MedAI is an intelligent assistant designed to help medical students with their studies. It provides resources, tools, and insights to enhance learning and understanding of medical concepts.
        </p>
      </section>

      {/* Section 3: How Does It Work? */}
      <section className="snap-start flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-300 via-pink-400 to-pink-500 text-pink-50">
        <h2 className="text-4xl font-bold mb-4">How Does It Work?</h2>
        <p className="text-lg text-center max-w-3xl">
          Using advanced AI algorithms, MedAI analyzes your queries and provides accurate, helpful responses. Whether you're studying anatomy, pathology, or pharmacology, MedAI is here to assist.
        </p>
      </section>

      {/* Section 4: Why Choose MedAI? */}
      <section className="snap-start flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 text-pink-50">
        <h2 className="text-4xl font-bold mb-4">Why Choose MedAI?</h2>
        <p className="text-lg text-center max-w-3xl">
          MedAI is tailored specifically for medical students, offering a user-friendly interface, reliable information, and a supportive learning environment.
        </p>
      </section>
    </div>
  );
};

export default Home;

