import type { Timestamp } from 'firebase/firestore';

export interface School {
  id: string;
  name: string;
  password?: string;
  adminPin?: string;
  logoUrl?: string;
  theme?: {
    primary: string;
    background: string;
    accent: string;
  };
}

export interface Bell {
  id:string;
  time: string; // "HH:MM"
  label: string; // e.g., "1st Lesson Start", "Break End"
  sound: string; // "default.mp3"
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  imageHint?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive: boolean;
  createdAt: string; // ISO string
}

export interface EmergencyAnnouncement {
  active: boolean;
  message: string;
  updatedAt: Timestamp;
}
