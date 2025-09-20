import '../styles/globals.css';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import Header from '../components/Header';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isStart = router.pathname === '/start';

  const pageBg = isStart
    ? 'min-h-screen bg-white text-slate-900'
    : 'min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 text-pink-900';

  return (
    <AuthProvider>
      <div className={pageBg}>
        {!isStart && <Header isStart={isStart} />}
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

export default MyApp;
