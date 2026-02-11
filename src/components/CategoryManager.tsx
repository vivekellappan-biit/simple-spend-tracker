import { useEffect, useMemo, useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Pencil, Plus, Tag, Trash2 } from 'lucide-react';

const CategoryManager = () => {
  const {
    categories,
    expenses,
    recurringExpenses,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useExpenses();

  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [name, setName] = useState('');
  const hasMoreThanFive = categories.length > 5;
  const visibleCategories = showAll ? categories : categories.slice(0, 5);

  const usageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    expenses.forEach(exp => counts.set(exp.category, (counts.get(exp.category) ?? 0) + 1));
    recurringExpenses.forEach(exp => counts.set(exp.category, (counts.get(exp.category) ?? 0) + 1));
    return counts;
  }, [expenses, recurringExpenses]);

  const handleAdd = () => {
    if (!name.trim()) return;
    addCategory(name);
    setName('');
    setOpen(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          Categories
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary" className="h-8 gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-background"
              />
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

      {categories.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">No categories yet</p>
          <p className="text-xs mt-1">Add your first category above</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {visibleCategories.map(category => (
            <CategoryRow
              key={category.id}
              id={category.id}
              name={category.name}
              usageCount={usageCounts.get(category.name) ?? 0}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
              categories={categories}
            />
          ))}
        </div>
      )}

      {hasMoreThanFive && (
        <button
          type="button"
          onClick={() => setShowAll(prev => !prev)}
          className="w-full h-9 px-3 rounded-lg border border-border bg-background/70 hover:bg-secondary transition-colors text-xs text-muted-foreground flex items-center justify-between"
          aria-expanded={showAll}
          aria-label={showAll ? 'Show fewer categories' : 'Show all categories'}
        >
          <span>
            {showAll
              ? `Showing all ${categories.length} categories`
              : `Showing 5 of ${categories.length} categories`}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            {showAll ? 'Show less' : `View ${categories.length - 5} more`}
            {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>
      )}
    </div>
  );
};

const CategoryRow = ({
  id,
  name,
  usageCount,
  onUpdate,
  onDelete,
  categories,
}: {
  id: string;
  name: string;
  usageCount: number;
  onUpdate: (id: string, nextName: string, previousName: string) => void;
  onDelete: (id: string, reassignTo?: string) => void;
  categories: { id: string; name: string }[];
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(name);
  const availableTargets = categories.filter(cat => cat.id !== id);
  const canReassign = availableTargets.length > 0;
  const defaultTarget = availableTargets.find(cat => cat.name.toLowerCase() === 'other')?.name
    || availableTargets[0]?.name
    || '';
  const [reassignTo, setReassignTo] = useState(defaultTarget);

  useEffect(() => {
    if (!reassignTo || !availableTargets.some(cat => cat.name === reassignTo)) {
      setReassignTo(defaultTarget);
    }
  }, [defaultTarget, reassignTo, availableTargets]);

  const handleSave = () => {
    if (!value.trim()) return;
    onUpdate(id, value.trim(), name);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-3 py-3 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground">
          {usageCount} linked item{usageCount === 1 ? '' : 's'}
        </p>
      </div>
      <Dialog open={open} onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setValue(name);
      }}>
        <DialogTrigger asChild>
          <button
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Edit category"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Category name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
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
            title="Delete category"
            disabled={usageCount > 0 && !canReassign}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
          </AlertDialogHeader>
          {usageCount > 0 ? (
            <div className="space-y-3">
              {canReassign ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    This category is linked to {usageCount} item{usageCount === 1 ? '' : 's'}. Choose a category to move them to.
                  </p>
                  <Select value={reassignTo} onValueChange={setReassignTo}>
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Reassign to" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTargets.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add another category before deleting this one.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This removes the category from your list.
            </p>
          )}
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(id, usageCount > 0 ? reassignTo : undefined)}
              disabled={usageCount > 0 && !canReassign}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryManager;
