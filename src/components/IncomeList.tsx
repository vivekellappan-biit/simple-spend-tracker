import { useExpenses, Income } from '@/context/ExpenseContext';
import { Trash2, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

const IncomeItem = ({ income, onDelete }: { income: Income; onDelete: (id: string) => void }) => (
  <div className="flex items-center gap-3 py-3 group">
    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
      <ArrowUpRight className="w-5 h-5 text-income" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{income.description}</p>
      <p className="text-xs text-muted-foreground">{format(new Date(income.date), 'MMM d')}</p>
    </div>
    <p className="text-sm font-semibold font-mono text-income shrink-0">
      +₹{income.amount.toFixed(2)}
    </p>
    <button
      onClick={() => onDelete(income.id)}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-expense"
      title="Delete income"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

const IncomeList = () => {
  const { incomes, deleteIncome } = useExpenses();

  if (incomes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No income yet</p>
        <p className="text-xs mt-1">Add your first income above</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <h3 className="font-semibold text-foreground text-sm mb-2">Recent Income</h3>
      <div className="divide-y divide-border">
        {incomes.map(income => (
          <IncomeItem key={income.id} income={income} onDelete={deleteIncome} />
        ))}
      </div>
    </div>
  );
};

export default IncomeList;
