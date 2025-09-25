'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockData } from '@/app/lib/mockData';

// ✅ Define the User type based on what mockData provides
type User = {
  id: string;
  email: string;
  role: 'USER_A' | 'USER_B';
  createdAt?: Date;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // ✅ Ensure code only runs in browser to avoid hydration errors
  useEffect(() => {
    setMounted(true);
    const currentUser = mockData.getCurrentUser() as User | null;
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  if (!mounted) return null; // Don't render until mounted
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div
              className="flex-shrink-0 text-2xl font-bold text-blue-600 cursor-pointer"
              onClick={() => router.push('/')}
            >
              DataShare
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6">
              <button
                className="text-gray-700 hover:text-blue-600 text-base font-medium"
                onClick={() => router.push('/dashboard/user-a')}
              >
                User A
              </button>
              <button
                className="text-gray-700 hover:text-green-600 text-base font-medium"
                onClick={() => router.push('/dashboard/user-b')}
              >
                User B
              </button>
              <button
                className="text-gray-700 hover:text-red-600 text-base font-medium"
                onClick={() => {
                  mockData.logout();
                  router.push('/login');
                }}
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-700 text-4xl font-extrabold focus:outline-none"
              >
                {menuOpen ? '✖️' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2 bg-white shadow-inner">
            <button
              className="block w-full text-left text-gray-700 hover:text-blue-600 text-lg font-semibold"
              onClick={() => router.push('/dashboard/user-a')}
            >
              User A
            </button>
            <button
              className="block w-full text-left text-gray-700 hover:text-green-600 text-lg font-semibold"
              onClick={() => router.push('/dashboard/user-b')}
            >
              User B
            </button>
            <button
              className="block w-full text-left text-gray-700 hover:text-red-600 text-lg font-semibold"
              onClick={() => {
                mockData.logout();
                router.push('/login');
              }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
