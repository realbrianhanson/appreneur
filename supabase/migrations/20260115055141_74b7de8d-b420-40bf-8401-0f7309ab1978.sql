-- Cohorts table for tracking challenge cohorts
CREATE TABLE public.cohorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 500,
  spots_taken INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz leads table for storing quiz responses and email signups
CREATE TABLE public.quiz_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  answer1 TEXT NOT NULL,
  answer2 TEXT NOT NULL,
  answer3 TEXT NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Waitlist table for when cohorts are full
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cohorts (public read for active cohorts)
CREATE POLICY "Anyone can view active cohorts" 
ON public.cohorts 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for quiz_leads (anyone can insert - public form)
CREATE POLICY "Anyone can submit quiz leads" 
ON public.quiz_leads 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for waitlist (anyone can join waitlist)
CREATE POLICY "Anyone can join waitlist" 
ON public.waitlist 
FOR INSERT 
WITH CHECK (true);

-- Create function to increment spots_taken
CREATE OR REPLACE FUNCTION public.increment_spots_taken(cohort_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.cohorts 
  SET spots_taken = spots_taken + 1, 
      updated_at = now()
  WHERE id = cohort_uuid 
    AND spots_taken < max_participants;
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_cohorts_updated_at
BEFORE UPDATE ON public.cohorts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the first active cohort (Monday, January 20th 2025)
INSERT INTO public.cohorts (name, start_date, max_participants, spots_taken, is_active)
VALUES ('January 2025 Cohort', '2025-01-20 09:00:00+00', 500, 347, true);