export function formatWhen(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDay(iso) {
  if (!iso) return '—'
  const date = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatBytes(size) {
  if (!size && size !== 0) return '—'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return Math.round(size / 1024) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

export function absUrl(path) {
  return window.location.origin + path
}
