import { useExpenses } from '@/context/ExpenseContext';
import { TrendingDown, Wallet, ArrowDownRight } from 'lucide-react';

const BalanceCard = () => {
  const { currentBalance, totalExpenses, initialBalance } = useExpenses();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const spentPercentage = initialBalance ? Math.min((totalExpenses / initialBalance) * 100, 100) : 0;

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
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Initial</span>
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
      </div>
    </div>
  );
};

export default BalanceCard;
