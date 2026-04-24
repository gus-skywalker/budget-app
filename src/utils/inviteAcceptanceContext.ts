const STORAGE_KEY = 'workspaceInvite.acceptanceContext'

export interface InviteAcceptanceContext {
  token: string
  redirect: string
  invitedEmail?: string | null
}

const normalizeString = (value: unknown): string => String(value || '').trim()

export const saveInviteAcceptanceContext = (context: Partial<InviteAcceptanceContext>) => {
  const token = normalizeString(context.token)
  const redirect = normalizeString(context.redirect) || `/invite/accept?token=${encodeURIComponent(token)}`
  const invitedEmail = normalizeString(context.invitedEmail)

  if (!token) return

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token,
      redirect,
      invitedEmail: invitedEmail || null
    } satisfies InviteAcceptanceContext)
  )
}

export const readInviteAcceptanceContext = (): InviteAcceptanceContext | null => {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    const token = normalizeString(parsed?.token)
    const redirect = normalizeString(parsed?.redirect)
    const invitedEmail = normalizeString(parsed?.invitedEmail)

    if (!token || !redirect) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }

    return {
      token,
      redirect,
      invitedEmail: invitedEmail || null
    }
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const clearInviteAcceptanceContext = () => {
  sessionStorage.removeItem(STORAGE_KEY)
}
