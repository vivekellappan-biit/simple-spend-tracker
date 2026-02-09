import { useExpenses } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import BalanceCard from '@/components/BalanceCard';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import BalanceSetup from '@/components/BalanceSetup';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { initialBalance, loading } = useExpenses();
  const { signOut } = useAuth();

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
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <BalanceCard />
        <ExpenseForm />
        <ExpenseList />
      </div>
    </div>
  );
};

export default Dashboard;
