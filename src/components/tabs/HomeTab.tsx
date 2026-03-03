import { useState } from 'react';
import BalanceCard from '@/components/BalanceCard';
import ChatEntry from '@/components/ChatEntry';
import ExpenseForm from '@/components/ExpenseForm';
import IncomeForm from '@/components/IncomeForm';
import LendBorrowForm from '@/components/LendBorrowForm';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomeTab = () => {
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);

  return (
    <div className="space-y-4 pb-4">
      <BalanceCard />
      <ChatEntry />

      <ExpenseForm isOpen={expenseFormOpen} onOpenChange={setExpenseFormOpen} />
      <IncomeForm />
      <LendBorrowForm />

      <Button
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg shadow-primary/25"
        size="icon"
        onClick={() => setExpenseFormOpen(true)}
        title="Add expense"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default HomeTab;
