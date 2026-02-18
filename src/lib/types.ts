import type { Timestamp } from 'firebase/firestore';

export interface School {
  id: string;
  name: string;
  password?: string;
  logoUrl?: string;
  theme?: {
    primary: string;
    background: string;
    accent: string;
  };
}

export interface Bell {
  id: string;
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
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface EmergencyAnnouncement {
  active: boolean;
  message: string;
  updatedAt: Timestamp;
}
