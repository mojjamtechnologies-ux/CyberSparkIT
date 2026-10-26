import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const KEY = 'cs_theme';
type Theme = 'light' | 'dark';
// index.html sets data-theme before the page paints (saved choice, otherwise the device setting).
const current = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(current);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  // Follow the device setting only until the visitor picks a theme themselves.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      try { if (localStorage.getItem(KEY)) return; } catch { /* storage unavailable */ }
      setTheme(mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  const toggle = () => {
    setTheme(next);
    try { localStorage.setItem(KEY, next); } catch { /* storage unavailable */ }
  };
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  );
}
