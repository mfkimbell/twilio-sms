'use client';

import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setUser } from '@/redux/userSlice';
import { Button } from '@/components/ui/button';
import LoginHeader from '@/app/login/LoginHeader';


export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = () => {
    const mockUser = {
      uid: 1,
      role: 'admin',
      name: 'Mitchell',
      email: 'mfkimbell@gmail.com',
      cell: '+12053128982',
      img: 'https://media.licdn.com/dms/image/v2/D4E03AQFsP3S1WURMag/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1720643781530?e=1749081600&v=beta&t=YWfHHSJkwwuu1mzxiARXHOCo6jX8EBWUgO5eVNUhsAQ',
    };

    dispatch(setUser(mockUser));
    router.push('/dashboard');
  };

  return (
    <>
    <LoginHeader></LoginHeader> 
    <div className="min-h-screen flex items-center justify-center bg-bg text-fg px-4">
      
      <div className="max-w-md w-full bg-secondary text-white p-8 rounded-xl shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
        <p className="text-center text-white/80">
          This is a mock login screen. Click the button below to log in as Mitchell.
        </p>
        <Button
          onClick={handleLogin}
          className="w-full bg-primary text-bg hover:opacity-90 rounded-lg py-3 text-md font-semibold"
        >
          Login as Mitchell
        </Button>
        <p className="text-sm text-center text-white/60">
          You will be redirected to your dashboard after login.
        </p>
      </div>
    </div>
    </>
  );
}
