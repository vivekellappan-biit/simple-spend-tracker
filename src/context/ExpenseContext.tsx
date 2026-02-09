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

interface ExpenseContextType {
  initialBalance: number | null;
  expenses: Expense[];
  setInitialBalance: (amount: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => void;
  deleteExpense: (id: string) => void;
  currentBalance: number;
  totalExpenses: number;
  loading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [initialBalance, setInitialBalanceState] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch balance and expenses on mount
  useEffect(() => {
    if (!user) {
      setInitialBalanceState(null);
      setExpenses([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const [balanceRes, expensesRes] = await Promise.all([
        supabase.from('balances').select('initial_balance').eq('user_id', user.id).maybeSingle(),
        supabase.from('expenses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
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
      setLoading(false);
    };

    fetchData();
  }, [user]);

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
  const currentBalance = (initialBalance ?? 0) - totalExpenses;

  return (
    <ExpenseContext.Provider value={{
      initialBalance,
      expenses,
      setInitialBalance,
      addExpense,
      deleteExpense,
      currentBalance,
      totalExpenses,
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
