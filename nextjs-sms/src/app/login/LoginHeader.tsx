import Image from 'next/image';
import DarkModeToggle from '@/app/components/DarkModeToggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginHeader() {
  return (
    <header className="flex items-center justify-between p-4" style={{ backgroundColor: 'var(--color-bg)'}}>
      {/* Left Section: Logo and Title */}
      <div className="flex items-center space-x-4">
        <Image
          src="/twilio-logo.svg"
          alt="Twilio Logo"
          width={120}
          height={40}
          priority
        />
        <h1 className="font-bold text-2xl" style={{ color: 'var(--color-fg)'}}>
          SMS Demo
        </h1>
      </div>
      

      {/* Right Section: Dark Mode Toggle */}
      <div className="flex items-center space-x-4">
        <Link href="/login">
   
        </Link>
        <DarkModeToggle />
      </div>
    </header>
  );
}
