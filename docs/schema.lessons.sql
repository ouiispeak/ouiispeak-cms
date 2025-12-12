create table lessons_authoring (
  id text primary key,
  lesson_slug text not null,
  module_slug text not null,
  level text,

  title text not null,
  description text,

  status text not null default 'draft',
  version int not null default 1,
  updated_by text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
