import '../styles/globals.css';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/Header';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isStart = router.pathname === '/start';

  const pageBg = isStart
    ? 'min-h-screen bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 transition-colors'
    : 'min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 text-pink-900 dark:text-gray-100 transition-colors';

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className={pageBg}>
          {!isStart && <Header isStart={isStart} />}
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp;
