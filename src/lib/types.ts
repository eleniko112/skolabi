export interface School {
  id: string;
  name: string;
  password?: string;
  adminPin?: string;
  logoUrl?: string;
  cardColor?: string; // HSL format: "H S% L%"
  // Firestore backend.json alignment
  backgroundColor?: string;
  themeColor?: string;
  accentColor?: string;
  bellSoundUrlDefault?: string;
}

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  imageUrl: string;
  imageHint?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive: boolean;
  createdAt: string; // ISO string
}

export interface HistoryLog {
  id: string;
  schoolId: string;
  timestamp: string; // ISO string
  action: string;
  details: string;
  adminIdentifier: string;
}

export type SchedulePeriod = {
  id: string;
  schoolId: string;
  startTime: string;
  endTime: string;
  label: string;
  lessonNumber: number;
};

export interface Theme {
  background: string;
  primary: string;
  accent: string;
}

export interface SchoolSettings {
  bellSound: string;
}

export interface EmergencyState {
  id: string;
  schoolId: string;
  active: boolean;
  message: string;
  activatedAt: string;
}
