const rollup = require('rollup')
const ey = require('ey/rollup')
const fs = require('fs')
const nodeResolve = require('rollup-plugin-node-resolve')

rollup.rollup({
  input: 'app/index.js',
  plugins: [
    nodeResolve(),
    ey({
      output: queries => fs.writeFileSync('server/queries.json', JSON.stringify(queries, null, 2))
    })
  ]
})
.then(bundle =>
  bundle.write({
    file: 'app/bundle.js',
    format: 'iife'
  })
)
