import { useExpenses } from '@/context/ExpenseContext';
import Dashboard from '@/components/Dashboard';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const SettingsSync = () => {
  const { settings } = useExpenses();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme_mode);
      document.documentElement.setAttribute('data-theme-color', settings.primary_color);
    }
  }, [settings, setTheme]);

  return null;
};

const Index = () => {
  return (
    <>
      <SettingsSync />
      <Dashboard />
    </>
  );
};

export default Index;
