import HashQL from 'hashql'
import m from 'mithril'

export default HashQL({
  request: data => m.request('http://localhost:5000/sql', { method: 'POST', data })
})
