import { useState } from 'react'
import Modal from './Modal.jsx'

export default function DuplicateDialog({
  matches,
  allowUpdate,
  allowSeparate,
  labelFor,
  onUpdate,
  onSeparate,
  onClose,
}) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const conflict = matches.length > 1

  function saveSeparate() {
    if (reason.trim().length < 8) {
      setError('Enter a short reason (at least 8 characters) for keeping a separate record.')
      return
    }
    onSeparate(reason.trim())
  }

  return (
    <Modal title={conflict ? 'These details match more than one person' : 'This person is already on file'} onClose={onClose}>
      <p>
        {conflict
          ? 'The email, mobile, or national ID points at different existing records. Phase 1 does not guess which person is correct.'
          : 'A matching email, mobile, or national ID was found. The existing record should be updated so consent stays on one person.'}
      </p>
      <ul className="match-list">
        {matches.map(function (match) {
          return (
            <li key={match.record.id}>
              <strong>{labelFor(match.record)}</strong>
              <span>Matched on {match.fields.join(', ')}</span>
            </li>
          )
        })}
      </ul>
      {allowUpdate ? (
        <button type="button" className="btn primary" onClick={function () { onUpdate(matches[0].record) }}>
          Update the existing record
        </button>
      ) : allowSeparate ? null : (
        <p className="notice warn">
          {conflict
            ? 'An operations user needs to resolve this before another consent is stored.'
            : 'You can view this person only. An adviser who owns the record, or operations, can update it.'}
        </p>
      )}
      {allowSeparate ? (
        <div className="stack">
          <label className="field">
            Reason for a separate record
            <textarea value={reason} onChange={function (event) { setReason(event.target.value) }} rows={3} />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button type="button" className="btn ghost" onClick={saveSeparate}>
            Save as a separate record
          </button>
        </div>
      ) : null}
      <div className="dialog-actions">
        <button type="button" className="btn ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Modal>
  )
}
