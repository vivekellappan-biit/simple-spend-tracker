import { useExpenses } from '@/context/ExpenseContext';
import { useEffect, useState } from 'react';
import BalanceCard from '@/components/BalanceCard';
import AISpendingPattern from '@/components/AISpendingPattern';
import ChatEntry from '@/components/ChatEntry';
import InsightsAnalytics from '@/components/InsightsAnalytics';
import ExpenseForm from '@/components/ExpenseForm';
import IncomeForm from '@/components/IncomeForm';
import ExpenseList from '@/components/ExpenseList';
import IncomeList from '@/components/IncomeList';
import LendBorrowForm from '@/components/LendBorrowForm';
import LendBorrowList from '@/components/LendBorrowList';
import RecurringExpenses from '@/components/RecurringExpenses';
import CategoryManager from '@/components/CategoryManager';
import BalanceSetup from '@/components/BalanceSetup';
import { CalendarClock, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { initialBalance, loading } = useExpenses();
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (initialBalance === null) {
    return <BalanceSetup />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/15 via-primary/5 to-card p-4 shadow-sm">
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.14em] text-primary/90 font-semibold">Dashboard</p>
              <h1 className="text-xl font-bold text-foreground">Expense Tracker</h1>
              <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-primary" />
                {now.toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-primary/20 bg-background/80 p-1">
              <ThemeToggle />
              <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/10" title="Settings">
                <Link to="/settings">
                  <Settings className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <BalanceCard />
        <ChatEntry />
        <AISpendingPattern />
        <InsightsAnalytics />
        <ExpenseForm isOpen={expenseFormOpen} onOpenChange={setExpenseFormOpen} />
        <IncomeForm />
        <RecurringExpenses />
        <CategoryManager />
        <IncomeList />
        <LendBorrowForm />
        <LendBorrowList />
      </div>
      <Button
        className="fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full shadow-lg"
        size="icon"
        onClick={() => setExpenseFormOpen(true)}
        title="Add expense"
      >
        <Plus className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Dashboard;
