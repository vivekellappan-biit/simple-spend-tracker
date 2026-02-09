import { useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { subMonths, startOfMonth, format } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';

const MONTHS = 6;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const InsightsAnalytics = () => {
  const { expenses, incomes, categories } = useExpenses();

  const monthlyData = useMemo(() => {
    const now = new Date();
    const base = startOfMonth(now);
    const months = Array.from({ length: MONTHS }, (_, index) => {
      const monthDate = subMonths(base, MONTHS - 1 - index);
      const key = format(monthDate, 'yyyy-MM');
      return {
        key,
        label: format(monthDate, 'MMM yy'),
        income: 0,
        expense: 0,
      };
    });

    const monthIndex = new Map(months.map((m, idx) => [m.key, idx]));

    expenses.forEach(expense => {
      const monthKey = format(new Date(expense.date), 'yyyy-MM');
      const idx = monthIndex.get(monthKey);
      if (idx !== undefined) months[idx].expense += expense.amount;
    });

    incomes.forEach(income => {
      const monthKey = format(new Date(income.date), 'yyyy-MM');
      const idx = monthIndex.get(monthKey);
      if (idx !== undefined) months[idx].income += income.amount;
    });

    return months;
  }, [expenses, incomes]);

  const monthlySummary = useMemo(() => {
    return monthlyData.map((month, index) => {
      const net = month.income - month.expense;
      const previous = monthlyData[index - 1];
      const change = previous ? month.expense - previous.expense : 0;
      const changePct = previous && previous.expense > 0 ? (change / previous.expense) * 100 : null;
      return {
        ...month,
        net,
        change,
        changePct,
      };
    });
  }, [monthlyData]);

  const categoryData = useMemo(() => {
    const totals = new Map<string, number>();
    expenses.forEach(expense => {
      totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
    });

    const items = Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    if (items.length <= 5) return items;

    const top = items.slice(0, 5);
    const restTotal = items.slice(5).reduce((sum, item) => sum + item.value, 0);
    return [...top, { name: 'Other', value: restTotal }];
  }, [expenses]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-card rounded-2xl border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">Monthly Cashflow</h4>
          <ChartContainer
            className="h-56 w-full"
            config={{
              income: { label: 'Income', color: 'hsl(var(--income))' },
              expense: { label: 'Expense', color: 'hsl(var(--expense))' },
            }}
          >
            <BarChart data={monthlyData} barGap={8}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="income" radius={[6, 6, 0, 0]} fill="var(--color-income)" />
              <Bar dataKey="expense" radius={[6, 6, 0, 0]} fill="var(--color-expense)" />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">Monthly Summary</h4>
          <div className="space-y-2">
            {monthlySummary.map((month, index) => {
              const changeLabel =
                month.changePct === null
                  ? "—"
                  : `${month.changePct >= 0 ? "+" : ""}${month.changePct.toFixed(0)}%`;
              return (
                <div
                  key={month.key}
                  className="grid grid-cols-[80px_1fr_1fr_1fr] items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs"
                >
                  <span className="font-medium text-foreground">{month.label}</span>
                  <span className="text-income font-mono">{formatCurrency(month.income)}</span>
                  <span className="text-expense font-mono">{formatCurrency(month.expense)}</span>
                  <div className="flex items-center justify-end gap-2">
                    <span className={`font-mono ${month.net >= 0 ? "text-income" : "text-expense"}`}>
                      {formatCurrency(month.net)}
                    </span>
                    <span className={`font-mono ${month.change >= 0 ? "text-expense" : "text-income"}`}>
                      {changeLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Columns: Income, Spending, Net, and month-over-month spend change.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">Spend By Category</h4>
          {categoryData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Add expenses to see category insights.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_160px] sm:items-center">
              <ChartContainer
                className="h-56 w-full"
                config={Object.fromEntries(
                  categoryData.map((item, index) => [
                    item.name,
                    {
                      label: item.name,
                      color: `hsl(var(--chart-${(index % 5) + 1}))`,
                    },
                  ]),
                )}
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="space-y-2 text-xs">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                    />
                    <span className="flex-1 text-muted-foreground">{entry.name}</span>
                    <span className="font-mono text-foreground">
                      {formatCurrency(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsAnalytics;
