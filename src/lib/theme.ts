import { Theme } from './types';

export const THEME_KEY_PREFIX = 'school-board-theme-';

export const defaultTheme: Theme = {
    background: "220 20% 97%",
    primary: "221 39% 49%",
    accent: "347 77% 60%",
};

const getStorage = () => {
    if (typeof window === 'undefined') return undefined;
    return window.localStorage;
}

export const getTheme = (schoolId: string): Theme => {
    const storage = getStorage();
    if (!storage) return defaultTheme;

    const key = `${THEME_KEY_PREFIX}${schoolId}`;
    const theme = JSON.parse(storage.getItem(key) || 'null') as Theme | null;

    if (!theme) {
        storage.setItem(key, JSON.stringify(defaultTheme));
        return defaultTheme;
    }
    return theme;
};

export const setTheme = (schoolId: string, theme: Theme) => {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(`${THEME_KEY_PREFIX}${schoolId}`, JSON.stringify(theme));
};
