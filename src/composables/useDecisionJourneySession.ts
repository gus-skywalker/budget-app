import { computed, onScopeDispose, shallowRef, watch } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import type { ScenarioSourceType } from '@/services/ScenarioService'
import {
  beginJourneySession, clearJourneySession, readJourneySession, sameJourneyContext,
  setJourneyValue, JOURNEY_SESSION_KEY, type JourneyContext, type JourneySession,
} from '@/utils/decisionJourneySession'

export function useDecisionJourneySession(onInvalidate: () => void) {
  const userStore = useUserStore()
  const context = computed<JourneyContext | null>(() => {
    const userId = userStore.getUser?.id
    const workspaceId = userStore.getCurrentWorkspaceId
    return userStore.isAuthenticated && userId && workspaceId ? { userId, workspaceId } : null
  })
  const session = shallowRef<JourneySession | null>(null)
  let alive = true
  const isCurrent = (expected = session.value): expected is JourneySession => Boolean(
    alive && expected && session.value?.sessionId === expected.sessionId &&
    sameJourneyContext(context.value, expected) && readJourneySession(context.value)?.sessionId === expected.sessionId
  )
  const start = (type: ScenarioSourceType, scenarioId: string | null = null) => {
    session.value = context.value ? beginJourneySession(context.value, type, scenarioId) : null
    return session.value
  }
  const restore = (type?: ScenarioSourceType) => {
    const stored = readJourneySession(context.value)
    session.value = stored && (!type || stored.sourceType === type) ? stored : null
    return session.value
  }
  const linkScenario = (id: string | null) => {
    if (!isCurrent()) return
    session.value = { ...session.value!, scenarioId: id }
    setJourneyValue(JOURNEY_SESSION_KEY, JSON.stringify(session.value))
  }
  watch(context, (next, previous) => {
    if (sameJourneyContext(next, previous)) return
    if (session.value) clearJourneySession(session.value)
    session.value = null
    onInvalidate()
  }, { flush: 'sync' })
  onScopeDispose(() => { alive = false })
  return { session, start, restore, isCurrent, linkScenario }
}
