'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockData } from '@/app/lib/mockData';

export default function UserBDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = mockData.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    if (currentUser.role !== 'USER_B') {
      // Redirect to appropriate dashboard based on role
      router.push(currentUser.role === 'USER_A' ? '/dashboard/user-a' : '/dashboard');
      return;
    }

    setUser(currentUser);
    loadFiles();
  }, [router]);

  const loadFiles = () => {
    if (!user) return;
    
    try {
      const files = mockData.getFilesForUser(user.id);
      setUploadedFiles(files || []);
    } catch (error) {
      console.error('Error loading files:', error);
      setUploadedFiles([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage('');

    if (file) {
      if (file.type !== 'image/png') {
        setMessage('❌ Please select a PNG file');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage('❌ User not found. Please login again.');
      return;
    }

    if (!selectedFile) {
      setMessage('❌ Please select a file first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // For demo purposes, we need to find a User A to upload files to
      // Let's create a mock User A ID or use a fixed one
      const userAId = 'demo-user-a-id'; // This would be dynamic in a real app
      
      mockData.uploadFile(selectedFile, userAId, user.id);

      setMessage('✅ File uploaded successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      loadFiles();
      
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('❌ Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestData = () => {
    if (!user) {
      setMessage('❌ User not found. Please login again.');
      return;
    }

    setMessage('');
    
    try {
      // For demo, get data from a mock User A
      const userAId = 'demo-user-a-id';
      const data = mockData.getLatestCompanyData(userAId);
      
      if (data) {
        setCompanyData(data);
        setMessage('✅ Data loaded successfully!');
      } else {
        setMessage('❌ No data available from User A');
        setCompanyData(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('❌ Error loading data');
      setCompanyData(null);
    }
  };

  // Show loading state while checking user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User B - File Upload Dashboard</h1>
          <p className="text-gray-600 mt-2">Upload files and view User A's data</p>
          <p className="text-sm text-gray-500 mt-1">Logged in as: {user.email}</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* File Upload Section */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">📁 Upload PNG File</h2>
            
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                  Select PNG Image
                </label>
                <input
                  type="file"
                  id="file"
                  accept=".png"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">Only PNG files are allowed</p>
              </div>

              {previewUrl && (
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full h-32 object-contain mx-auto rounded border"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Upload File'
                )}
              </button>
            </form>
          </div>

          {/* Uploaded Files */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">📂 Your Uploaded Files</h2>
            {uploadedFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📁</div>
                <p>No files uploaded yet</p>
                <p className="text-sm">Files you upload will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-medium text-sm">{file.fileName}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Size: {formatFileSize(file.fileSize)}
                        </p>
                      </div>
                    </div>
                    <a 
                      href={file.fileUrl} 
                      download
                      className="btn btn-primary text-sm px-3 py-1"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Data View Section */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">📊 User A's Latest Data</h2>
            
            <button
              onClick={fetchLatestData}
              className="btn btn-primary w-full mb-4"
            >
              Refresh Data
            </button>

            {companyData ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Company Name</p>
                  <p className="text-lg font-semibold">{companyData.companyName}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Percentage</p>
                    <p className="text-2xl font-bold text-green-700">{companyData.percentage}%</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Calculation</p>
                    <p className="text-sm">({companyData.numberOfUsers} users ÷ {companyData.numberOfProducts} products)</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">Number of Users</p>
                    <p className="text-xl font-semibold">{companyData.numberOfUsers}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">Number of Products</p>
                    <p className="text-xl font-semibold">{companyData.numberOfProducts}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Last Updated</p>
                  <p className="font-semibold">
                    {new Date(companyData.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📈</div>
                <p>No data available</p>
                <p className="text-sm">Click the button above to load User A's data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mt-6 p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center">
            <span className="text-lg mr-2">{message.includes('✅') ? '✅' : '❌'}</span>
            {message}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}