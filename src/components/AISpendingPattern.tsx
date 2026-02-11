import { useMemo, useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface PatternResponse {
  summary: string;
  patterns: string[];
  risks: string[];
  actions: string[];
}

const RECENT_MONTHS = 6;

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

const AISpendingPattern = () => {
  const { expenses, incomes, lendBorrowEntries } = useExpenses();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PatternResponse | null>(null);

  const snapshot = useMemo(() => {
    const now = new Date();
    const byMonth = new Map<string, { month: string; income: number; expense: number }>();

    for (let i = RECENT_MONTHS - 1; i >= 0; i -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthDate.toISOString().slice(0, 7);
      byMonth.set(key, {
        month: formatMonthLabel(monthDate),
        income: 0,
        expense: 0,
      });
    }

    expenses.forEach((expense) => {
      const key = expense.date.slice(0, 7);
      const current = byMonth.get(key);
      if (current) current.expense += expense.amount;
    });

    incomes.forEach((income) => {
      const key = income.date.slice(0, 7);
      const current = byMonth.get(key);
      if (current) current.income += income.amount;
    });

    const categoryTotals = new Map<string, number>();
    expenses.forEach((expense) => {
      categoryTotals.set(expense.category, (categoryTotals.get(expense.category) ?? 0) + expense.amount);
    });

    const topCategories = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    const monthlySeries = Array.from(byMonth.values());
    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
    const openLent = lendBorrowEntries
      .filter((item) => item.type === 'lent' && item.status === 'open')
      .reduce((sum, item) => sum + item.amount, 0);
    const openBorrowed = lendBorrowEntries
      .filter((item) => item.type === 'borrowed' && item.status === 'open')
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      monthsAnalyzed: RECENT_MONTHS,
      totals: {
        income: totalIncome,
        expense: totalExpense,
        net: totalIncome - totalExpense,
      },
      monthlySeries,
      topCategories,
      outstanding: {
        lent: openLent,
        borrowed: openBorrowed,
      },
      transactionCounts: {
        expenses: expenses.length,
        incomes: incomes.length,
      },
    };
  }, [expenses, incomes, lendBorrowEntries]);

  const parseModelResponse = (rawText: string): PatternResponse => {
    const parsed = JSON.parse(rawText) as Partial<PatternResponse>;
    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : 'Your spending has clear concentration in a few categories.',
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns.slice(0, 5).map(String) : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks.slice(0, 5).map(String) : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 5).map(String) : [],
    };
  };

  const analyzePattern = async () => {
    if (expenses.length === 0) {
      toast({ title: 'No data yet', description: 'Add a few expenses first to analyze spending patterns.' });
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      toast({
        title: 'Gemini key missing',
        description: 'Add VITE_GEMINI_API_KEY in .env and reload the app.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const prompt = `You are a personal finance analyst. Analyze this JSON snapshot and find spending patterns. Return strict JSON only using this shape:\n{\n  "summary": "short summary",\n  "patterns": ["..."],\n  "risks": ["..."],\n  "actions": ["..."]\n}\nRules:\n- Keep summary under 25 words.\n- Each bullet under 16 words.\n- Focus on pattern detection, risk signals, and practical actions.\n- Do not include markdown.\n\nSnapshot:\n${JSON.stringify(snapshot)}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to analyze spending pattern');
      }

      const data = await response.json();
      const outputText = data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? '')
        .join('')
        .trim();

      if (!outputText) {
        throw new Error('Gemini returned an empty response');
      }

      setResult(parseModelResponse(outputText));
    } catch (error) {
      toast({
        title: 'AI analysis failed',
        description: error instanceof Error ? error.message : 'Try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI Spending Pattern</h3>
          <p className="text-xs text-muted-foreground">Analyze the last {RECENT_MONTHS} months and get focused recommendations.</p>
        </div>
        <Button onClick={analyzePattern} disabled={loading} className="h-9 gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Analyzing' : 'Analyze'}
        </Button>
      </div>

      {result ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-sm text-foreground">{result.summary}</p>
          </div>

          <Section title="Patterns" items={result.patterns} emptyLabel="No clear pattern found yet." />
          <Section title="Risk Signals" items={result.risks} emptyLabel="No major risk signals detected." />
          <Section title="Suggested Actions" items={result.actions} emptyLabel="No action suggested yet." />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-background/60 p-3 text-xs text-muted-foreground">
          Run AI analysis to discover your spending behavior and next best actions.
        </div>
      )}
    </div>
  );
};

const Section = ({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) => (
  <div className="space-y-1.5">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
    {items.length === 0 ? (
      <p className="text-xs text-muted-foreground">{emptyLabel}</p>
    ) : (
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="text-sm text-foreground flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default AISpendingPattern;
