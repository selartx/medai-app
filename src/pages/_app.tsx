import '../styles/globals.css';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isStart = router.pathname === '/start';

  const pageBg = isStart
    ? 'min-h-screen bg-gradient-to-b from-violet-50 via-purple-50 to-purple-100 text-slate-900'
    : 'min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 text-pink-900';

  const headerClass = isStart
    ? 'flex justify-between items-center px-6 py-4 bg-purple-100 shadow-md border-b border-purple-200'
    : 'flex justify-between items-center px-6 py-4 bg-pink-200 shadow-md border-b border-pink-300';

  const loginBtnClass = isStart
    ? 'bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition'
    : 'bg-pink-400 text-white font-semibold py-2 px-4 rounded-lg hover:bg-pink-500 transition';

  const signupBtnClass = isStart
    ? 'bg-white text-purple-700 font-semibold py-2 px-4 rounded-lg border border-purple-400 hover:bg-purple-50 transition'
    : 'bg-white text-pink-500 font-semibold py-2 px-4 rounded-lg border border-pink-400 hover:bg-pink-100 transition';

  return (
    <div className={pageBg}>
      <header className={headerClass}>
        <h1 className={isStart ? 'text-2xl font-bold text-purple-800' : 'text-2xl font-bold text-pink-900'}>
          MedAI
        </h1>
        <div className="flex space-x-4">
          <button
            className={loginBtnClass}
            onClick={() => router.push('/login')}
          >
            Log In
          </button>
          <button
            className={signupBtnClass}
            onClick={() => router.push('/signup')}
          >
            Sign Up
          </button>
        </div>
      </header>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
