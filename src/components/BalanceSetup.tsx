import { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet } from 'lucide-react';

const BalanceSetup = () => {
  const { setInitialBalance } = useExpenses();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (isNaN(value) || value < 0) {
      setError('Please enter a valid amount');
      return;
    }
    setInitialBalance(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Expense Tracker
          </h1>
          <p className="text-muted-foreground text-sm">
            Set your initial balance to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Initial Balance
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-lg">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                className="pl-9 h-14 text-2xl font-mono bg-card border-border focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {error && (
              <p className="text-sm text-expense">{error}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold">
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BalanceSetup;
