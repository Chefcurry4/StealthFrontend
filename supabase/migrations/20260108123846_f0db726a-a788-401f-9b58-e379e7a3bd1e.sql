-- Public user count without exposing Users(US) rows (bypasses RLS safely)
create or replace function public.get_public_user_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint from public."Users(US)";
$$;

grant execute on function public.get_public_user_count() to anon, authenticated;

-- Flashcard style cleanup: map deprecated epic styles to the remaining epic style
update public."Users(US)"
set flashcard_color_style = 'epic-pink'
where flashcard_color_style in ('epic-white', 'epic-sunset');
