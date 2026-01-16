create table restock_requests (
  id uuid default uuid_generate_v4() primary key,
  shift_id uuid references shifts(id),
  item_name text not null,
  current_quantity integer,
  supplier text,
  status text check (status in ('pending', 'ordered', 'fulfilled')) default 'pending',
  created_at timestamp with time zone default now()
);
