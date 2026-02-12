import { useState } from 'react';
import { useExpenses, LendBorrowEntry } from '@/context/ExpenseContext';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

const getBalanceImpact = (
  entryType: LendBorrowEntry['type'],
  entryAmount: number,
  entryStatus: LendBorrowEntry['status'],
) => {
  if (entryStatus === 'settled') return 0;
  return entryType === 'lent' ? -entryAmount : entryAmount;
};

const getOpenEntryImpact = (
  entryType: LendBorrowEntry['type'],
  entryAmount: number,
) => (entryType === 'lent' ? -entryAmount : entryAmount);

const LendBorrowItem = ({
  item,
  onDelete,
  onUpdate,
}: {
  item: LendBorrowEntry;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    updates: Pick<LendBorrowEntry, 'type' | 'person_name' | 'amount' | 'date' | 'note' | 'status'>,
  ) => void;
}) => {
  const { initialBalance, setInitialBalance } = useExpenses();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<LendBorrowEntry['type']>(item.type);
  const [personName, setPersonName] = useState(item.person_name);
  const [amount, setAmount] = useState(item.amount.toString());
  const [date, setDate] = useState(item.date);
  const [note, setNote] = useState(item.note ?? '');
  const [status, setStatus] = useState<LendBorrowEntry['status']>(item.status);
  const [shouldUpdateCurrentAmount, setShouldUpdateCurrentAmount] = useState(true);

  const resetForm = () => {
    setType(item.type);
    setPersonName(item.person_name);
    setAmount(item.amount.toString());
    setDate(item.date);
    setNote(item.note ?? '');
    setStatus(item.status);
    setShouldUpdateCurrentAmount(true);
  };

  const handleSave = () => {
    const value = parseFloat(amount);
    if (!personName.trim() || isNaN(value) || value <= 0 || !date) return;

    onUpdate(item.id, {
      type,
      person_name: personName.trim(),
      amount: value,
      date,
      note: note.trim() || null,
      status,
    });

    if (shouldUpdateCurrentAmount) {
      let delta = 0;

      if (item.status === 'open' && status === 'settled') {
        delta = type === 'lent' ? value : -value;
      } else if (item.status === 'settled' && status === 'open') {
        delta = getOpenEntryImpact(type, value);
      } else {
        const previousImpact = getBalanceImpact(item.type, item.amount, item.status);
        const nextImpact = getBalanceImpact(type, value, status);
        delta = nextImpact - previousImpact;
      }

      setInitialBalance((initialBalance ?? 0) + delta);
    }

    setOpen(false);
  };

  const Icon = item.type === 'lent' ? ArrowUpRight : ArrowDownLeft;
  const amountColor = item.type === 'lent' ? 'text-warning' : 'text-income';
  const title = item.type === 'lent' ? `Lent to ${item.person_name}` : `Borrowed from ${item.person_name}`;

  return (
    <div className="flex items-center gap-3 py-3 group">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
        <Icon className={`w-5 h-5 ${amountColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{format(new Date(item.date), 'MMM d')}</span>
          <Badge variant="outline" className={item.status === 'open' ? 'border-warning/40 text-warning' : ''}>
            {item.status}
          </Badge>
        </div>
        {item.note && <p className="text-xs text-muted-foreground truncate mt-0.5">{item.note}</p>}
      </div>
      <p className={`text-sm font-semibold font-mono shrink-0 ${amountColor}`}>
        ₹{item.amount.toFixed(2)}
      </p>
      <div className="flex items-center gap-1">
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (nextOpen) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <button
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
              title="Edit entry"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle>Edit Lend/Borrow Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Select value={type} onValueChange={(value) => setType(value as LendBorrowEntry['type'])}>
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
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 bg-background" />
              </div>
              <Select value={status} onValueChange={(value) => setStatus(value as LendBorrowEntry['status'])}>
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="settled">Settled</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Optional note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-background min-h-[84px]"
              />
              <div className="rounded-lg border border-border bg-background/70 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Update current amount?</p>
                    <p className="text-xs text-muted-foreground">
                      Adjust balance based on edited amount, type, and status
                    </p>
                  </div>
                  <Switch
                    checked={shouldUpdateCurrentAmount}
                    onCheckedChange={setShouldUpdateCurrentAmount}
                    aria-label="Update current amount"
                  />
                </div>
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
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete lend/borrow entry?</AlertDialogTitle>
            </AlertDialogHeader>
            <p className="text-sm text-muted-foreground">
              This will permanently remove this record.
            </p>
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(item.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

const LendBorrowList = () => {
  const {
    lendBorrowEntries,
    deleteLendBorrowEntry,
    updateLendBorrowEntry,
    outstandingLent,
    outstandingBorrowed,
  } = useExpenses();
  const openLentCount = lendBorrowEntries.filter((item) => item.type === 'lent' && item.status === 'open').length;
  const openBorrowedCount = lendBorrowEntries.filter((item) => item.type === 'borrowed' && item.status === 'open').length;

  if (lendBorrowEntries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No lend/borrow records yet</p>
        <p className="text-xs mt-1">Add your first entry above</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="mb-3 rounded-xl border border-border bg-gradient-to-r from-background to-card/70 p-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            Lend / Borrow Tracker
          </h3>
          <span className="text-[11px] rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground">
            {lendBorrowEntries.length} records
          </span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-warning/25 bg-warning/5 p-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Open Lent</p>
            <p className="text-sm font-mono font-semibold text-warning">{formatCurrency(outstandingLent)}</p>
            <p className="text-[11px] text-muted-foreground">{openLentCount} open {openLentCount === 1 ? 'entry' : 'entries'}</p>
          </div>
          <div className="rounded-lg border border-income/25 bg-income/5 p-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Open Borrowed</p>
            <p className="text-sm font-mono font-semibold text-income">{formatCurrency(outstandingBorrowed)}</p>
            <p className="text-[11px] text-muted-foreground">{openBorrowedCount} open {openBorrowedCount === 1 ? 'entry' : 'entries'}</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border">
        {lendBorrowEntries.map(item => (
          <LendBorrowItem key={item.id} item={item} onDelete={deleteLendBorrowEntry} onUpdate={updateLendBorrowEntry} />
        ))}
      </div>
    </div>
  );
};

export default LendBorrowList;
