import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { formatWhen } from '../lib/format.js'
import { parseDncCsv } from '../lib/rules.js'
import { useTitle } from '../lib/useTitle.js'

const SAMPLE = 'type,value\nmobile,60111000111\nemail,another.blocked@example.com\n'

export default function DncPage() {
  const { user } = useAuth()
  const { dncEntries, loadDnc, setDncActive } = useData()
  const [text, setText] = useState(SAMPLE)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState([])
  const readOnly = user.role !== 'operations'
  useTitle('Do not contact')

  function load(event) {
    event.preventDefault()
    const parsed = parseDncCsv(text)
    setErrors(parsed.errors)
    if (!parsed.rows.length) {
      setMessage(parsed.errors.length ? 'Nothing was loaded.' : 'Add at least one row.')
      return
    }
    const result = loadDnc(parsed.rows, user.name)
    if (result.status === 'error') {
      setMessage(result.error)
      return
    }
    setMessage(result.added + ' added. ' + result.skipped + ' already on the list.')
  }

  function onFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = function () { setText(String(reader.result || '')) }
    reader.readAsText(file)
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>Do not contact</h1>
        <p className="lede">
          Load the structured file from the source system. The latest active rows are used by the eligibility check. This demo does not call an external registry.
        </p>
      </header>
      {readOnly ? <p className="notice">Compliance can review the loaded list. Operations loads and retires rows.</p> : (
        <form className="card form-card" onSubmit={load}>
          <label className="field">
            CSV rows
            <textarea rows={6} value={text} onChange={function (event) { setText(event.target.value) }} />
          </label>
          <label className="field">
            Or choose a .csv file
            <input type="file" accept=".csv,text/csv,text/plain" onChange={function (event) { onFile(event.target.files && event.target.files[0]) }} />
          </label>
          {errors.map(function (error) { return <p key={error} className="error">{error}</p> })}
          {message ? <p className="notice">{message}</p> : null}
          <button className="btn primary" type="submit">Load into CMS</button>
        </form>
      )}
      <div className="table-wrap card">
        <table className="data">
          <thead>
            <tr>
              <th>Type</th>
              <th>Value</th>
              <th>Source</th>
              <th>Loaded</th>
              <th>State</th>
              {readOnly ? null : <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {dncEntries.map(function (entry) {
              return (
                <tr key={entry.id}>
                  <td>{entry.type === 'nationalId' ? 'National ID' : entry.type}</td>
                  <td>{entry.value}</td>
                  <td>{entry.source}</td>
                  <td>{formatWhen(entry.loadedAt)} · {entry.loadedBy}</td>
                  <td>{entry.active ? <span className="badge bad">Blocking</span> : <span className="badge neutral">Retired</span>}</td>
                  {readOnly ? null : (
                    <td>
                      <button type="button" className="btn ghost small" onClick={function () { setDncActive(entry.id, !entry.active) }}>
                        {entry.active ? 'Retire' : 'Activate'}
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
