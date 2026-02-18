export const THEME_KEY_PREFIX = 'school-theme-';

export interface Theme {
  background: string; // HSL format: "H S% L%"
  primary: string;    // HSL format: "H S% L%"
  accent: string;     // HSL format: "H S% L%"
}

// Default theme from globals.css
export const defaultTheme: Theme = {
    background: "214 25% 95%",
    primary: "211 32% 28%",
    accent: "267 33% 44%",
};
