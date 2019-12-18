import b from 'bss'
import './style.js'
import m from 'mithril'
import { sql, node } from './api.js'

window.m = m

let todos
  , focused = false
  , hostname

async function init() {
  await sql`
    create extension if not exists "uuid-ossp"
  `

  await sql`
    create table if not exists todos (
      created_at  timestamp   default now(),
      todo_id     uuid        primary key default uuid_generate_v4(),
      title       text        not null default '',
      done        boolean     default false
    )
  `

  hostname = await node`
    require('os').hostname()
  `

  todos = await sql`
    select * from todos
    order by created_at;
  `
}

function add(title) {
  const todo = { title }
  todos.push(todo)
  return sql`
    insert into todos (
      title
    ) values (
      ${ title }
    )
    returning *
  `
  .then(([t]) => Object.assign(todo, t))
  .catch(err => {
    window.alert(JSON.stringify(err))
    todos.splice(todos.indexOf(todo), 1)
  })
}

function setDone(todo_id, done) {
  const todo = todos.find(t => t.todo_id === todo_id)
  todo.done = done
  return sql`
    update todos
    set done = ${ done }
    where todo_id = ${ todo_id }
    returning *
  `
  .then(([{ done }]) => todo.done = done)
  .catch(() => todo.done = !done)
}

function edit(todo_id, title) {
  const todo = todos.find(t => t.todo_id === todo_id)
  const previous = todo.title
  todo.title = title
  sql`
    update todos
    set title = ${ title }
    where todo_id = ${ todo_id }
  `
  .catch(() => todo.title = previous)
}

function remove(todo_id) {
  const todo = todos.find(t => t.todo_id === todo_id)
      , idx = todos.indexOf(todo)
  todos.splice(idx, 1)
  sql`
    delete from todos
    where todo_id = ${ todo_id }
  `
  .catch(() => todos.splice(idx, 0, todo))
}

m.mount(document.body, {

  oninit: init,

  view: () =>
    m('main' + b`
      d flex
      fd column
      jc center
      ai center
      ta center
    `,
      m('h1', {
        onclick: () => alert('wat 10')
      }, 'Todos running on ' + hostname),

      m('p',
        !todos
          ? 'Loading'
          : !todos.length
            ? 'No todos yet'
            : todos.length + ' todos'),

      todos && todos.length > 0 && m('ul' + b`
        list-style none
        p 0
        width 100%
        max-width 480
      `,
        todos.map(({ todo_id, title, done }) =>
          m('li' + b`
            d flex
            ai center
            p 8
            m 4 0
            br 3
            bc ${ focused === todo_id && 'hsl(0, 0%, 95%)' }
          `,
            m('input' + b`
              m 8
            `, {
              type: 'checkbox',
              onfocus: () => focused = todo_id,
              onblur: () => focused = false,
              checked: Boolean(done),
              onchange: (e) => setDone(todo_id, e.target.checked)
            }),
            m('input' + b`
              d block
              border none
              p 4 8
              fs 18
              w 100%
              bc white
              br 4
              text-decoration ${ done && 'line-through' }
            `.$focus`
              border none
              outline none
            `, {
              onfocus: () => focused = todo_id,
              onblur: () => focused = false,
              onchange: (e) => edit(todo_id, e.target.value),
              value: title
            }),
            m('button' + b`
              border none
              bc transparent
              w 24
              h 24
              m 4 8
              background-image url('/images/trash.svg')
              background-size 100% 100%
            `, {
              onfocus: () => focused = todo_id,
              onblur: () => focused = false,
              onclick: () => remove(todo_id)
            }, )
          )
        )
      ),

      m('form' + b`
        d flex
        m 20 0
      `, {
        onsubmit: e => {
          e.preventDefault()
          add(e.target.elements.title.value).then(() =>
            e.target.elements.title.value = ''
          )
        }
      },
        m('input' + b`
          d block
          fs 18
          p 4 8
          h 32
          br 3 0 0 3
          border 1px solid gray
        `, {
          name: 'title',
          autocomplete: 'off'
        }),
        m('button' + b`
          tt uppercase
          bc gray
          h 100%
          p 4 16
          h 42
          c white
          br 0 3 3 0
          border none
          fs 14
          fw bold
        `, 'add')
      )
    )

})
