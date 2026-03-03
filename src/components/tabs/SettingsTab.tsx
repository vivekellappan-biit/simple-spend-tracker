import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { useExpenses } from '@/context/ExpenseContext';
import RecurringExpenses from '@/components/RecurringExpenses';
import CategoryManager from '@/components/CategoryManager';

const SettingsTab = () => {
  const { setTheme } = useTheme();
  const { signOut } = useAuth();
  const { settings, updateSettings } = useExpenses();
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    if (settings) {
      setShowBalance(settings.show_balance);
      setTheme(settings.theme_mode);
      document.documentElement.setAttribute('data-theme-color', settings.primary_color);
    }
  }, [settings, setTheme]);

  const handleBalanceToggle = (next: boolean) => {
    setShowBalance(next);
    updateSettings({ show_balance: next });
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Appearance */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-5">
        <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">Theme</p>
            <p className="text-xs text-muted-foreground mb-2">Choose light, dark, or system</p>
          </div>
          <div className="flex w-full rounded-xl border border-border bg-background p-1 text-xs">
            {([
              { key: 'light', label: 'Light' },
              { key: 'dark', label: 'Dark' },
              { key: 'system', label: 'System' },
            ] as const).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateSettings({ theme_mode: item.key })}
                className={`flex-1 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  settings?.theme_mode === item.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">Accent Color</p>
            <p className="text-xs text-muted-foreground mb-2">Choose your primary color</p>
          </div>
          <div className="grid grid-cols-5 gap-2.5">
            {[
              { key: 'emerald', color: 'hsl(160 84% 39%)' },
              { key: 'blue', color: 'hsl(210 90% 50%)' },
              { key: 'indigo', color: 'hsl(234 89% 58%)' },
              { key: 'violet', color: 'hsl(270 80% 56%)' },
              { key: 'rose', color: 'hsl(348 85% 55%)' },
              { key: 'amber', color: 'hsl(38 92% 50%)' },
              { key: 'lime', color: 'hsl(90 80% 43%)' },
              { key: 'teal', color: 'hsl(173 80% 40%)' },
              { key: 'cyan', color: 'hsl(188 90% 42%)' },
              { key: 'slate', color: 'hsl(215 20% 45%)' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  updateSettings({
                    primary_color: item.key as 'emerald' | 'blue' | 'indigo' | 'violet' | 'rose' | 'amber' | 'lime' | 'teal' | 'cyan' | 'slate',
                  })
                }
                className={`h-10 w-10 rounded-full border-2 transition-all ${
                  settings?.primary_color === item.key
                    ? 'border-foreground ring-2 ring-foreground/20 scale-110'
                    : 'border-border hover:scale-105'
                }`}
                style={{ backgroundColor: item.color }}
                title={item.key}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Privacy</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Show Balance</p>
            <p className="text-xs text-muted-foreground">Hide your balance on the home screen</p>
          </div>
          <Switch checked={showBalance} onCheckedChange={handleBalanceToggle} />
        </div>
      </div>

      {/* Recurring Bills */}
      <RecurringExpenses />

      {/* Categories */}
      <CategoryManager />

      {/* Account */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Account</h2>
        <Button variant="destructive" className="w-full" onClick={signOut}>
          Log out
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;
