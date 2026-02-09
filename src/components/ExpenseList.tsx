import { useState } from 'react';
import { useExpenses, Expense } from '@/context/ExpenseContext';
import { Trash2, ShoppingBag, Car, Utensils, Gamepad2, Zap, Heart, GraduationCap, MoreHorizontal, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const ExpenseItem = ({
  expense,
  onDelete,
  onUpdate,
  categories,
}: {
  expense: Expense;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Pick<Expense, 'description' | 'amount' | 'category' | 'date'>) => void;
  categories: { id: string; name: string }[];
}) => {
  const Icon = CATEGORY_ICONS[expense.category] || MoreHorizontal;
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState(expense.category);
  const [date, setDate] = useState(expense.date);
  const hasCategory = categories.some(cat => cat.name === expense.category);

  const resetForm = () => {
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(expense.date);
  };

  const handleSave = () => {
    const value = parseFloat(amount);
    if (!description.trim() || isNaN(value) || value <= 0 || !category || !date) return;

    onUpdate(expense.id, {
      description: description.trim(),
      amount: value,
      category,
      date,
    });
    setOpen(false);
  };

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
        -₹{expense.amount.toFixed(2)}
      </p>
      <div className="flex items-center gap-1">
        <Dialog open={open} onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
              title="Edit expense"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-11 bg-background"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">₹</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7 h-11 font-mono bg-background"
                  />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11 bg-background">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {!hasCategory && (
                      <SelectItem key={expense.category} value={expense.category}>
                        {expense.category} (missing)
                      </SelectItem>
                    )}
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 bg-background"
              />
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
        <button
          onClick={() => onDelete(expense.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-expense"
          title="Delete expense"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ExpenseList = () => {
  const { expenses, deleteExpense, updateExpense, categories } = useExpenses();

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
          <ExpenseItem
            key={expense.id}
            expense={expense}
            onDelete={deleteExpense}
            onUpdate={updateExpense}
            categories={categories}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
