create table slides_authoring (
  id text primary key,
  lesson_id text not null,
  group_id text not null,
  order_index int not null,

  type text not null,
  props_json jsonb not null,
  aid_hook text,

  status text not null default 'draft',
  version int not null default 1,
  updated_by text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
