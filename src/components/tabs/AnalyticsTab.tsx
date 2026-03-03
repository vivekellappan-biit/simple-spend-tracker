import AISpendingPattern from '@/components/AISpendingPattern';
import InsightsAnalytics from '@/components/InsightsAnalytics';

const AnalyticsTab = () => {
  return (
    <div className="space-y-4 pb-4">
      <InsightsAnalytics />
      <AISpendingPattern />
    </div>
  );
};

export default AnalyticsTab;
