import { ExpenseProvider } from '@/context/ExpenseContext';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  return (
    <ExpenseProvider>
      <Dashboard />
    </ExpenseProvider>
  );
};

export default Index;
