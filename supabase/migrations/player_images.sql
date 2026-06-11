-- player_images table
create table if not exists public.player_images (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.profiles(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  caption text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists player_images_player_idx
  on public.player_images(player_id);

-- Storage bucket (public read)
insert into storage.buckets (id, name, public)
values ('player-images', 'player-images', true)
on conflict (id) do nothing;

-- RLS policies for storage
create policy "Public read player images"
  on storage.objects for select
  using (bucket_id = 'player-images');

create policy "Authenticated users can upload player images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'player-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own player images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'player-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own player images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'player-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS on the table
alter table public.player_images enable row level security;

create policy "Players can manage their own images"
  on public.player_images
  for all
  to authenticated
  using (player_id = auth.uid())
  with check (player_id = auth.uid());

create policy "Public can view player images"
  on public.player_images
  for select
  using (true);
