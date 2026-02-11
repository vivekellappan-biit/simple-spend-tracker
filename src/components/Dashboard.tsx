import { useExpenses } from '@/context/ExpenseContext';
import { useState } from 'react';
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
import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { initialBalance, loading } = useExpenses();
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);

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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Expense Tracker</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
            <ThemeToggle />
            <Button asChild variant="ghost" size="icon" title="Settings">
              <Link to="/settings">
                <Settings className="w-4 h-4" />
              </Link>
            </Button>
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
