create table if not exists public.contact_submissions (
  id bigserial primary key,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

create policy "Allow anonymous contact inserts"
on public.contact_submissions
for insert
to anon
with check (true);
