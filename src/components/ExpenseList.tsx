import { useState } from 'react';
import { useExpenses, Expense } from '@/context/ExpenseContext';
import { Trash2, ShoppingBag, Car, Utensils, Gamepad2, Zap, Heart, GraduationCap, MoreHorizontal, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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

const capitalizeFirstLetter = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
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
        <p className="text-sm font-medium text-foreground truncate">{capitalizeFirstLetter(expense.description)}</p>
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
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-expense"
              title="Delete expense"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            </AlertDialogHeader>
            <p className="text-sm text-muted-foreground">
              This will permanently remove this expense entry.
            </p>
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(expense.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

const ExpenseList = ({
  onAddClick,
  expenses: overrideExpenses,
}: {
  onAddClick?: () => void;
  expenses?: Expense[];
}) => {
  const { expenses, deleteExpense, updateExpense, categories } = useExpenses();
  const list = overrideExpenses ?? expenses;

  if (list.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No expenses yet</p>
        <p className="text-xs mt-1">Add your first expense above</p>
      </div>
    );
  }

  const grouped = list.reduce<Record<string, Expense[]>>((acc, expense) => {
    const key = expense.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(expense);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-foreground text-sm">Recent Expenses</h3>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="text-xs font-medium text-primary hover:underline"
          >
            Add Expense
          </button>
        )}
      </div>
      <div className="space-y-4">
        {sortedDates.map(date => {
          const dayTotal = grouped[date].reduce((sum, expense) => sum + expense.amount, 0);
          const dayCount = grouped[date].length;
          return (
          <div key={date}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">
                {format(new Date(date), 'MMM d, yyyy')}
              </p>
              <p className="text-xs text-muted-foreground">
                {dayCount} txn · <span className="font-mono text-expense">₹{dayTotal.toFixed(2)}</span>
              </p>
            </div>
            <div className="divide-y divide-border">
              {grouped[date].map(expense => (
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
        )})}
      </div>
    </div>
  );
};

export default ExpenseList;
