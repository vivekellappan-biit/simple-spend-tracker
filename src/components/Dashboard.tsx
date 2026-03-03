import { useExpenses } from '@/context/ExpenseContext';
import { useEffect, useState } from 'react';
import BalanceSetup from '@/components/BalanceSetup';
import BottomNav, { TabId } from '@/components/BottomNav';
import HomeTab from '@/components/tabs/HomeTab';
import AnalyticsTab from '@/components/tabs/AnalyticsTab';
import TransactionsTab from '@/components/tabs/TransactionsTab';
import SettingsTab from '@/components/tabs/SettingsTab';
import ThemeToggle from '@/components/ThemeToggle';
import { AnimatePresence, motion } from 'framer-motion';

const TAB_TITLES: Record<TabId, string> = {
  home: 'Simple Spend',
  analytics: 'Analytics',
  transactions: 'Activity',
  settings: 'Settings',
};

const Dashboard = () => {
  const { initialBalance, loading } = useExpenses();
  const [activeTab, setActiveTab] = useState<TabId>('home');

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
      <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {TAB_TITLES[activeTab]}
          </h1>
          <ThemeToggle />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'home' && <HomeTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'transactions' && <TransactionsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;
