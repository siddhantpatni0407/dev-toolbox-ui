import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeData {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  changeTheme: (theme: string) => void;
  themes: Record<string, ThemeData>;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: Record<string, ThemeData> = {
  blue: {
    name: 'Ocean Blue',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b'
  },
  green: {
    name: 'Forest Green',
    primary: '#059669',
    secondary: '#10b981',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b'
  },
  purple: {
    name: 'Royal Purple',
    primary: '#7c3aed',
    secondary: '#8b5cf6',
    background: '#faf5ff',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b'
  },
  orange: {
    name: 'Sunset Orange',
    primary: '#ea580c',
    secondary: '#f97316',
    background: '#fff7ed',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b'
  },
  dark: {
    name: 'Dark Mode',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8'
  }
};

/**
 * Theme provider component for managing application theme
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<string>(() => {
    // Get theme from localStorage or default to blue
    const savedTheme = localStorage.getItem('devtoolbox-theme');
    if (savedTheme && themes[savedTheme]) {
      return savedTheme;
    }
    
    // Auto detect system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'blue';
  });

  const setTheme = (newTheme: string) => {
    if (themes[newTheme]) {
      setThemeState(newTheme);
      localStorage.setItem('devtoolbox-theme', newTheme);
    }
  };

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    const currentIndex = Object.keys(themes).indexOf(theme);
    const nextIndex = (currentIndex + 1) % Object.keys(themes).length;
    const nextTheme = Object.keys(themes)[nextIndex];
    setTheme(nextTheme);
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const themeData = themes[theme];
    
    if (themeData) {
      // Set CSS custom properties
      root.style.setProperty('--color-primary', themeData.primary);
      root.style.setProperty('--color-secondary', themeData.secondary);
      root.style.setProperty('--color-background', themeData.background);
      root.style.setProperty('--color-surface', themeData.surface);
      root.style.setProperty('--color-text', themeData.text);
      root.style.setProperty('--color-text-secondary', themeData.textSecondary);
      
      // Set theme attribute
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    changeTheme,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};