'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setUser } from '@/redux/userSlice';
import { Button } from '@/components/ui/button';
import LoginHeader from '@/app/login/LoginHeader';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { UserState } from '@/redux/userSlice';


export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    console.log('[Login] Attempting login...');
  
    try {
      if (!db) {
        throw new Error('Firestore db is not initialized!');
      }
  
      const q = query(
        collection(db, 'users'),
        where('uid', '==', '1')
      );
  
      console.log('[Login] Running query:', q);
  
      const snapshot = await getDocs(q);
  
      if (snapshot.empty) {
        console.warn('[Login] No user found for given cell number.');
        alert('User not found!');
        return;
      }
  
      const userDoc = snapshot.docs[0];
      const user = userDoc.data() as UserState;
  
      console.log('[Login] User found:', user);
  
      dispatch(setUser(user));
      router.push('/dashboard');
    } catch (error) {
      console.error('[Login] Error fetching user from Firestore:', error);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginHeader />
      <div className="min-h-screen flex items-center justify-center bg-bg text-fg px-4">
        <div className="max-w-md w-full bg-secondary text-white p-8 rounded-xl shadow-lg space-y-6">
          <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
          <p className="text-center text-white/80">
            Click below to fetch and log in as Mitchell from Firestore.
          </p>
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-primary text-bg hover:opacity-90 rounded-lg py-3 text-md font-semibold"
          >
            {loading ? 'Logging in...' : 'Login as Mitchell'}
          </Button>
          <p className="text-sm text-center text-white/60">
            You will be redirected to your dashboard after login.
          </p>
        </div>
      </div>
    </>
  );
}
