// src/components/UserMock.tsx
'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/userSlice';

export default function UserMock() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Simulated API response with user data
    const fakeUser = { 
        uid: 1,
        role: 'admin',
        name: 'Mitchell', 
        email: 'mfkimbell@gmail.com',
        cell: '+12053128982',
        img: 'https://media.licdn.com/dms/image/v2/D4E03AQFsP3S1WURMag/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1720643781530?e=1749081600&v=beta&t=YWfHHSJkwwuu1mzxiARXHOCo6jX8EBWUgO5eVNUhsAQ'

     };
    dispatch(setUser(fakeUser));
  }, [dispatch]);

  return null;
}
