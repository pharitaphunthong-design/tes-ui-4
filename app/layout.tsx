import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Navbar'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MockAPI Management System',
  description: 'Users and Books CRUD Management with Next.js & Tailwind CSS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${inter.className} bg-slate-50 text-slate-800 min-h-screen flex`}>
        <Sidebar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-8 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}