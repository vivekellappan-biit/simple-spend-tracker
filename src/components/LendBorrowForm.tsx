import { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

const LendBorrowForm = () => {
  const { addLendBorrowEntry } = useExpenses();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'lent' | 'borrowed'>('lent');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);

    if (!personName.trim() || isNaN(value) || value <= 0 || !date) return;

    addLendBorrowEntry({
      type,
      person_name: personName.trim(),
      amount: value,
      date,
      note: note.trim() || null,
      status: 'open',
    });

    setPersonName('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setType('lent');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full h-12 text-base font-semibold gap-2"
        variant="outline"
      >
        <Plus className="w-5 h-5" />
        Track Lent / Borrowed
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-2xl p-5 border border-border space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <h3 className="font-semibold text-foreground">Track Lend / Borrow</h3>

      <Select value={type} onValueChange={(value) => setType(value as 'lent' | 'borrowed')}>
        <SelectTrigger className="h-11 bg-background">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lent">I lent to someone</SelectItem>
          <SelectItem value="borrowed">I borrowed from someone</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder={type === 'lent' ? 'Whom you lent to' : 'From whom you borrowed'}
        value={personName}
        onChange={(e) => setPersonName(e.target.value)}
        className="h-11 bg-background"
        autoFocus
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

      <Textarea
        placeholder="Optional note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="bg-background min-h-[84px]"
      />

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

export default LendBorrowForm;
