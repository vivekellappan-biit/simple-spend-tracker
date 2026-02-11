import { useEffect, useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { TrendingDown, Wallet, ArrowDownRight, Pencil, TrendingUp, Eye, EyeOff, Share2, Brain, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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

const LEARNING_MONTHS = 12;
const FIRE_WITHDRAWAL_MULTIPLIER = 25;
const ANNUAL_GROWTH_RATE = 0.10;

const formatYearsToFire = (years: number | null) => {
  if (years === null) return 'Needs surplus';
  if (years <= 0) return 'Reached';
  if (years < 1) return '<1 year';
  return `${years.toFixed(1)} years`;
};

const BalanceCard = () => {
  const { currentBalance, totalExpenses, totalIncome, initialBalance, setInitialBalance, expenses, incomes } = useExpenses();
  const { toast } = useToast();
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
  const shareText = `"${dailyQuote.quote}"\n\n${dailyQuote.tip}`;
  const monthBuckets = new Map<string, { expense: number; income: number }>();

  expenses.forEach((expense) => {
    const key = expense.date.slice(0, 7);
    const current = monthBuckets.get(key) ?? { expense: 0, income: 0 };
    current.expense += expense.amount;
    monthBuckets.set(key, current);
  });

  incomes.forEach((income) => {
    const key = income.date.slice(0, 7);
    const current = monthBuckets.get(key) ?? { expense: 0, income: 0 };
    current.income += income.amount;
    monthBuckets.set(key, current);
  });

  const recentMonths = Array.from(monthBuckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-LEARNING_MONTHS)
    .map(([, value]) => value);

  const weightedAverage = (values: number[]) => {
    if (values.length === 0) return 0;
    let weightedSum = 0;
    let totalWeight = 0;
    values.forEach((value, index) => {
      const weight = index + 1;
      weightedSum += value * weight;
      totalWeight += weight;
    });
    return weightedSum / totalWeight;
  };

  const estimatedMonthlyExpense = weightedAverage(recentMonths.map((month) => month.expense));
  const estimatedMonthlyIncome = weightedAverage(recentMonths.map((month) => month.income));
  const fireNumber = estimatedMonthlyExpense * 12 * FIRE_WITHDRAWAL_MULTIPLIER;
  const monthlySurplus = Math.max(estimatedMonthlyIncome - estimatedMonthlyExpense, 0);
  const progressToFire = fireNumber > 0 ? Math.min((Math.max(currentBalance, 0) / fireNumber) * 100, 100) : 0;

  const estimateYearsToFire = () => {
    if (fireNumber <= 0) return null;
    const principal = Math.max(currentBalance, 0);
    if (principal >= fireNumber) return 0;
    if (monthlySurplus <= 0) return null;

    const monthlyRate = ANNUAL_GROWTH_RATE / 12;
    const numerator = fireNumber * monthlyRate + monthlySurplus;
    const denominator = principal * monthlyRate + monthlySurplus;
    if (denominator <= 0 || numerator <= denominator) return null;

    const monthsNeeded = Math.log(numerator / denominator) / Math.log(1 + monthlyRate);
    if (!Number.isFinite(monthsNeeded) || monthsNeeded < 0) return null;
    return monthsNeeded / 12;
  };

  const yearsToFire = estimateYearsToFire();
  const learningScore = Math.min(95, Math.round((recentMonths.length / LEARNING_MONTHS) * 100));

  const copyQuoteToClipboard = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
      return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = shareText;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (!copied) {
      throw new Error('Copy command failed');
    }
  };

  const handleShareQuote = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Daily Finance Quote',
          text: shareText,
        });
        return;
      }

      await copyQuoteToClipboard();
      toast({
        title: 'Quote copied',
        description: 'You can now paste and share it anywhere.',
      });
    } catch (error) {
      if (
        (error instanceof DOMException && error.name === 'AbortError') ||
        (typeof error === 'object' &&
          error !== null &&
          'name' in error &&
          (error as { name?: string }).name === 'AbortError')
      ) {
        return;
      }

      toast({
        title: 'Share failed',
        description: 'Could not share the quote. Please try again.',
        variant: 'destructive',
      });
    }
  };

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

        <div className="mt-4 rounded-xl border border-border bg-background/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5 text-primary" />
              AI FIRE Predictor
            </p>
            <span className="text-[11px] text-muted-foreground">
              Learning: {learningScore}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-border bg-card p-2">
              <p className="text-muted-foreground">FIRE Number</p>
              <p className="font-semibold font-mono text-foreground">{formatCurrency(fireNumber || 0)}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-2">
              <p className="text-muted-foreground">Time to FIRE</p>
              <p className="font-semibold text-foreground flex items-center gap-1">
                <Target className="h-3 w-3 text-primary" />
                {formatYearsToFire(yearsToFire)}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Updates automatically from your latest expenses and incomes.
          </p>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressToFire}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-to-r from-background to-card p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-foreground">"{dailyQuote.quote}"</p>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleShareQuote} title="Share quote">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
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
