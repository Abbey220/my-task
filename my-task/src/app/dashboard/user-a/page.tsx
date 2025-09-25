'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockData } from '@/app/lib/mockData';
import { CompanyData, UploadedFile, User } from '@/app/types';

interface CompanyFormData {
  companyName: string;
  numberOfUsers: number;
  numberOfProducts: number;
  percentage: number;
}

export default function UserADashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: '',
    numberOfUsers: 0,
    numberOfProducts: 0,
    percentage: 0,
  });
  const [companyData, setCompanyData] = useState<CompanyData[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'data' | 'files'>('data');

  // Load user and data
  useEffect(() => {
    const currentUser = mockData.getCurrentUser();
    if (!currentUser || currentUser.role !== 'USER_A') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadData(currentUser.id);
  }, [router]);

  // Auto-calculate percentage
  useEffect(() => {
    const { numberOfUsers, numberOfProducts } = formData;
    if (numberOfUsers > 0 && numberOfProducts > 0) {
      const percentage = (numberOfUsers / numberOfProducts) * 100;
      setFormData(prev => ({ ...prev, percentage: Math.round(percentage * 100) / 100 }));
    } else {
      setFormData(prev => ({ ...prev, percentage: 0 }));
    }
  }, [formData.numberOfUsers, formData.numberOfProducts]);

  const loadData = (userId: string) => {
    const company = mockData.getUserCompanyData(userId);
    setCompanyData(company);

    const files = mockData.getAllFiles();
    setUploadedFiles(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('number') ? Math.max(0, parseInt(value) || 0) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    setTimeout(() => {
      try {
        mockData.saveCompanyData({
          ...formData,
          userId: user.id,
        });

        setMessage('✅ Data submitted successfully!');
        setFormData({
          companyName: '',
          numberOfUsers: 0,
          numberOfProducts: 0,
          percentage: 0,
        });

        loadData(user.id);
      } catch {
        setMessage('❌ Failed to submit data');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User A - Data Entry Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage company data and view uploaded files</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('data')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'data'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Data Entry
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'files'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Uploaded Files ({uploadedFiles.length})
        </button>
      </div>

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6">Enter Company Data</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  className="input"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Users *
                  </label>
                  <input
                    type="number"
                    name="numberOfUsers"
                    required
                    min={1}
                    className="input"
                    value={formData.numberOfUsers || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Products *
                  </label>
                  <input
                    type="number"
                    name="numberOfProducts"
                    required
                    min={1}
                    className="input"
                    value={formData.numberOfProducts || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentage (Auto-calculated)
                </label>
                <input
                  type="text"
                  readOnly
                  className="input bg-gray-50 font-mono font-bold text-blue-600"
                  value={`${formData.percentage}%`}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Formula: (Users ÷ Products) × 100
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.companyName}
                className="btn btn-primary w-full"
              >
                {loading ? 'Submitting...' : 'Submit Data'}
              </button>
            </form>

            {message && (
              <div
                className={`mt-4 p-3 rounded-lg ${
                  message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Recent Submissions */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6">Recent Submissions</h2>
            {companyData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>No data submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {companyData.slice(0, 5).map(data => (
                  <div key={data.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{data.companyName}</h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        {data.percentage}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <span>👥 {data.numberOfUsers} users</span>
                      <span>📦 {data.numberOfProducts} products</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(data.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6">Files Uploaded by User B</h2>
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📁</div>
              <p>No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {uploadedFiles.map(file => (
                <div
                  key={file.id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">📄</div>
                    <div>
                      <div className="font-semibold">{file.fileName}</div>
                      <div className="text-sm text-gray-600">
                        Size: {formatFileSize(file.fileSize)} • Uploaded by: {file.uploadedBy}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(file.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <a href={file.fileUrl} download className="btn btn-primary">
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
