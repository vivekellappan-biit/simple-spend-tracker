-- Add recurrence fields to recurring expenses
ALTER TABLE public.recurring_expenses
  ADD COLUMN frequency TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN interval_days INTEGER,
  ADD COLUMN month_of_year SMALLINT;

ALTER TABLE public.recurring_expenses
  ADD CONSTRAINT recurring_expenses_frequency_check
  CHECK (frequency IN ('monthly', 'yearly', 'custom'));

ALTER TABLE public.recurring_expenses
  ADD CONSTRAINT recurring_expenses_month_of_year_check
  CHECK (month_of_year IS NULL OR (month_of_year >= 1 AND month_of_year <= 12));

ALTER TABLE public.recurring_expenses
  ADD CONSTRAINT recurring_expenses_interval_days_check
  CHECK (interval_days IS NULL OR interval_days >= 1);

CREATE INDEX idx_recurring_expenses_frequency ON public.recurring_expenses(frequency);
