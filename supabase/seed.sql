insert into public.products (
  id,
  slug,
  name,
  price_inr,
  short_description,
  image_url,
  mask_type,
  in_stock
)
values
  (
    1,
    'kitsune-festival-mask',
    'Kitsune Festival Mask',
    2499,
    'White fox mask with red festival detailing.',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    'Fox',
    true
  ),
  (
    2,
    'oni-red-mask',
    'Oni Red Mask',
    3299,
    'Bold red oni mask for statement styling and decor.',
    'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=900&q=80',
    'Oni',
    true
  ),
  (
    3,
    'noh-elegance-mask',
    'Noh Elegance Mask',
    2899,
    'Minimal theatrical mask inspired by traditional Noh art.',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    'Noh',
    false
  )
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  price_inr = excluded.price_inr,
  short_description = excluded.short_description,
  image_url = excluded.image_url,
  mask_type = excluded.mask_type,
  in_stock = excluded.in_stock;

select setval(
  pg_get_serial_sequence('public.products', 'id'),
  (select max(id) from public.products),
  true
);
