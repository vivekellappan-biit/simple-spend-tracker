import { useEffect, useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { TrendingDown, Wallet, ArrowDownRight, Pencil, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DAILY_FINANCE_QUOTES = [
  {
    quote: 'Save first, spend what remains. Your future self will thank you.',
    tip: 'Auto-transfer 20% of income to savings the day you get paid.',
  },
  {
    quote: 'Small daily spending is where big monthly leaks hide.',
    tip: 'Set a daily discretionary cap and track it before bedtime.',
  },
  {
    quote: 'Financial independence is built by consistency, not luck.',
    tip: 'Review recurring subscriptions monthly and cancel one unused item.',
  },
  {
    quote: 'A budget is freedom with a plan, not restriction.',
    tip: 'Use the 50/30/20 split and move extra from wants to savings.',
  },
  {
    quote: 'Every rupee has a job; assign it before you spend it.',
    tip: 'Plan next week expenses every Sunday and set category limits.',
  },
  {
    quote: 'Emergency funds turn stress into options.',
    tip: 'Build toward 6 months of essential expenses, one month at a time.',
  },
  {
    quote: 'Spend intentionally today to buy freedom tomorrow.',
    tip: 'Wait 24 hours before non-essential purchases above your set limit.',
  },
];

const getDailyFinanceQuote = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return DAILY_FINANCE_QUOTES[dayOfYear % DAILY_FINANCE_QUOTES.length];
};

const BalanceCard = () => {
  const { currentBalance, totalExpenses, totalIncome, initialBalance, setInitialBalance } = useExpenses();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const { settings, updateSettings } = useExpenses();

  useEffect(() => {
    if (settings) setShowBalance(settings.show_balance);
  }, [settings]);

  const spentPercentage = initialBalance ? Math.min((totalExpenses / initialBalance) * 100, 100) : 0;
  const dailyQuote = getDailyFinanceQuote();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setAmount((initialBalance ?? 0).toString());
      setError('');
    }
  };

  const handleSave = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value < 0) {
      setError('Please enter a valid amount');
      return;
    }
    setInitialBalance(value);
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Main Balance */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between gap-2 text-muted-foreground text-sm mb-1">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            <span>Current Balance</span>
          </div>
          <button
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
            onClick={() => {
              const next = !showBalance;
              setShowBalance(next);
              updateSettings({ show_balance: next });
            }}
            title={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className={`text-4xl font-bold font-mono tracking-tight ${currentBalance < 0 ? 'text-expense' : 'text-foreground'}`}>
          {showBalance ? formatCurrency(currentBalance) : '••••••'}
        </p>
        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Spent</span>
            <span>{spentPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${spentPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-to-r from-background to-card p-4">
        <p className="text-sm font-medium text-foreground">"{dailyQuote.quote}"</p>
        <p className="text-xs text-muted-foreground mt-2">{dailyQuote.tip}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/60 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-income/10 text-income">
              <TrendingUp className="h-3 w-3" />
            </span>
            <div className="leading-none">
              <p className="text-[11px] uppercase tracking-wide">Total Income</p>
              <p className="text-base font-semibold font-mono text-income">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/60 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ArrowDownRight className="h-3 w-3" />
              </span>
              <div className="leading-none">
                <p className="text-[11px] uppercase tracking-wide">Initial</p>
                <p className="text-base font-semibold font-mono text-foreground">
                  {formatCurrency(initialBalance ?? 0)}
                </p>
              </div>
            </div>
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <button
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center"
                  title="Edit initial balance"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[380px]">
                <DialogHeader>
                  <DialogTitle>Update Initial Balance</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Initial Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                      ₹
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); setError(''); }}
                      className="pl-7 h-11 font-mono bg-background"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-expense">{error}</p>
                  )}
                </div>
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSave}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/60 p-4 shadow-sm col-span-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-expense/10 text-expense">
              <TrendingDown className="h-3 w-3" />
            </span>
            <div className="leading-none">
              <p className="text-[11px] uppercase tracking-wide">Total Spent</p>
              <p className="text-base font-semibold font-mono text-expense">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
