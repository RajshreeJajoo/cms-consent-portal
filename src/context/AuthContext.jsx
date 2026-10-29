import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CAMPAIGNS, assignedCampaignId, initialDirectory } from '../data/seed.js'
import { uid } from '../lib/ids.js'

const AuthContext = createContext(null)
const SESSION_KEY = 'cms-consent-session'
const DIRECTORY_KEY = 'cms-access-directory-v1'

function fillAdviserCampaign(account) {
  if (!account || account.role !== 'adviser') return account
  if (account.campaignIds && account.campaignIds.length) return account
  const id = assignedCampaignId(account)
  if (!id) return account
  return Object.assign({}, account, { campaignIds: [id] })
}

function loadDirectory() {
  try {
    const raw = localStorage.getItem(DIRECTORY_KEY)
    if (!raw) return initialDirectory().map(fillAdviserCampaign)
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.length) return initialDirectory().map(fillAdviserCampaign)
    return parsed.map(fillAdviserCampaign)
  } catch (error) {
    return initialDirectory().map(fillAdviserCampaign)
  }
}

function toSession(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.status === 'approved' ? account.role : 'pending',
    adviserId: account.adviserId || null,
    campaignIds: account.campaignIds || null,
    status: account.status,
  }
}

export function AuthProvider({ children }) {
  const [directory, setDirectory] = useState(loadDirectory)
  const [user, setUser] = useState(function () {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch (error) {
      return null
    }
  })

  useEffect(function () {
    try {
      localStorage.setItem(DIRECTORY_KEY, JSON.stringify(directory))
    } catch (error) {
      return
    }
  }, [directory])

  useEffect(
    function () {
      if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
      else sessionStorage.removeItem(SESSION_KEY)
    },
    [user]
  )

  useEffect(
    function () {
      if (!user) return
      const account = directory.find(function (item) { return item.id === user.id })
      if (!account) return
      const next = toSession(account)
      const sameCampaigns = JSON.stringify(next.campaignIds || null) === JSON.stringify(user.campaignIds || null)
      if (next.role === user.role && next.adviserId === user.adviserId && next.status === user.status && sameCampaigns) return
      setUser(next)
    },
    [directory, user]
  )

  const api = useMemo(
    function () {
      function saveDirectory(next) {
        setDirectory(next)
      }

      return {
        user: user,
        directory: directory,
        login: function (email, password) {
          const found = directory.find(function (account) {
            return account.email.toLowerCase() === String(email || '').trim().toLowerCase() && account.password === password
          })
          if (!found) return { ok: false, error: 'Those sign-in details were not recognised.' }
          if (found.status === 'rejected') {
            return { ok: false, error: 'An admin has not approved this account.' }
          }
          const session = toSession(found)
          setUser(session)
          return { ok: true, user: session }
        },
        requestAccess: function (input) {
          const name = String(input.name || '').trim()
          const email = String(input.email || '').trim().toLowerCase()
          const password = String(input.password || '')
          if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { ok: false, error: 'Enter your name and Manulife email address.' }
          }
          if (password.length < 8) return { ok: false, error: 'Use the password issued for your Manulife account.' }
          if (directory.some(function (account) { return account.email.toLowerCase() === email })) {
            return { ok: false, error: 'This email is already in the access list. Sign in, or ask an admin if it is still pending.' }
          }
          const account = {
            id: uid('usr'),
            name: name,
            email: email,
            password: password,
            status: 'pending',
            role: null,
            adviserId: null,
            requestedAt: new Date().toISOString(),
          }
          saveDirectory([account].concat(directory))
          const session = toSession(account)
          setUser(session)
          return { ok: true, user: session }
        },
        approveAccess: function (id, role, campaignIds) {
          const selected = CAMPAIGNS.filter(function (campaign) {
            return campaignIds && campaignIds.indexOf(campaign.id) >= 0
          }).slice(0, 1)
          if (role === 'adviser' && !selected.length) return { ok: false, error: 'Choose one campaign.' }
          const next = directory.map(function (account) {
            if (account.id !== id) return account
            return Object.assign({}, account, {
              status: 'approved',
              role: role,
              adviserId: role === 'adviser' ? selected[0].adviserId : null,
              campaignIds: role === 'adviser' ? selected.map(function (campaign) { return campaign.id }) : null,
            })
          })
          saveDirectory(next)
          return { ok: true }
        },
        rejectAccess: function (id) {
          saveDirectory(directory.map(function (account) {
            if (account.id !== id) return account
            return Object.assign({}, account, { status: 'rejected', role: null, adviserId: null })
          }))
          return { ok: true }
        },
        logout: function () {
          setUser(null)
        },
      }
    },
    [user, directory]
  )

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
