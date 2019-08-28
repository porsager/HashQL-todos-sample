import HashQL from 'hashql'
import m from 'mithril'

const request = body => m.request('http://localhost:5000/hql', { method: 'POST', body })

export const sql = HashQL('sql', request)
export const node = HashQL('node', request)
