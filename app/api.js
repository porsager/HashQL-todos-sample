import Ey from 'ey'
import m from 'mithril'

export default Ey({
  request: data => m.request('http://localhost:5000/sql', { method: 'POST', data })
})
