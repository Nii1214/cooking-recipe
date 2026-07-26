-- 匿名ユーザー削除時に、オーナーだった families も連鎖削除できるようにする。
-- family_members は families / auth.users 双方に ON DELETE CASCADE 済み。
alter table families
  drop constraint families_owner_id_fkey;

alter table families
  add constraint families_owner_id_fkey
  foreign key (owner_id) references auth.users(id) on delete cascade;
