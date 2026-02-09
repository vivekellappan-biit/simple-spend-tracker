import { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { TrendingDown, Wallet, ArrowDownRight, Pencil, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BalanceCard = () => {
  const { currentBalance, totalExpenses, totalIncome, initialBalance, setInitialBalance } = useExpenses();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const spentPercentage = initialBalance ? Math.min((totalExpenses / initialBalance) * 100, 100) : 0;

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
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Wallet className="w-4 h-4" />
          <span>Current Balance</span>
        </div>
        <p className={`text-4xl font-bold font-mono tracking-tight ${currentBalance < 0 ? 'text-expense' : 'text-foreground'}`}>
          {formatCurrency(currentBalance)}
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

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <div className="flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Initial</span>
            </div>
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <button
                  className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
                  title="Edit initial balance"
                >
                  <Pencil className="w-3.5 h-3.5" />
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
          <p className="text-lg font-semibold font-mono text-foreground">
            {formatCurrency(initialBalance ?? 0)}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-1.5 text-expense text-xs mb-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Total Spent</span>
          </div>
          <p className="text-lg font-semibold font-mono text-expense">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-1.5 text-income text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Total Income</span>
          </div>
          <p className="text-lg font-semibold font-mono text-income">
            {formatCurrency(totalIncome)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
