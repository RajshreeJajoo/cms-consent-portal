import { useEffect } from 'react'

export default function Modal({ title, children, onClose }) {
  useEffect(
    function () {
      function onKey(event) {
        if (event.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', onKey)
      return function () {
        window.removeEventListener('keydown', onKey)
      }
    },
    [onClose]
  )

  return (
    <div className="modal-back" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onMouseDown={function (event) {
          event.stopPropagation()
        }}
      >
        <h2 id="dialog-title">{title}</h2>
        {children}
      </div>
    </div>
  )
}
