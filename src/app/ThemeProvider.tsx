import { useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './themeContext';
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    const pageColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--background')
      .trim();
    if (pageColor)
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', pageColor);
    try {
      localStorage.setItem('convo2poc-theme', theme);
    } catch {
      /* Theme still works without storage. */
    }
  }, [theme]);
  const toggleTheme = () =>
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
