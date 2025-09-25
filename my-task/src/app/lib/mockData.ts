// @/app/lib/mockData.ts
import { User, CompanyData, UploadedFile } from '@/app/types';

export class MockDataService {
  private currentUser: User | null = null;
  private companyData: CompanyData[] = [];
  private uploadedFiles: UploadedFile[] = [];

  // =====================
  // User Management
  // =====================
  setUser(user: User): void {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;

    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const userData: User = JSON.parse(stored);
        if (userData.createdAt) userData.createdAt = new Date(userData.createdAt);
        this.currentUser = userData;
      } catch {
        return null;
      }
    }
    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  }

  // =====================
  // Company Data
  // =====================
  saveCompanyData(data: Omit<CompanyData, 'id' | 'createdAt'>): CompanyData {
    const newData: CompanyData = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
    };
    this.companyData.push(newData);
    this.saveToLocalStorage('companyData', this.companyData);
    return newData;
  }

  getUserCompanyData(userId: string): CompanyData[] {
    this.loadFromLocalStorage('companyData', this.companyData);
    return this.companyData
      .filter(d => d.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAllCompanyData(): CompanyData[] {
    this.loadFromLocalStorage('companyData', this.companyData);
    return [...this.companyData].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getLatestCompanyData(userId: string): CompanyData | null {
    const data = this.getUserCompanyData(userId);
    return data[0] || null;
  }

  // =====================
  // File Operations
  // =====================
  uploadFile(file: File, userId: string, uploadedBy: string): UploadedFile {
    const newFile: UploadedFile = {
      id: Math.random().toString(36).substring(2, 9),
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileSize: file.size,
      userId,
      uploadedBy,
      createdAt: new Date(),
    };
    this.uploadedFiles.push(newFile);
    this.saveToLocalStorage('uploadedFiles', this.uploadedFiles);
    return newFile;
  }

  getFilesForUser(userId: string): UploadedFile[] {
    this.loadFromLocalStorage('uploadedFiles', this.uploadedFiles);
    return this.uploadedFiles
      .filter(f => f.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getFilesByUploader(uploadedBy: string): UploadedFile[] {
    this.loadFromLocalStorage('uploadedFiles', this.uploadedFiles);
    return this.uploadedFiles
      .filter(f => f.uploadedBy === uploadedBy)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAllFiles(): UploadedFile[] {
    this.loadFromLocalStorage('uploadedFiles', this.uploadedFiles);
    return [...this.uploadedFiles].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // =====================
  // Statistics
  // =====================
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

  // =====================
  // Demo Data
  // =====================
  initializeDemoData(): void {
    if (!this.companyData.length) {
      this.saveCompanyData({
        companyName: 'Demo Company Inc.',
        numberOfUsers: 150,
        numberOfProducts: 25,
        percentage: 600,
        userId: 'demo-user-a-id',
      });
    }

    if (!this.uploadedFiles.length) {
      const demoFile: UploadedFile = {
        id: 'demo-file-1',
        fileName: 'sample-chart.png',
        fileUrl: '/images/sample-chart.png',
        fileSize: 1024576,
        userId: 'demo-user-a-id',
        uploadedBy: 'demo-user-b@email.com',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };
      this.uploadedFiles.push(demoFile);
      this.saveToLocalStorage('uploadedFiles', this.uploadedFiles);
    }
  }

  // =====================
  // Helpers
  // =====================
  private saveToLocalStorage<T>(key: string, data: T[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  private loadFromLocalStorage<T extends { createdAt: string | Date }>(key: string, targetArray: T[]): void
{
    if (targetArray.length) return;
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed: T[] = JSON.parse(stored);
      parsed.forEach(item => {
        item.createdAt = new Date(item.createdAt);
        targetArray.push(item);
      });
    }
  }

  clearAllData(): void {
    this.currentUser = null;
    this.companyData = [];
    this.uploadedFiles = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('companyData');
      localStorage.removeItem('uploadedFiles');
    }
  }
}

export const mockData = new MockDataService();

// Auto-initialize demo data
if (typeof window !== 'undefined') {
  setTimeout(() => mockData.initializeDemoData(), 500);
}
