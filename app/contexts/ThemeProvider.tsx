import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      console.log('ThemeProvider: Running on server, defaulting to light theme');
      return 'light';
    }
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('ThemeProvider: Initializing theme', {
      savedTheme,
      prefersDark,
      initialTheme: savedTheme || (prefersDark ? 'dark' : 'light'),
    });
    return savedTheme ? (savedTheme as Theme) : prefersDark ? 'dark' : 'light';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('ThemeProvider: Applying theme', { theme, isDark });
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.setProperty('color-scheme', theme);
      localStorage.setItem('theme', theme);
      console.log('ThemeProvider: Updated DOM', {
        hasDarkClass: document.documentElement.classList.contains('dark'),
        colorScheme: document.documentElement.style.getPropertyValue('color-scheme'),
      });
    }
  }, [theme, isDark]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('ThemeProvider: Toggling theme from', prev, 'to', newTheme);
      return newTheme;
    });
  };

  console.log('ThemeProvider: Rendering with theme', { theme, isDark });

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};