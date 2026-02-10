import { useMemo, useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import ExpenseList from '@/components/ExpenseList';
import { subMonths, startOfMonth, format, subDays, startOfDay, subYears, startOfYear } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const MONTHS = 6;
const DAYS = 14;
const YEARS = 5;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const InsightsAnalytics = () => {
  const { expenses, incomes } = useExpenses();
  const [cashflowView, setCashflowView] = useState<'monthly' | 'daily' | 'yearly'>('monthly');

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

  const dailyData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = Array.from({ length: DAYS }, (_, index) => {
      const dayDate = subDays(today, DAYS - 1 - index);
      const key = format(dayDate, 'yyyy-MM-dd');
      return {
        key,
        label: format(dayDate, 'MMM d'),
        income: 0,
        expense: 0,
      };
    });

    const dayIndex = new Map(days.map((d, idx) => [d.key, idx]));

    expenses.forEach(expense => {
      const dayKey = expense.date;
      const idx = dayIndex.get(dayKey);
      if (idx !== undefined) days[idx].expense += expense.amount;
    });

    incomes.forEach(income => {
      const dayKey = income.date;
      const idx = dayIndex.get(dayKey);
      if (idx !== undefined) days[idx].income += income.amount;
    });

    return days;
  }, [expenses, incomes]);

  const yearlyData = useMemo(() => {
    const now = new Date();
    const base = startOfYear(now);
    const years = Array.from({ length: YEARS }, (_, index) => {
      const yearDate = subYears(base, YEARS - 1 - index);
      const key = format(yearDate, 'yyyy');
      return {
        key,
        label: format(yearDate, 'yyyy'),
        income: 0,
        expense: 0,
      };
    });

    const yearIndex = new Map(years.map((y, idx) => [y.key, idx]));

    expenses.forEach(expense => {
      const yearKey = format(new Date(expense.date), 'yyyy');
      const idx = yearIndex.get(yearKey);
      if (idx !== undefined) years[idx].expense += expense.amount;
    });

    incomes.forEach(income => {
      const yearKey = format(new Date(income.date), 'yyyy');
      const idx = yearIndex.get(yearKey);
      if (idx !== undefined) years[idx].income += income.amount;
    });

    return years;
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
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-foreground">
              {cashflowView === 'monthly'
                ? 'Monthly Cashflow'
                : cashflowView === 'daily'
                  ? 'Daily Cashflow (Last 14 Days)'
                  : 'Yearly Cashflow (Last 5 Years)'}
            </h4>
            <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1 text-xs">
              <button
                type="button"
                onClick={() => setCashflowView('monthly')}
                className={`px-2.5 py-1 rounded-full ${cashflowView === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setCashflowView('daily')}
                className={`px-2.5 py-1 rounded-full ${cashflowView === 'daily' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setCashflowView('yearly')}
                className={`px-2.5 py-1 rounded-full ${cashflowView === 'yearly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                Yearly
              </button>
            </div>
          </div>
          <ChartContainer
            className="h-56 w-full"
            config={{
              income: { label: 'Income', color: 'hsl(var(--income))' },
              expense: { label: 'Expense', color: 'hsl(var(--expense))' },
            }}
          >
            <LineChart
              data={
                cashflowView === 'monthly'
                  ? monthlyData
                  : cashflowView === 'daily'
                    ? dailyData
                    : yearlyData
              }
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => (value >= 1000 ? `${Math.round(value / 1000)}k` : `${Math.round(value)}`)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                strokeWidth={2}
                dot={{ r: cashflowView === 'monthly' ? 3 : cashflowView === 'daily' ? 2 : 3 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="var(--color-expense)"
                strokeWidth={2}
                dot={{ r: cashflowView === 'monthly' ? 3 : cashflowView === 'daily' ? 2 : 3 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <ExpenseList />

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
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_200px] lg:items-center">
              <ChartContainer
                className="h-56 w-full min-w-0"
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
              <div className="max-h-52 w-full overflow-auto pr-1 text-xs min-w-0">
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
