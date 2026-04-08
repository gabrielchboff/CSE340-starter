-- Create the review table for vehicle reviews
CREATE TABLE IF NOT EXISTS public.review (
  review_id SERIAL PRIMARY KEY,
  review_text TEXT NOT NULL,
  review_rating INTEGER NOT NULL CHECK (review_rating >= 1 AND review_rating <= 5),
  review_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  account_id INTEGER NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE,
  inv_id INTEGER NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE
);
