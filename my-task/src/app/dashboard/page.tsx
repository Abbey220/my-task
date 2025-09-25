'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockData } from '@/app/lib/mockData';

// Define the User type
type User = {
  id: string;
  email: string;
  role: 'USER_A' | 'USER_B'; // strict roles
};

type Stats = {
  dataEntries: number;
  filesUploaded: number;
};

export default function DashboardHome() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    dataEntries: 0,
    filesUploaded: 0,
  });

  const router = useRouter();

  useEffect(() => {
    const currentUser = mockData.getCurrentUser() as User | null;
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Calculate stats after setting user
    const companyData = mockData.getUserCompanyData(currentUser.id);
    const files =
      currentUser.role === 'USER_A'
        ? mockData.getAllFiles()
        : mockData.getFilesForUser(currentUser.id);

    setStats({
      dataEntries: companyData.length,
      filesUploaded: files.length,
    });
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Welcome Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back, {user.email}!
        </h1>
        <p className="text-xl text-gray-600">
          You are logged in as{' '}
          <span className="font-semibold text-blue-600">{user.role}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card text-center">
          <div className="text-4xl text-blue-600 mb-4">📊</div>
          <h3 className="text-2xl font-semibold mb-2">Data Entries</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.dataEntries}</p>
          <p className="text-gray-600 mt-2">Total company data submissions</p>
        </div>

        <div className="card text-center">
          <div className="text-4xl text-green-600 mb-4">📁</div>
          <h3 className="text-2xl font-semibold mb-2">Files Uploaded</h3>
          <p className="text-4xl font-bold text-green-600">{stats.filesUploaded}</p>
          <p className="text-gray-600 mt-2">Total files shared</p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* User A Card */}
        <div
          className={`card cursor-pointer transition-transform hover:scale-105 ${
            user.role === 'USER_A' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
          }`}
          onClick={() => router.push('/dashboard/user-a')}
        >
          <div className="flex items-center mb-4">
            <div className="text-3xl mr-4">👨‍💼</div>
            <div>
              <h3 className="text-xl font-semibold">User A Dashboard</h3>
              <p className="text-gray-600">Enter and manage company data</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Enter company information</li>
            <li>Track users and products</li>
            <li>View automatic percentage calculations</li>
            <li>Monitor uploaded files from User B</li>
          </ul>
          <button className="btn btn-primary w-full mt-4">Go to User A Dashboard</button>
        </div>

        {/* User B Card */}
        <div
          className={`card cursor-pointer transition-transform hover:scale-105 ${
            user.role === 'USER_B' ? 'border-green-300 bg-green-50' : 'border-gray-200'
          }`}
          onClick={() => router.push('/dashboard/user-b')}
        >
          <div className="flex items-center mb-4">
            <div className="text-3xl mr-4">👩‍💻</div>
            <div>
              <h3 className="text-xl font-semibold">User B Dashboard</h3>
              <p className="text-gray-600">Upload files and view data</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Upload PNG files to User A</li>
            <li>View latest company data</li>
            <li>Manage file uploads</li>
            <li>Track data changes</li>
          </ul>
          <button className="btn btn-primary w-full mt-4">Go to User B Dashboard</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <button
            onClick={() =>
              router.push(user.role === 'USER_A' ? '/dashboard/user-a' : '/dashboard/user-b')
            }
            className="btn btn-primary"
          >
            Go to My Dashboard
          </button>
          <button
            onClick={() => {
              mockData.logout();
              router.push('/login');
            }}
            className="btn btn-secondary"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
