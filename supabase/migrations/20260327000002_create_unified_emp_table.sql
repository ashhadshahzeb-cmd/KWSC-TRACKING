-- Update Unified Table to match USER's UI exactly
DROP TABLE IF EXISTS public.book_section_employees;

CREATE TABLE public.book_section_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Identification
    serial_no TEXT,
    employee_no TEXT,
    pension_no TEXT,
    full_name TEXT NOT NULL,
    cnic_no TEXT,
    nominees TEXT,
    
    -- Dates & Categories
    appointment_date DATE,
    retired_date DATE,
    bill_passed_on DATE,
    disbursed_date DATE,
    category TEXT NOT NULL, -- 'Employed' or 'Retired'
    sub_category_regular TEXT,
    sub_category_retired TEXT,
    status TEXT DEFAULT 'active',
    
    -- Financials
    bank_details TEXT,
    total_amount NUMERIC DEFAULT 0,
    balance_amount NUMERIC DEFAULT 0,
    cheque_amount NUMERIC DEFAULT 0,
    amount_in_words TEXT,
    
    -- Assets
    photo_url TEXT
);

-- Enable RLS
ALTER TABLE public.book_section_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON public.book_section_employees FOR ALL TO authenticated USING (true);
