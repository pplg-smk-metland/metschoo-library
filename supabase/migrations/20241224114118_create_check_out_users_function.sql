create or replace function check_out_users()
returns uuid
language plpgsql
as
$$
begin
with users_who_forgot_to_check_out as(
  select user_id, count(event)
  from kunjungan
  where
  check_in > (now() - interval '1 day')
  group by (user_id)
) insert into kunjungan(user_id, event)
select user_id, 'check_out'
from users_who_forgot_to_check_out u
where u.count % 2 <> 0 returning user_id;
end;
$$
