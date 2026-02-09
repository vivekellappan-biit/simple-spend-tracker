import { useExpenses, Expense } from '@/context/ExpenseContext';
import { Trash2, ShoppingBag, Car, Utensils, Gamepad2, Zap, Heart, GraduationCap, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Food & Dining': Utensils,
  'Transportation': Car,
  'Shopping': ShoppingBag,
  'Entertainment': Gamepad2,
  'Bills & Utilities': Zap,
  'Health': Heart,
  'Education': GraduationCap,
  'Other': MoreHorizontal,
};

const ExpenseItem = ({ expense, onDelete }: { expense: Expense; onDelete: (id: string) => void }) => {
  const Icon = CATEGORY_ICONS[expense.category] || MoreHorizontal;

  return (
    <div className="flex items-center gap-3 py-3 group">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{expense.description}</p>
        <p className="text-xs text-muted-foreground">{expense.category} · {format(new Date(expense.date), 'MMM d')}</p>
      </div>
      <p className="text-sm font-semibold font-mono text-expense shrink-0">
        -${expense.amount.toFixed(2)}
      </p>
      <button
        onClick={() => onDelete(expense.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-expense"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const ExpenseList = () => {
  const { expenses, deleteExpense } = useExpenses();

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No expenses yet</p>
        <p className="text-xs mt-1">Add your first expense above</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <h3 className="font-semibold text-foreground text-sm mb-2">Recent Expenses</h3>
      <div className="divide-y divide-border">
        {expenses.map(expense => (
          <ExpenseItem key={expense.id} expense={expense} onDelete={deleteExpense} />
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
