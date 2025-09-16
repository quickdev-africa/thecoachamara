-- Migration: create transactional delete_orders(ids uuid[])
-- This procedure deletes dependent rows (order_items, payments, payment_attempts) and orders in a single transaction.
-- Make idempotent: drop existing function (if any) then create
drop function if exists public.delete_orders(uuid[]);

create function public.delete_orders(ids uuid[])
returns void
language plpgsql
security definer
as $$
begin
  -- Delete order items
  delete from public.order_items where order_id = any(ids);
  -- Delete payments table rows
  delete from public.payments where order_id = any(ids);
  -- Delete payment attempts
  delete from public.payment_attempts where order_id = any(ids);
  -- Finally delete orders
  delete from public.orders where id = any(ids);
end;
$$;

comment on function public.delete_orders(uuid[]) is 'Delete orders and dependent rows in a single transaction';
