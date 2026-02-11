import { useState } from 'react';
import { useExpenses, Income } from '@/context/ExpenseContext';
import { Trash2, ArrowUpRight, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const IncomeItem = ({
  income,
  onDelete,
  onUpdate,
}: {
  income: Income;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Pick<Income, 'description' | 'amount' | 'date'>) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(income.description);
  const [amount, setAmount] = useState(income.amount.toString());
  const [date, setDate] = useState(income.date);

  const resetForm = () => {
    setDescription(income.description);
    setAmount(income.amount.toString());
    setDate(income.date);
  };

  const handleSave = () => {
    const value = parseFloat(amount);
    if (!description.trim() || isNaN(value) || value <= 0 || !date) return;

    onUpdate(income.id, {
      description: description.trim(),
      amount: value,
      date,
    });
    setOpen(false);
  };

  return (
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
      <div className="flex items-center gap-1">
        <Dialog open={open} onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <button
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
              title="Edit income"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Edit Income</DialogTitle>
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
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-expense"
              title="Delete income"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete income?</AlertDialogTitle>
            </AlertDialogHeader>
            <p className="text-sm text-muted-foreground">
              This will permanently remove this income entry.
            </p>
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(income.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

const IncomeList = () => {
  const { incomes, deleteIncome, updateIncome } = useExpenses();

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
          <IncomeItem key={income.id} income={income} onDelete={deleteIncome} onUpdate={updateIncome} />
        ))}
      </div>
    </div>
  );
};

export default IncomeList;
