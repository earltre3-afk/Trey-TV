-- ============================================================
-- PROFILE ACCENT COLOR HEX FORMAT ============================
-- ============================================================
-- Update profile_accent_color to use hex color format instead of text labels
-- Default gold: #FFC857 (Trey TV gold)

alter table public.profiles
add column if not exists profile_accent_color text default '#FFC857';

-- Update existing text labels to hex values
update public.profiles
set profile_accent_color = 
  case profile_accent_color
    when 'gold' then '#FFC857'
    when 'magenta' then '#FF006E'
    when 'cyan' then '#00B4D8'
    when 'purple' then '#9D4EDD'
    else '#FFC857' -- default to gold for any unknown values
  end
where profile_accent_color in ('gold', 'magenta', 'cyan', 'purple');

-- Ensure all remaining null values get the default gold
update public.profiles
set profile_accent_color = '#FFC857'
where profile_accent_color is null or profile_accent_color = '';

-- Add a check constraint to ensure only valid hex colors are stored
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profile_accent_color_hex_check'
  ) then
    alter table public.profiles
    add constraint profile_accent_color_hex_check
    check (profile_accent_color ~ '^#[0-9A-Fa-f]{6}$');
  end if;
end $$;
