BEGIN;

-- Derive the foreign key's type from the existing catalogue.
CREATE TABLE public.product_purchase_prices AS
SELECT id AS product_id, NULL::numeric AS purchase_price
FROM public.products
WITH NO DATA;

ALTER TABLE public.product_purchase_prices
  ADD PRIMARY KEY (product_id),
  ADD FOREIGN KEY (product_id) REFERENCES public.products (id),
  ADD CHECK (purchase_price >= 0 AND purchase_price < 'Infinity'::numeric);

ALTER TABLE public.product_purchase_prices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.product_purchase_prices FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.product_purchase_prices TO authenticated;

CREATE POLICY "Administrators manage purchase prices"
  ON public.product_purchase_prices
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

COMMIT;
