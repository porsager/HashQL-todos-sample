create extension if not exists "uuid-ossp";

create table if not exists todos (
  created_at  timestamp   default now(),
  todo_id     uuid        primary key default uuid_generate_v4(),
  title       text        not null default '',
  done        boolean     default false
)
