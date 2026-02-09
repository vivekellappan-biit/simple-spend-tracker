import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}

export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  day_of_month: number;
  frequency: 'monthly' | 'yearly' | 'custom';
  interval_days: number | null;
  month_of_year: number | null;
  start_date: string;
  last_added_date: string | null;
  active: boolean;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
}

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Health',
  'Education',
  'Other',
];

interface ExpenseContextType {
  initialBalance: number | null;
  expenses: Expense[];
  incomes: Income[];
  recurringExpenses: RecurringExpense[];
  categories: ExpenseCategory[];
  setInitialBalance: (amount: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => void;
  updateExpense: (id: string, updates: Pick<Expense, 'description' | 'amount' | 'category' | 'date'>) => void;
  deleteExpense: (id: string) => void;
  addIncome: (income: Omit<Income, 'id' | 'created_at'>) => void;
  deleteIncome: (id: string) => void;
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id' | 'created_at' | 'last_added_date'>) => void;
  updateRecurringExpense: (id: string, updates: Partial<Omit<RecurringExpense, 'id' | 'created_at'>>) => void;
  deleteRecurringExpense: (id: string) => void;
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string, previousName: string) => void;
  deleteCategory: (id: string) => void;
  currentBalance: number;
  totalExpenses: number;
  totalIncome: number;
  loading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [initialBalance, setInitialBalanceState] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const getDueDate = (year: number, monthIndex: number, dayOfMonth: number) => {
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const safeDay = Math.min(Math.max(dayOfMonth, 1), lastDay);
    return new Date(year, monthIndex, safeDay);
  };

  const getYearlyDueDate = (year: number, monthOfYear: number, dayOfMonth: number) => {
    const monthIndex = Math.min(Math.max(monthOfYear, 1), 12) - 1;
    return getDueDate(year, monthIndex, dayOfMonth);
  };

  const applyRecurringExpenses = useCallback(async (items: RecurringExpense[]) => {
    if (!user || items.length === 0) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    for (const item of items) {
      if (!item.active) continue;

      const startDate = new Date(item.start_date);
      if (today < startDate) continue;

      if (item.last_added_date) {
        const lastAdded = new Date(item.last_added_date);
        if (item.frequency === 'monthly' && lastAdded.getFullYear() === year && lastAdded.getMonth() === month) {
          continue;
        }
        if (item.frequency === 'yearly' && lastAdded.getFullYear() === year) {
          continue;
        }
        if (item.frequency === 'custom' && item.interval_days) {
          const nextDue = new Date(lastAdded);
          nextDue.setDate(nextDue.getDate() + item.interval_days);
          if (today < nextDue) continue;
        }
      }

      let dueDate: Date | null = null;
      if (item.frequency === 'monthly') {
        dueDate = getDueDate(year, month, Number(item.day_of_month));
      } else if (item.frequency === 'yearly' && item.month_of_year) {
        dueDate = getYearlyDueDate(year, item.month_of_year, Number(item.day_of_month));
      } else if (item.frequency === 'custom' && item.interval_days) {
        const start = new Date(item.last_added_date || item.start_date);
        const candidate = new Date(start);
        candidate.setDate(candidate.getDate() + item.interval_days);
        dueDate = candidate;
      }

      if (!dueDate || today < dueDate) continue;

      const dueDateString = formatDate(dueDate);
      const { data, error } = await supabase.from('expenses').insert({
        user_id: user.id,
        description: item.description,
        amount: Number(item.amount),
        category: item.category,
        date: dueDateString,
      }).select().single();

      if (!error && data) {
        setExpenses(prev => [{ ...data, amount: Number(data.amount) }, ...prev]);
        await supabase
          .from('recurring_expenses')
          .update({ last_added_date: dueDateString })
          .eq('id', item.id)
          .eq('user_id', user.id);
        setRecurringExpenses(prev =>
          prev.map(expense =>
            expense.id === item.id ? { ...expense, last_added_date: dueDateString } : expense
          )
        );
      }
    }
  }, [user]);

  // Fetch balance and expenses on mount
  useEffect(() => {
    if (!user) {
      setInitialBalanceState(null);
      setExpenses([]);
      setIncomes([]);
      setRecurringExpenses([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const [balanceRes, expensesRes, incomesRes, recurringRes, categoriesRes] = await Promise.all([
        supabase.from('balances').select('initial_balance').eq('user_id', user.id).maybeSingle(),
        supabase.from('expenses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('incomes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('recurring_expenses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('expense_categories').select('*').eq('user_id', user.id).order('name', { ascending: true }),
      ]);

      if (balanceRes.data) {
        setInitialBalanceState(Number(balanceRes.data.initial_balance));
      } else {
        setInitialBalanceState(null);
      }

      if (expensesRes.data) {
        setExpenses(expensesRes.data.map(e => ({
          ...e,
          amount: Number(e.amount),
        })));
      }

      if (incomesRes.data) {
        setIncomes(incomesRes.data.map(i => ({
          ...i,
          amount: Number(i.amount),
        })));
      }

      if (recurringRes.data) {
        const normalizedRecurring = recurringRes.data.map(e => ({
          ...e,
          amount: Number(e.amount),
          day_of_month: Number(e.day_of_month),
          interval_days: e.interval_days === null ? null : Number(e.interval_days),
          month_of_year: e.month_of_year === null ? null : Number(e.month_of_year),
          frequency: (e.frequency as RecurringExpense['frequency']) || 'monthly',
        }));
        setRecurringExpenses(normalizedRecurring);
        await applyRecurringExpenses(normalizedRecurring);
      }

      if (categoriesRes.data && categoriesRes.data.length > 0) {
        setCategories(categoriesRes.data);
      } else {
        const defaults = DEFAULT_CATEGORIES.map(name => ({ name, user_id: user.id }));
        const { data: inserted } = await supabase
          .from('expense_categories')
          .insert(defaults)
          .select();
        if (inserted && inserted.length > 0) {
          setCategories(inserted);
        } else {
          setCategories(DEFAULT_CATEGORIES.map((name, idx) => ({
            id: `default-${idx}`,
            name,
            created_at: new Date().toISOString(),
          })));
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user, applyRecurringExpenses]);

  const setInitialBalance = useCallback(async (amount: number) => {
    if (!user) return;
    setInitialBalanceState(amount);

    const { error } = await supabase.from('balances').upsert(
      { user_id: user.id, initial_balance: amount },
      { onConflict: 'user_id' }
    );

    if (error) {
      toast({ title: 'Error', description: 'Failed to save balance', variant: 'destructive' });
    }
  }, [user, toast]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'created_at'>) => {
    if (!user) return;

    const { data, error } = await supabase.from('expenses').insert({
      user_id: user.id,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
    }).select().single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to add expense', variant: 'destructive' });
      return;
    }

    if (data) {
      setExpenses(prev => [{ ...data, amount: Number(data.amount) }, ...prev]);
    }
  }, [user, toast]);

  const addIncome = useCallback(async (income: Omit<Income, 'id' | 'created_at'>) => {
    if (!user) return;

    const { data, error } = await supabase.from('incomes').insert({
      user_id: user.id,
      description: income.description,
      amount: income.amount,
      date: income.date,
    }).select().single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to add income', variant: 'destructive' });
      return;
    }

    if (data) {
      setIncomes(prev => [{ ...data, amount: Number(data.amount) }, ...prev]);
    }
  }, [user, toast]);

  const deleteIncome = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase.from('incomes').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete income', variant: 'destructive' });
      return;
    }
    setIncomes(prev => prev.filter(i => i.id !== id));
  }, [user, toast]);

  const addRecurringExpense = useCallback(async (expense: Omit<RecurringExpense, 'id' | 'created_at' | 'last_added_date'>) => {
    if (!user) return;

    const { data, error } = await supabase.from('recurring_expenses').insert({
      user_id: user.id,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      day_of_month: expense.day_of_month,
      frequency: expense.frequency,
      interval_days: expense.interval_days,
      month_of_year: expense.month_of_year,
      start_date: expense.start_date,
      active: expense.active,
    }).select().single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to add recurring expense', variant: 'destructive' });
      return;
    }

    if (data) {
      const normalized = {
        ...data,
        amount: Number(data.amount),
        day_of_month: Number(data.day_of_month),
        interval_days: data.interval_days === null ? null : Number(data.interval_days),
        month_of_year: data.month_of_year === null ? null : Number(data.month_of_year),
      };
      setRecurringExpenses(prev => [normalized, ...prev]);
      await applyRecurringExpenses([normalized]);
    }
  }, [user, toast, applyRecurringExpenses]);

  const updateRecurringExpense = useCallback(async (id: string, updates: Partial<Omit<RecurringExpense, 'id' | 'created_at'>>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('recurring_expenses')
      .update({
        description: updates.description,
        amount: updates.amount,
        category: updates.category,
        day_of_month: updates.day_of_month,
        frequency: updates.frequency,
        interval_days: updates.interval_days,
        month_of_year: updates.month_of_year,
        start_date: updates.start_date,
        last_added_date: updates.last_added_date,
        active: updates.active,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to update recurring expense', variant: 'destructive' });
      return;
    }

    if (data) {
      setRecurringExpenses(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...data,
                amount: Number(data.amount),
                day_of_month: Number(data.day_of_month),
                interval_days: data.interval_days === null ? null : Number(data.interval_days),
                month_of_year: data.month_of_year === null ? null : Number(data.month_of_year),
              }
            : item
        )
      );
    }
  }, [user, toast]);

  const deleteRecurringExpense = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete recurring expense', variant: 'destructive' });
      return;
    }
    setRecurringExpenses(prev => prev.filter(item => item.id !== id));
  }, [user, toast]);

  const addCategory = useCallback(async (name: string) => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from('expense_categories')
      .insert({ user_id: user.id, name: trimmed })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to add category', variant: 'destructive' });
      return;
    }

    if (data) {
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, [user, toast]);

  const updateCategory = useCallback(async (id: string, name: string, previousName: string) => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from('expense_categories')
      .update({ name: trimmed })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
      return;
    }

    if (data) {
      setCategories(prev => prev.map(cat => (cat.id === id ? data : cat)).sort((a, b) => a.name.localeCompare(b.name)));
      setExpenses(prev => prev.map(exp => (exp.category === previousName ? { ...exp, category: trimmed } : exp)));
      setRecurringExpenses(prev => prev.map(exp => (exp.category === previousName ? { ...exp, category: trimmed } : exp)));
      await supabase
        .from('expenses')
        .update({ category: trimmed })
        .eq('user_id', user.id)
        .eq('category', previousName);
      await supabase
        .from('recurring_expenses')
        .update({ category: trimmed })
        .eq('user_id', user.id)
        .eq('category', previousName);
    }
  }, [user, toast]);

  const deleteCategory = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('expense_categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
      return;
    }
    setCategories(prev => prev.filter(cat => cat.id !== id));
  }, [user, toast]);

  const updateExpense = useCallback(async (id: string, updates: Pick<Expense, 'description' | 'amount' | 'category' | 'date'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('expenses')
      .update({
        description: updates.description,
        amount: updates.amount,
        category: updates.category,
        date: updates.date,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to update expense', variant: 'destructive' });
      return;
    }

    if (data) {
      setExpenses(prev =>
        prev.map(expense =>
          expense.id === id ? { ...data, amount: Number(data.amount) } : expense
        )
      );
    }
  }, [user, toast]);

  const deleteExpense = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete expense', variant: 'destructive' });
      return;
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, [user, toast]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const currentBalance = (initialBalance ?? 0) + totalIncome - totalExpenses;

  return (
    <ExpenseContext.Provider value={{
      initialBalance,
      expenses,
      incomes,
      recurringExpenses,
      categories,
      setInitialBalance,
      addExpense,
      updateExpense,
      deleteExpense,
      addIncome,
      deleteIncome,
      addRecurringExpense,
      updateRecurringExpense,
      deleteRecurringExpense,
      addCategory,
      updateCategory,
      deleteCategory,
      currentBalance,
      totalExpenses,
      totalIncome,
      loading,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenses must be used within ExpenseProvider');
  return context;
};
