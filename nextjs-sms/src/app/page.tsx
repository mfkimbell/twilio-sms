'use client';

import Image from 'next/image';
import Link from 'next/link';
import LandingHeader from '@/app/components/LandingHeader';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dark text-light">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between flex-1 px-6 py-10">
        {/* Left Text */}
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-4xl font-bold">
            The Next Generation of Business Text Messaging
          </h1>
          <p className="text-lg">
            Build deeper customer relationships at scale with a messaging
            platform based on trust, quality, and engagement.
          </p>
          <div className="flex space-x-4 mt-4">
            <Link href="/login">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-[8px] cursor-pointer">
            Start for Free
          </Button>
            </Link>
            <a href="https://www.twilio.com/en-us">
            <Button
              
              variant="outline"
              className = "cursor-pointer bg-transparent rounded-[8px]"
              // style={{
              //   color: 'var(--color-primary)',
              //   borderColor: 'var(--color-primary)',
              // }}
            >
              Twilio Website
            </Button>
            </a>
          </div>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center mb-8 md:mb-0">
          <Image
            src="/landing-girl.png"
            alt="Landing Girl"
            width={600}
            height={600}
            priority
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 bg-secondary text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} SMS Demo. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4 ">
            <a href="#" className="hover:underline text-white">
              Terms
            </a>
            <a href="#" className="hover:underline text-white">
              Privacy
            </a>
            <a href="#" className="hover:underline text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
