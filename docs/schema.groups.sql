create table lesson_groups_authoring (
  id text primary key,
  lesson_id text not null,
  order_index int not null,

  title text not null,
  description text,

  status text not null default 'draft',
  version int not null default 1,
  updated_by text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
