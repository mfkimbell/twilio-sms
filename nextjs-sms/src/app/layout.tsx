// src/app/layout.tsx
import './globals.css';
import { Providers } from '@/app/providers';




export const metadata = {
  title: 'SMS Demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
