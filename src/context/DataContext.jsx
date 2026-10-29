import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createSeed } from '../data/seed.js'
import { applyArchive, applyCreate, applyDnc, applyDncActive, applyUpdate, applyWithdraw } from '../lib/consentState.js'

const DataContext = createContext(null)
const KEY = 'cms-consent-portal-v1'

function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return createSeed()
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.consents) || !Array.isArray(parsed.dncEntries)) {
      return createSeed()
    }
    return parsed
  } catch (error) {
    return createSeed()
  }
}

export function DataProvider({ children }) {
  const [state, setState] = useState(loadState)
  const [storageError, setStorageError] = useState('')

  useEffect(
    function () {
      try {
        localStorage.setItem(KEY, JSON.stringify(state))
        setStorageError('')
      } catch (error) {
        setStorageError('The browser could not store the latest change. Use a smaller scan, or reset the demo data.')
      }
    },
    [state]
  )

  const api = useMemo(
    function () {
      function commit(next, result) {
        try {
          localStorage.setItem(KEY, JSON.stringify(next))
          setState(next)
          setStorageError('')
          return result
        } catch (error) {
          const message = 'The browser storage is full. Upload a smaller file (under 900 KB) or reset the demo data.'
          setStorageError(message)
          return { status: 'error', error: message }
        }
      }

      return {
        consents: state.consents,
        dncEntries: state.dncEntries,
        storageError: storageError,
        clearStorageError: function () {
          setStorageError('')
        },
        createConsent: function (input) {
          const outcome = applyCreate(state, input)
          if (outcome.result.status !== 'created') return outcome.result
          return commit(outcome.state, outcome.result)
        },
        updateConsent: function (id, input) {
          const outcome = applyUpdate(state, id, input)
          if (outcome.result.status !== 'updated') return outcome.result
          return commit(outcome.state, outcome.result)
        },
        withdrawConsent: function (id, input) {
          const outcome = applyWithdraw(state, id, input)
          if (outcome.result.status !== 'updated') return outcome.result
          return commit(outcome.state, outcome.result)
        },
        archiveConsent: function (id, input) {
          const outcome = applyArchive(state, id, input)
          if (outcome.result.status !== 'updated') return outcome.result
          return commit(outcome.state, outcome.result)
        },
        loadDnc: function (rows, actor) {
          const outcome = applyDnc(state, rows, actor)
          return commit(outcome.state, outcome.result)
        },
        setDncActive: function (id, active) {
          return commit(applyDncActive(state, id, active), { status: 'updated' })
        },
        resetDemo: function () {
          const fresh = createSeed()
          return commit(fresh, { status: 'reset' })
        },
        findToken: function (token) {
          return state.consents.find(function (record) {
            return record.publicToken === token
          }) || null
        },
      }
    },
    [state, storageError]
  )

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>
}

export function useData() {
  const value = useContext(DataContext)
  if (!value) throw new Error('useData must be used inside DataProvider')
  return value
}
