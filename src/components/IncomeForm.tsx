import { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

const IncomeForm = () => {
  const { addIncome } = useExpenses();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!description.trim() || isNaN(value) || value <= 0) return;

    addIncome({
      description: description.trim(),
      amount: value,
      date: new Date().toISOString().split('T')[0],
    });

    setDescription('');
    setAmount('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full h-12 text-base font-semibold gap-2"
        variant="secondary"
      >
        <Plus className="w-5 h-5" />
        Add Income
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-2xl p-5 border border-border space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <h3 className="font-semibold text-foreground">New Income</h3>

      <Input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="h-11 bg-background"
        autoFocus
      />

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

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1 h-11">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 h-11 font-semibold">
          Add
        </Button>
      </div>
    </form>
  );
};

export default IncomeForm;
