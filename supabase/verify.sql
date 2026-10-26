-- Run in the Supabase SQL Editor after stage4.sql. Proves the database blocks double bookings.
-- It creates a throwaway slot, tries to book it twice, then cleans up after itself.
do $$
declare s uuid; blocked boolean := false;
begin
  insert into consultation_slots (starts_at) values (now() + interval '3650 days') returning id into s;
  insert into consultation_bookings (slot_id, full_name, email, consent) values (s, 'Test A', 'a@example.com', true);
  begin
    insert into consultation_bookings (slot_id, full_name, email, consent) values (s, 'Test B', 'b@example.com', true);
  exception when unique_violation then blocked := true;
  end;
  delete from consultation_slots where id = s;
  if not blocked then raise exception 'FAIL: a second booking for the same slot was allowed'; end if;
  raise notice 'PASS: a second booking for the same slot was rejected';
end $$;
