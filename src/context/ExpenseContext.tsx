import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  createdAt: number;
}

interface ExpenseContextType {
  initialBalance: number | null;
  expenses: Expense[];
  setInitialBalance: (amount: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  currentBalance: number;
  totalExpenses: number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [initialBalance, setInitialBalanceState] = useState<number | null>(() => {
    const saved = localStorage.getItem('expense-tracker-balance');
    return saved ? Number(saved) : null;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expense-tracker-expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const setInitialBalance = useCallback((amount: number) => {
    setInitialBalanceState(amount);
    localStorage.setItem('expense-tracker-balance', String(amount));
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setExpenses(prev => {
      const updated = [newExpense, ...prev];
      localStorage.setItem('expense-tracker-expenses', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => {
      const updated = prev.filter(e => e.id !== id);
      localStorage.setItem('expense-tracker-expenses', JSON.stringify(updated));
      return updated;
    });
  }, []);

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
