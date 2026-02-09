-- Create recurring expenses table
CREATE TABLE public.recurring_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  day_of_month SMALLINT NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_added_date DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Recurring expenses RLS policies
CREATE POLICY "Users can view own recurring expenses" ON public.recurring_expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring expenses" ON public.recurring_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring expenses" ON public.recurring_expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring expenses" ON public.recurring_expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_recurring_expenses_user_id ON public.recurring_expenses(user_id);
CREATE INDEX idx_recurring_expenses_active ON public.recurring_expenses(active);
