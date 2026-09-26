import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { COLORS, ThemeColors } from '../theme/colors';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  scheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [scheme, setScheme] = useState<ColorScheme>(
    systemScheme === 'dark' ? 'dark' : 'light'
  );

  // Keep in sync with system changes
  useEffect(() => {
    setScheme(systemScheme === 'dark' ? 'dark' : 'light');
  }, [systemScheme]);

  const toggleTheme = useCallback(() => {
    setScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const isDark = scheme === 'dark';
  const colors: ThemeColors = isDark ? COLORS.dark : COLORS.light;

  return (
    <ThemeContext.Provider value={{ scheme, colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
