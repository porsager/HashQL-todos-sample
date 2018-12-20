import m from 'mithril'
import api from './api.js'

window.m = m

let todos

function init() {
  api.tx(t => [
    t.none(`
      create extension if not exists "uuid-ossp";

      create table if not exists todos (
        created_at  timestamp   default now(),
        todo_id     uuid        primary key default uuid_generate_v4(),
        title       text        not null default '',
        done        boolean     default false
      )
      `),
    t.any(`
      select * from todos
      order by created_at
    `)
  ])
  .then(([, t]) => todos = t)
  .catch(alert)
}

function add(title) {
  const todo = { title }
  todos.push(todo)
  return api.one(`
    insert into todos (
      title
    ) values (
      $(title)
    )
    returning *
  `, { title })
  .then(t => Object.assign(todo, t))
  .catch(err => {
    window.alert(err)
    todos.splice(todos.indexOf(todo), 1)
  })
}

function setDone(todo_id, done) {
  const todo = todos.find(t => t.todo_id === todo_id)
  todo.done = done
  return api.one(`
    update todos
    set done = $(done)
    where todo_id = $(todo_id)
    returning *
  `, { todo_id, done })
  .then(({ done }) => todo.done = done)
  .catch(() => todo.done = !done)
}

function edit(todo_id, title) {
  const todo = todos.find(t => t.todo_id === todo_id)
  const previous = todo.title
  todo.title = title
  api.none(`
    update todos
    set title = $(title)
    where todo_id = $(todo_id)
  `, { todo_id, title })
  .catch(() => todo.title = previous)
}

function remove(todo_id) {
  const todo = todos.find(t => t.todo_id === todo_id)
      , idx = todos.indexOf(todo)
  todos.splice(idx, 1)
  api.none(`
    delete from todos
    where todo_id = $(todo_id)
  `, { todo_id })
  .catch(() => todos.splice(idx, 0, todo))
}

m.mount(document.body, {

  oninit: init,

  view: () =>
    m('main',
      m('h1', 'Todos'),

      m('p',
        !todos
          ? 'Loading'
          : !todos.length
            ? 'No todos yet'
            : todos.length + ' todos'),

      todos && todos.length > 0 && m('ul',
        todos.map(({ todo_id, title, done }) =>
          m('li',
            m('input', {
              type: 'checkbox',
              checked: Boolean(done),
              onchange: (e) => setDone(todo_id, e.target.checked)
            }),
            m('input', {
              onchange: (e) => edit(todo_id, e.target.value),
              value: title
            }),
            m('button', {
              onclick: () => remove(todo_id)
            }, 'x')
          )
        )
      ),

      m('form', {
        onsubmit: e => {
          e.preventDefault()
          add(e.target.elements.title.value).then(() =>
            e.target.elements.title.value = ''
          )
        }
      },
        m('input', {
          name: 'title'
        }),
        m('button', 'add')
      )
    )

})
