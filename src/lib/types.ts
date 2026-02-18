import type { Timestamp } from 'firebase/firestore';

export interface School {
  name: string;
  password?: string;
  adminPin?: string;
  logoUrl?: string;
}

export interface Bell {
  time: string; // "HH:MM"
  label: string; // e.g., "1st Lesson Start", "Break End"
  sound: string; // "default.mp3"
}

export interface Announcement {
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

export interface HistoryLog {
  timestamp: string; // ISO string
  action: string;
  details: string;
}

export type SchedulePeriod = {
  startTime: string;
  endTime: string;
  label: string;
};

export interface Theme {
  background: string; // HSL format: "H S% L%"
  primary: string;    // HSL format: "H S% L%"
  accent: string;     // HSL format: "H S% L%"
}

export interface SchoolSettings {
  bellSound: string;
}

export interface EmergencyState {
  active: boolean;
  message: string;
}
