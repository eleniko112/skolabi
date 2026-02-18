import { SchoolSettings } from "./types";

export const SETTINGS_KEY_PREFIX = 'school-board-settings-';

export const defaultSettings: SchoolSettings = {
  bellSound: 'default',
};

const getStorage = () => {
    if (typeof window === 'undefined') return undefined;
    return window.localStorage;
}

export const getSettings = (schoolId: string): SchoolSettings => {
    const storage = getStorage();
    if (!storage) return defaultSettings;

    const key = `${SETTINGS_KEY_PREFIX}${schoolId}`;
    let settings = JSON.parse(storage.getItem(key) || 'null') as SchoolSettings | null;

    if (!settings) {
        storage.setItem(key, JSON.stringify(defaultSettings));
        return defaultSettings;
    }

    return settings;
};

export const setSettings = (schoolId: string, settings: SchoolSettings) => {
    const storage = getStorage();
    if (!storage) return;

    storage.setItem(`${SETTINGS_KEY_PREFIX}${schoolId}`, JSON.stringify(settings));
};
