import { useExpenses } from '@/context/ExpenseContext';
import BalanceCard from '@/components/BalanceCard';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import BalanceSetup from '@/components/BalanceSetup';

const Dashboard = () => {
  const { initialBalance } = useExpenses();

  if (initialBalance === null) {
    return <BalanceSetup />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Expense Tracker</h1>
          <span className="text-xs text-muted-foreground font-mono">
            {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>

        <BalanceCard />
        <ExpenseForm />
        <ExpenseList />
      </div>
    </div>
  );
};

export default Dashboard;
