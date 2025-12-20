-- Supabase functions, triggers, and procedures for restaurantapp
-- Run this in the Supabase SQL editor.

-- =====================
-- Functions (RPC-friendly)
-- =====================
create or replace function public.get_or_create_customer(
  p_email text,
  p_name text default null,
  p_phone text default null
)
returns bigint
language plpgsql
as $$
declare
  v_id bigint;
  v_guest_name text;
begin
  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'email is required';
  end if;

  select customer_id
    into v_id
    from customers
   where lower(email) = lower(p_email)
   limit 1;

  if v_id is not null then
    return v_id;
  end if;

  v_guest_name := coalesce(nullif(p_name, ''), 'Guest ' || substr(md5(random()::text), 1, 6));

  begin
    insert into customers (name, email, phone)
    values (v_guest_name, lower(p_email), p_phone)
    returning customer_id into v_id;
  exception
    when not_null_violation then
      v_id := (extract(epoch from clock_timestamp()) * 1000)::bigint * 1000
              + floor(random() * 1000)::bigint;
      insert into customers (customer_id, name, email, phone)
      values (v_id, v_guest_name, lower(p_email), p_phone)
      returning customer_id into v_id;
  end;

  return v_id;
end;
$$;

create or replace function public.calculate_items_total(
  p_items jsonb
)
returns numeric
language plpgsql
as $$
declare
  v_total numeric;
begin
  if p_items is null then
    return 0;
  end if;

  select coalesce(sum(mi.price * coalesce((item->>'quantity')::numeric, 1)), 0)
    into v_total
    from jsonb_array_elements(p_items) as item
    join menu_items mi on mi.item_id = (item->>'item_id')::bigint;

  return coalesce(v_total, 0);
end;
$$;

create or replace function public.calculate_order_total(
  p_order_id bigint
)
returns numeric
language sql
as $$
  select coalesce(sum(oi.quantity * mi.price), 0)
  from order_items oi
  join menu_items mi on mi.item_id = oi.item_id
  where oi.order_id = p_order_id
$$;

-- =====================
-- Trigger functions
-- =====================
create or replace function public.normalize_customer_email()
returns trigger
language plpgsql
as $$
begin
  if new.email is not null then
    new.email := lower(new.email);
  end if;
  return new;
end;
$$;

create or replace function public.recalculate_order_total()
returns trigger
language plpgsql
as $$
declare
  v_order_id bigint;
begin
  v_order_id := coalesce(new.order_id, old.order_id);

  update orders
     set total_amount = public.calculate_order_total(v_order_id)
   where order_id = v_order_id;

  return null;
end;
$$;

create or replace function public.validate_payment_amount()
returns trigger
language plpgsql
as $$
declare
  v_total numeric;
begin
  select total_amount
    into v_total
    from orders
   where order_id = new.order_id;

  if v_total is not null and new.amount is not null and new.amount <> v_total then
    raise exception 'payment amount % does not match order total %', new.amount, v_total;
  end if;

  return new;
end;
$$;

-- =====================
-- Triggers
-- =====================
drop trigger if exists trg_customers_email_norm on customers;
create trigger trg_customers_email_norm
before insert or update on customers
for each row execute function public.normalize_customer_email();

drop trigger if exists trg_order_items_recalc_total on order_items;
create trigger trg_order_items_recalc_total
after insert or update or delete on order_items
for each row execute function public.recalculate_order_total();

drop trigger if exists trg_payments_validate_amount on payments;
create trigger trg_payments_validate_amount
before insert or update on payments
for each row execute function public.validate_payment_amount();

-- =====================
-- Procedures (admin/maintenance)
-- =====================
create or replace procedure public.proc_mark_overdue_reservations(
  p_now timestamptz default now()
)
language plpgsql
as $$
begin
  update reservations
     set status = 'overdue'
   where reservation_date < p_now
     and status = 'reserved';
end;
$$;

create or replace procedure public.proc_void_unpaid_orders(
  p_cutoff timestamptz
)
language plpgsql
as $$
begin
  update orders o
     set status = 'void'
   where o.order_date < p_cutoff
     and o.status = 'pending'
     and not exists (
       select 1 from payments p where p.order_id = o.order_id
     );
end;
$$;

create or replace procedure public.proc_bulk_update_menu_prices(
  p_percent numeric
)
language plpgsql
as $$
begin
  update menu_items
     set price = price * (1 + (p_percent / 100.0));
end;
$$;
