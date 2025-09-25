import { User, CompanyData, UploadedFile } from '@/app/types';

class MockDataService {
  private currentUser: User | null = null;
  private companyData: CompanyData[] = [];
  private uploadedFiles: UploadedFile[] = [];

  // User management
  setUser(user: User) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        // Convert string dates back to Date objects
        if (userData.createdAt) {
          userData.createdAt = new Date(userData.createdAt);
        }
        this.currentUser = userData;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    // Don't clear companyData and uploadedFiles to persist data
  }

  // Company Data operations
  saveCompanyData(data: Omit<CompanyData, 'id' | 'createdAt'>): CompanyData {
    const newData: CompanyData = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    
    this.companyData.push(newData);
    this.saveToLocalStorage('companyData', this.companyData);
    return newData;
  }

  getLatestCompanyData(userId: string): CompanyData | null {
    this.loadFromLocalStorage('companyData', this.companyData);
    
    const userData = this.companyData
      .filter(data => data.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return userData[0] || null;
  }

  getUserCompanyData(userId: string): CompanyData[] {
    this.loadFromLocalStorage('companyData', this.companyData);
    
    return this.companyData
      .filter(data => data.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllCompanyData(): CompanyData[] {
    this.loadFromLocalStorage('companyData', this.companyData);
    return this.companyData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // File operations
  uploadFile(file: File, userId: string, uploadedBy: string): UploadedFile {
    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileSize: file.size,
      userId: userId,
      uploadedBy: uploadedBy,
      createdAt: new Date(),
    };
    
    this.uploadedFiles.push(newFile);
    this.saveToLocalStorage('uploadedFiles', this.uploadedFiles);
    return newFile;
  }

  getFilesForUser(userId: string): UploadedFile[] {
    this.loadFromLocalStorage('uploadedFiles', this.uploadedFiles);
    
    return this.uploadedFiles
      .filter(file => file.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getFilesByUploader(uploadedBy: string): UploadedFile[] {
    this.loadFromLocalStorage('uploadedFiles', this.uploadedFiles);
    
    return this.uploadedFiles
      .filter(file => file.uploadedBy === uploadedBy)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllFiles(): UploadedFile[] {
    this.loadFromLocalStorage('uploadedFiles', this.uploadedFiles);
    return this.uploadedFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Demo data initialization (optional - for testing)
  initializeDemoData() {
    // Create demo User A data if none exists
    if (this.companyData.length === 0) {
      const demoData: Omit<CompanyData, 'id' | 'createdAt'> = {
        companyName: 'Demo Company Inc.',
        numberOfUsers: 150,
        numberOfProducts: 25,
        percentage: 600, // (150/25)*100 = 600%
        userId: 'demo-user-a-id',
      };
      this.saveCompanyData(demoData);
    }

    // Create demo files if none exist
    if (this.uploadedFiles.length === 0) {
      // We can't create actual files, but we can create demo file entries
      const demoFile: UploadedFile = {
        id: 'demo-file-1',
        fileName: 'sample-chart.png',
        fileUrl: '/images/sample-chart.png', // This won't work, but it's just for demo
        fileSize: 1024576, // 1MB
        userId: 'demo-user-a-id',
        uploadedBy: 'demo-user-b@email.com',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      };
      this.uploadedFiles.push(demoFile);
      this.saveToLocalStorage('uploadedFiles', this.uploadedFiles);
    }
  }

  // Helper methods for localStorage
  private saveToLocalStorage(key: string, data: any[]) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  }

  private loadFromLocalStorage(key: string, targetArray: any[]) {
    if (targetArray.length > 0) return; // Already loaded
    
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsedData = JSON.parse(stored);
        
        // Convert string dates back to Date objects
        const dataWithDates = parsedData.map((item: any) => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        }));
        
        targetArray.length = 0; // Clear array
        targetArray.push(...dataWithDates); // Add parsed data
      }
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error);
    }
  }

  // Utility method to clear all data (for testing)
  clearAllData() {
    this.currentUser = null;
    this.companyData = [];
    this.uploadedFiles = [];
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('companyData');
    localStorage.removeItem('uploadedFiles');
  }

  // Get statistics for dashboard
  getStats(userId: string) {
    const userData = this.getUserCompanyData(userId);
    const userFiles = this.getFilesByUploader(userId);
    
    return {
      dataEntries: userData.length,
      filesUploaded: userFiles.length,
      latestData: userData[0] || null,
      latestFile: userFiles[0] || null,
    };
  }
}

export const mockData = new MockDataService();

// Initialize demo data when the module loads (optional)
if (typeof window !== 'undefined') {
  // Wait a bit to ensure localStorage is available
  setTimeout(() => {
    mockData.initializeDemoData();
  }, 1000);
}