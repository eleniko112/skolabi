import { Theme } from './types';

export const THEME_KEY_PREFIX = 'school-board-theme-';

export const defaultTheme: Theme = {
    background: "220 20% 97%",
    primary: "221 39% 49%",
    accent: "347 77% 60%",
};

const HSL_REGEX = /^\s*(\d+)\s+([\d.]+)%\s+([\d.]+)%\s*$/;

export function hslToHex(hsl: string): string {
    if (!hsl) return '#000000';
    const match = hsl.match(HSL_REGEX);
    if (!match) {
        return '#000000';
    }
    let h = parseInt(match[1]);
    let s = parseFloat(match[2]);
    let l = parseFloat(match[3]);

    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToHsl(hex: string): string {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) { // #RGB
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) { // #RRGGBB
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;
    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h} ${s}% ${l}%`;
}

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
