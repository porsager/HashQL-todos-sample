const HashQL = require('hashql/server')
const Pgp = require('pg-promise')
const ey = require('ey')
const http = require('http')
const bodyParser = require('body-parser')
const queries = require('./queries.json')

const pgp = Pgp()
    , db = pgp(process.env.POSTGRES_URL || 'postgres://localhost/hashql_todos_sample')
    , app = ey()
    , port = process.env.PORT || 5000
    , dev = process.env.NODE_ENV === 'development' ? true : undefined

const hql = HashQL(dev ? x => x : queries, {
  sql: (xs, ...args) =>
    db.query(xs.slice(1).reduce((acc, x, i) => acc + '$' + (i + 1) + x, xs[0]), args)
  ,
  node: (xs, ...args) =>
    eval(xs.slice(1).reduce((acc, x, i) => acc + JSON.stringify(args[i]) + x, xs[0]))
})

app.post('/hql', bodyParser.json(), (req, res, next) =>
  hql(req.body)
    .then(data => res.end(JSON.stringify(data)))
    .catch(err => {
      res.statusCode = 500
      res.end(JSON.stringify({ error: err.message || err.toString() }))
    })
)

const server = http.createServer(app)

server.listen(port, () => console.log('Listening on', port))
