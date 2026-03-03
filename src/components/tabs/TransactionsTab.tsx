import { useState } from 'react';
import ExpenseList from '@/components/ExpenseList';
import IncomeList from '@/components/IncomeList';
import LendBorrowList from '@/components/LendBorrowList';

type SubTab = 'expenses' | 'income' | 'lend';

const TransactionsTab = () => {
  const [subTab, setSubTab] = useState<SubTab>('expenses');

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
        {([
          { key: 'expenses', label: 'Expenses' },
          { key: 'income', label: 'Income' },
          { key: 'lend', label: 'Lend/Borrow' },
        ] as const).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setSubTab(item.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              subTab === item.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {subTab === 'expenses' && <ExpenseList />}
      {subTab === 'income' && <IncomeList />}
      {subTab === 'lend' && <LendBorrowList />}
    </div>
  );
};

export default TransactionsTab;
