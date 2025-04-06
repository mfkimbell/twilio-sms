'use client';

import { useEffect, useState } from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';

export default function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false); 

  // On mount, check localStorage and apply the theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    const initialTheme = savedTheme || 'dark';
    const isDark = initialTheme === 'dark';

    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark); // ← Tailwind-friendly
    document.documentElement.setAttribute('data-theme', initialTheme);

    if (!savedTheme) {
      localStorage.setItem('theme', initialTheme);
    }
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setIsDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked); // ← Tailwind-friendly
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <DarkModeSwitch
      checked={isDarkMode}
      onChange={toggleDarkMode}
      size={24}
      sunColor="orange"
      moonColor="gray"
    />
  );
}
