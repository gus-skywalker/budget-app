import type { useUserStore } from '@/plugins/userStore'

type UserStore = ReturnType<typeof useUserStore>

const CHECKOUT_CONTEXT_STORAGE_KEY = 'billing.checkout.context'

export interface ActiveWorkspaceContext {
  workspaceId: string
  workspaceName: string | null
}

export interface BillingCheckoutContext {
  workspaceId: string
  workspaceName?: string | null
  billingAccountId?: string | null
  plan?: string | null
  correlationId?: string | null
  storedAt: number
}

const canUseSessionStorage = () => typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'

export const resolveActiveWorkspaceContext = (userStore: UserStore): ActiveWorkspaceContext | null => {
  const workspaceId = String(userStore.getCurrentWorkspaceId || '').trim()
  if (!workspaceId) {
    return null
  }

  const workspaces = userStore.getWorkspaces || []
  const workspace = workspaces.find((item) => String(item.workspaceId || '') === workspaceId)

  return {
    workspaceId,
    workspaceName: workspace?.workspaceName || null,
  }
}

export const resolveAnyWorkspaceContext = (userStore: UserStore): ActiveWorkspaceContext | null => {
  const activeContext = resolveActiveWorkspaceContext(userStore)
  if (activeContext) {
    return activeContext
  }

  const workspaces = userStore.getWorkspaces || []
  const firstWorkspace = workspaces.find((item) => String(item?.workspaceId || '').trim())
  if (!firstWorkspace) {
    return null
  }

  return {
    workspaceId: String(firstWorkspace.workspaceId),
    workspaceName: firstWorkspace.workspaceName || null,
  }
}

export const requireActiveWorkspaceContext = (userStore: UserStore): ActiveWorkspaceContext => {
  const context = resolveActiveWorkspaceContext(userStore)
  if (!context) {
    throw new Error('Selecione um workspace para continuar.')
  }
  return context
}

export const saveBillingCheckoutContext = (context: Omit<BillingCheckoutContext, 'storedAt'> & { storedAt?: number }) => {
  if (!canUseSessionStorage()) return

  const workspaceId = String(context.workspaceId || '').trim()
  if (!workspaceId) return

  const payload: BillingCheckoutContext = {
    workspaceId,
    workspaceName: context.workspaceName ?? null,
    billingAccountId: context.billingAccountId ?? null,
    plan: context.plan ?? null,
    correlationId: context.correlationId ?? null,
    storedAt: context.storedAt ?? Date.now(),
  }

  window.sessionStorage.setItem(CHECKOUT_CONTEXT_STORAGE_KEY, JSON.stringify(payload))
}

export const readBillingCheckoutContext = (): BillingCheckoutContext | null => {
  if (!canUseSessionStorage()) return null

  const raw = window.sessionStorage.getItem(CHECKOUT_CONTEXT_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    const workspaceId = String(parsed?.workspaceId || '').trim()
    if (!workspaceId) {
      clearBillingCheckoutContext()
      return null
    }

    return {
      workspaceId,
      workspaceName: parsed?.workspaceName ? String(parsed.workspaceName) : null,
      billingAccountId: parsed?.billingAccountId ? String(parsed.billingAccountId) : null,
      plan: parsed?.plan ? String(parsed.plan) : null,
      correlationId: parsed?.correlationId ? String(parsed.correlationId) : null,
      storedAt: Number(parsed?.storedAt || Date.now()),
    }
  } catch {
    clearBillingCheckoutContext()
    return null
  }
}

export const clearBillingCheckoutContext = () => {
  if (!canUseSessionStorage()) return
  window.sessionStorage.removeItem(CHECKOUT_CONTEXT_STORAGE_KEY)
}
