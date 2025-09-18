import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../lib/firebase';
import { applyActionCode, checkActionCode } from 'firebase/auth';

export default function AuthAction() {
  const router = useRouter();

  useEffect(() => {
    const handleEmailVerification = async () => {
      const { mode, oobCode } = router.query;

      if (mode === 'verifyEmail' && oobCode) {
        try {
          // Verify the email
          await applyActionCode(auth, oobCode as string);
          
          // Redirect to login with success message
          router.push('/login?verified=true');
        } catch (error) {
          console.error('Error verifying email:', error);
          // Redirect to login with error
          router.push('/login?error=verification-failed');
        }
      } else {
        // Invalid or missing parameters
        router.push('/login');
      }
    };

    if (router.isReady) {
      handleEmailVerification();
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your email...</p>
      </div>
    </div>
  );
}