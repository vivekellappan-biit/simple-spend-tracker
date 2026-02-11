-- Track money lent to others and borrowed from others
CREATE TABLE public.lend_borrow_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lent', 'borrowed')),
  person_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'settled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lend_borrow_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lend/borrow entries" ON public.lend_borrow_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lend/borrow entries" ON public.lend_borrow_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lend/borrow entries" ON public.lend_borrow_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lend/borrow entries" ON public.lend_borrow_entries
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_lend_borrow_entries_user_id ON public.lend_borrow_entries(user_id);
CREATE INDEX idx_lend_borrow_entries_date ON public.lend_borrow_entries(date DESC);
CREATE INDEX idx_lend_borrow_entries_status ON public.lend_borrow_entries(status);
