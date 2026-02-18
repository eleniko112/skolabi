export const SETTINGS_KEY_PREFIX = 'school-settings-';

export interface SchoolSettings {
  bellSound: string;
}

export const defaultSettings: SchoolSettings = {
  bellSound: 'default',
};

export const bellSoundOptions = [
  { value: 'default', label: 'სტანდარტული ზარი' },
  { value: 'digital', label: 'ციფრული ხმა' },
  { value: 'chime', label: 'მელოდია' },
  { value: 'short-beep', label: 'მოკლე სიგნალი' },
];
