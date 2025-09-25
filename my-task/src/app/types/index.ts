export interface User {
  id: string;
  email: string;
  role: 'USER_A' | 'USER_B';
  createdAt: Date;
}

export interface CompanyData {
  id: string;
  companyName: string;
  numberOfUsers: number;
  numberOfProducts: number;
  percentage: number;
  userId: string;
  createdAt: Date;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  userId: string;        // Who the file is for (User A)
  uploadedBy: string;    // Who uploaded it (User B's ID)
  uploadedByName?: string; // Who uploaded it (User B's name/email - optional)
  createdAt: Date;
}