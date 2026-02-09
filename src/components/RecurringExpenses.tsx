import { useState } from 'react';
import { useExpenses, RecurringExpense } from '@/context/ExpenseContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Plus } from 'lucide-react';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const getNextDueDate = (dayOfMonth: number) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(Math.max(dayOfMonth, 1), lastDay);
  const dueThisMonth = new Date(year, month, safeDay);
  if (today <= dueThisMonth) return dueThisMonth;
  const nextMonthLastDay = new Date(year, month + 2, 0).getDate();
  const nextSafeDay = Math.min(Math.max(dayOfMonth, 1), nextMonthLastDay);
  return new Date(year, month + 1, nextSafeDay);
};

const RecurringItem = ({
  item,
  onUpdate,
  onDelete,
  categories,
}: {
  item: RecurringExpense;
  onUpdate: (id: string, updates: Partial<Omit<RecurringExpense, 'id' | 'created_at'>>) => void;
  onDelete: (id: string) => void;
  categories: { id: string; name: string }[];
}) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(item.description);
  const [amount, setAmount] = useState(item.amount.toString());
  const [category, setCategory] = useState(item.category);
  const [dayOfMonth, setDayOfMonth] = useState(item.day_of_month.toString());
  const [startDate, setStartDate] = useState(item.start_date);
  const hasCategory = categories.some(cat => cat.name === item.category);

  const resetForm = () => {
    setDescription(item.description);
    setAmount(item.amount.toString());
    setCategory(item.category);
    setDayOfMonth(item.day_of_month.toString());
    setStartDate(item.start_date);
  };

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    const parsedDay = parseInt(dayOfMonth, 10);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !category || isNaN(parsedDay)) {
      return;
    }

    onUpdate(item.id, {
      description: description.trim(),
      amount: parsedAmount,
      category,
      day_of_month: Math.min(Math.max(parsedDay, 1), 31),
      start_date: startDate,
    });
    setOpen(false);
  };

  const nextDue = getNextDueDate(item.day_of_month);

  return (
    <div className="flex items-center gap-3 py-3 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.description}</p>
        <p className="text-xs text-muted-foreground">
          {item.category} · Day {item.day_of_month} · Next {formatDate(nextDue)}
        </p>
      </div>
      <p className="text-sm font-semibold font-mono text-foreground shrink-0">
        {formatCurrency(item.amount)}
      </p>
      <Switch
        checked={item.active}
        onCheckedChange={(checked) => onUpdate(item.id, { active: checked })}
      />
      <div className="flex items-center gap-1">
        <Dialog open={open} onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
              title="Edit recurring expense"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Edit Recurring Expense</DialogTitle>
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
                      <SelectItem key={item.category} value={item.category}>
                        {item.category} (missing)
                      </SelectItem>
                    )}
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  className="h-11 bg-background"
                  placeholder="Day of month"
                />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 bg-background"
                />
              </div>
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
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-expense"
          title="Delete recurring expense"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const RecurringExpenses = () => {
  const { recurringExpenses, addRecurringExpense, updateRecurringExpense, deleteRecurringExpense, categories } = useExpenses();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [startDate, setStartDate] = useState(formatDate(new Date()));

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setDayOfMonth('');
    setStartDate(formatDate(new Date()));
  };

  const handleAdd = () => {
    const parsedAmount = parseFloat(amount);
    const parsedDay = parseInt(dayOfMonth, 10);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !category || isNaN(parsedDay)) {
      return;
    }
    addRecurringExpense({
      description: description.trim(),
      amount: parsedAmount,
      category,
      day_of_month: Math.min(Math.max(parsedDay, 1), 31),
      start_date: startDate,
      active: true,
    });
    resetForm();
    setOpen(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Recurring Bills</h3>
        <Dialog open={open} onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary" className="h-8 gap-2">
              <Plus className="w-4 h-4" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Add Recurring Expense</DialogTitle>
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
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  className="h-11 bg-background"
                  placeholder="Day of month"
                />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 bg-background"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAdd}>
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {recurringExpenses.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">No recurring bills yet</p>
          <p className="text-xs mt-1">Add monthly bills to auto-track expenses</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {recurringExpenses.map(item => (
            <RecurringItem
              key={item.id}
              item={item}
              onUpdate={updateRecurringExpense}
              onDelete={deleteRecurringExpense}
              categories={categories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringExpenses;
