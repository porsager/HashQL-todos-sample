const http = require('http')
const Ey = require('ey/server')
const Pgp = require('pg-promise')
const queries = require('./queries.json')

const pgp = Pgp()
    , db = pgp('postgres://localhost/todoey')
    , port = process.env.PORT || 5000
    , dev = process.env.NODE_ENV === 'development' ? true : undefined

const ey = Ey({
  db,
  query: dev
    ? q => q.sql
    : q => queries[q.sql]
})

const server = http.createServer((req, res) => {
  if (req.url !== '/sql' && req.method !== 'POST')
    return res.end('OK')

  let body = ''
  req.on('data', chunk => { body += chunk })
  req.on('end', () => {
    parse(body)
    .then(ey)
    .then(data => res.end(JSON.stringify(data)))
    .catch(err => {
      res.statusCode = 500
      res.end(JSON.stringify({ message: err.message, stack: dev && err.stack, error: err }))
    })
  })
})

server.listen(port)
server.on('listening', () => console.log('Listening on', port))

function parse(string) {
  return new Promise((resolve, reject) => {
    try {
      resolve(JSON.parse(string))
    } catch (e) {
      console.log('wwaaaat', e)
      reject(e)
    }
  })
}
