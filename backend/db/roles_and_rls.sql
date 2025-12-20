-- Role model + RLS policies for Supabase
-- Run in Supabase SQL editor.

create table if not exists public.profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    role text not null default 'customer' check (role in ('customer', 'staff', 'courier', 'admin')),
    created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (user_id, role)
    values (new.id, 'customer')
    on conflict (user_id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.has_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles p
        where p.user_id = auth.uid()
          and p.role = any (required_roles)
    );
$$;

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles
for select
using (auth.uid() = user_id or public.has_role(array['admin']));

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
on public.profiles
for update
using (public.has_role(array['admin']))
with check (public.has_role(array['admin']));

alter table public.menu_items enable row level security;
drop policy if exists menu_items_select_all on public.menu_items;
create policy menu_items_select_all
on public.menu_items
for select
using (true);

drop policy if exists menu_items_admin_write on public.menu_items;
create policy menu_items_admin_write
on public.menu_items
for all
using (public.has_role(array['admin']))
with check (public.has_role(array['admin']));

alter table public.orders enable row level security;
drop policy if exists orders_select_staff on public.orders;
create policy orders_select_staff
on public.orders
for select
using (public.has_role(array['admin', 'staff', 'courier']));

drop policy if exists orders_insert_authenticated on public.orders;
create policy orders_insert_authenticated
on public.orders
for insert
with check (auth.uid() is not null);

drop policy if exists orders_update_staff on public.orders;
create policy orders_update_staff
on public.orders
for update
using (public.has_role(array['admin', 'staff', 'courier']))
with check (public.has_role(array['admin', 'staff', 'courier']));

alter table public.order_items enable row level security;
drop policy if exists order_items_select_staff on public.order_items;
create policy order_items_select_staff
on public.order_items
for select
using (public.has_role(array['admin', 'staff', 'courier']));

drop policy if exists order_items_insert_authenticated on public.order_items;
create policy order_items_insert_authenticated
on public.order_items
for insert
with check (auth.uid() is not null);

alter table public.payments enable row level security;
drop policy if exists payments_select_staff on public.payments;
create policy payments_select_staff
on public.payments
for select
using (public.has_role(array['admin', 'staff']));

drop policy if exists payments_insert_staff on public.payments;
create policy payments_insert_staff
on public.payments
for insert
with check (public.has_role(array['admin', 'staff']));

alter table public.reservations enable row level security;
drop policy if exists reservations_select_staff on public.reservations;
create policy reservations_select_staff
on public.reservations
for select
using (public.has_role(array['admin', 'staff']));

drop policy if exists reservations_insert_authenticated on public.reservations;
create policy reservations_insert_authenticated
on public.reservations
for insert
with check (auth.uid() is not null);

drop policy if exists reservations_update_staff on public.reservations;
create policy reservations_update_staff
on public.reservations
for update
using (public.has_role(array['admin', 'staff']))
with check (public.has_role(array['admin', 'staff']));

alter table public.customers enable row level security;
drop policy if exists customers_select_staff on public.customers;
create policy customers_select_staff
on public.customers
for select
using (public.has_role(array['admin', 'staff']));

alter table public.staff enable row level security;
drop policy if exists staff_select_admin on public.staff;
create policy staff_select_admin
on public.staff
for select
using (public.has_role(array['admin']));
