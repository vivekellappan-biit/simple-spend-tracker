import { useEffect, useMemo, useRef, useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Mic, Send } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type ParsedIntent = {
  type: 'expense' | 'income';
  amount: number;
  description: string;
};

type CategoryModel = {
  descriptionCategoryMap: Map<string, string>;
  tokenCategoryMap: Map<string, Map<string, number>>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const EXPENSE_KEYWORDS = ['spent', 'expense', 'paid', 'bought', 'debit', 'purchase'];
const INCOME_KEYWORDS = ['income', 'earned', 'salary', 'received', 'credit', 'bonus'];
const IGNORE_WORDS = new Set([
  'add',
  'new',
  'expense',
  'income',
  'spent',
  'paid',
  'bought',
  'debit',
  'purchase',
  'earned',
  'salary',
  'received',
  'credit',
  'bonus',
  'on',
  'for',
  'as',
  'the',
  'a',
  'an',
  'to',
  'from',
]);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const normalizeText = (text: string) => text.toLowerCase().trim();

const createMessageId = () => {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const extractAmount = (text: string): number | null => {
  const match = text.match(/(\d[\d,]*(?:\.\d{1,2})?)/);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
};

const tokenizeText = (value: string) =>
  normalizeText(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !IGNORE_WORDS.has(token));

const buildCategoryModel = (
  expenses: { description: string; category: string }[],
): CategoryModel => {
  const descriptionVotes = new Map<string, Map<string, number>>();
  const tokenCategoryMap = new Map<string, Map<string, number>>();

  expenses.forEach((expense) => {
    const descKey = normalizeText(expense.description);
    const descMap = descriptionVotes.get(descKey) ?? new Map<string, number>();
    descMap.set(expense.category, (descMap.get(expense.category) ?? 0) + 1);
    descriptionVotes.set(descKey, descMap);

    tokenizeText(expense.description).forEach((token) => {
      const categoryVotes = tokenCategoryMap.get(token) ?? new Map<string, number>();
      categoryVotes.set(expense.category, (categoryVotes.get(expense.category) ?? 0) + 1);
      tokenCategoryMap.set(token, categoryVotes);
    });
  });

  const descriptionCategoryMap = new Map<string, string>();
  descriptionVotes.forEach((votes, description) => {
    const topCategory = Array.from(votes.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topCategory) descriptionCategoryMap.set(description, topCategory);
  });

  return { descriptionCategoryMap, tokenCategoryMap };
};

const inferCategoryFromHistory = (
  rawText: string,
  description: string,
  categories: { name: string }[],
  model: CategoryModel,
) => {
  const normalizedRaw = normalizeText(rawText);
  const explicitCategory = categories.find((cat) =>
    normalizedRaw.includes(cat.name.toLowerCase()),
  )?.name;
  if (explicitCategory) return explicitCategory;

  const descriptionMatch = model.descriptionCategoryMap.get(normalizeText(description));
  if (descriptionMatch) return descriptionMatch;

  const tokens = [...tokenizeText(rawText), ...tokenizeText(description)];
  const scores = new Map<string, number>();
  tokens.forEach((token) => {
    const categoryVotes = model.tokenCategoryMap.get(token);
    if (!categoryVotes) return;
    categoryVotes.forEach((count, category) => {
      scores.set(category, (scores.get(category) ?? 0) + count);
    });
  });

  const ranked = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
  if (!ranked[0] || ranked[0][1] <= 0) return undefined;
  return ranked[0][0];
};

const parseChatIntent = (rawText: string): ParsedIntent | null => {
  const normalized = normalizeText(rawText);
  const amount = extractAmount(normalized);
  if (!amount) return null;

  const hasExpenseKeyword = EXPENSE_KEYWORDS.some((word) => normalized.includes(word));
  const hasIncomeKeyword = INCOME_KEYWORDS.some((word) => normalized.includes(word));

  let type: ParsedIntent['type'] | null = null;
  if (hasExpenseKeyword && !hasIncomeKeyword) type = 'expense';
  if (hasIncomeKeyword && !hasExpenseKeyword) type = 'income';

  if (!type) {
    if (normalized.startsWith('expense') || normalized.startsWith('add expense')) type = 'expense';
    if (normalized.startsWith('income') || normalized.startsWith('add income')) type = 'income';
  }

  if (!type) return null;

  const cleanedDescription = rawText
    .replace(/(\d[\d,]*(?:\.\d{1,2})?)/, '')
    .replace(/\b(add|new|expense|income|spent|paid|bought|debit|purchase|earned|salary|received|credit|bonus|on|for|as)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    type,
    amount,
    description: cleanedDescription || (type === 'expense' ? 'Expense' : 'Income'),
  };
};

const ChatEntry = () => {
  const { addExpense, addIncome, categories, expenses } = useExpenses();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Add by chat. Example: "Spent 450 on Food & Dining lunch" or "Received 25000 salary".',
    },
  ]);

  const defaultExpenseCategory = useMemo(
    () =>
      categories.find((cat) => cat.name.toLowerCase() === 'other')?.name ||
      categories[0]?.name ||
      'Other',
    [categories],
  );

  const categoryModel = useMemo(
    () =>
      buildCategoryModel(
        expenses.map((expense) => ({
          description: expense.description,
          category: expense.category,
        })),
      ),
    [expenses],
  );

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const getSpeechRecognitionCtor = (): SpeechRecognitionCtor | null => {
    if (typeof window === 'undefined') return null;
    const w = window as Window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
  };

  const speechRecognitionSupported = useMemo(() => Boolean(getSpeechRecognitionCtor()), []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const ensureMicrophonePermission = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      return false;
    }
  };

  const pushMessage = (role: Message['role'], text: string) => {
    setMessages((prev) => [...prev, { id: createMessageId(), role, text }]);
  };

  const submitText = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    pushMessage('user', text);

    const parsed = parseChatIntent(text);
    if (!parsed) {
      pushMessage(
        'assistant',
        'Could not understand. Try: "Spent 500 on groceries" or "Income 30000 salary".',
      );
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (parsed.type === 'expense') {
      const learnedCategory =
        inferCategoryFromHistory(text, parsed.description, categories, categoryModel) ||
        defaultExpenseCategory;
      addExpense({
        description: parsed.description,
        amount: parsed.amount,
        category: learnedCategory,
        date: today,
      });
      pushMessage(
        'assistant',
        `Added expense ${formatCurrency(parsed.amount)} for "${parsed.description}" in ${learnedCategory}.`,
      );
      return;
    }

    addIncome({
      description: parsed.description,
      amount: parsed.amount,
      date: today,
    });
    pushMessage(
      'assistant',
      `Added income ${formatCurrency(parsed.amount)} for "${parsed.description}".`,
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitText(input);
    setInput('');
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const RecognitionCtor = getSpeechRecognitionCtor();
    if (!RecognitionCtor) {
      pushMessage(
        'assistant',
        'Voice input is not supported in this browser. Use Chrome/Edge on HTTPS/local network.',
      );
      return;
    }

    const micAllowed = await ensureMicrophonePermission();
    if (!micAllowed) {
      pushMessage(
        'assistant',
        'Microphone access is blocked. Enable mic permission for this site, then tap the mic again.',
      );
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();

      if (!transcript) return;
      setInput(transcript);
      submitText(transcript);
      setInput('');
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        pushMessage(
          'assistant',
          'Microphone permission denied. Enable microphone access in browser/site settings and retry.',
        );
      } else {
        pushMessage('assistant', `Voice input failed: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground text-sm">Chat Entry</h3>
      </div>

      <div className="max-h-52 overflow-y-auto rounded-xl border border-border bg-background p-3 space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`text-sm leading-relaxed ${
              message.role === 'assistant' ? 'text-muted-foreground' : 'text-foreground'
            }`}
          >
            <span className="font-semibold mr-1">
              {message.role === 'assistant' ? 'Assistant:' : 'You:'}
            </span>
            <span>{message.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Try: "Spent 300 on transportation"'
          className="h-10 bg-background text-sm placeholder:text-xs"
        />
        {speechRecognitionSupported && (
          <Button
            type="button"
            size="icon"
            variant={isListening ? 'secondary' : 'outline'}
            className={`h-10 w-10 ${isListening ? 'animate-pulse' : ''}`}
            onClick={handleVoiceInput}
            title={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
        <Button type="submit" size="icon" className="h-10 w-10">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatEntry;
