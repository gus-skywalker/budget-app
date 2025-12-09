import { useUserStore } from '@/plugins/userStore'

export function getCurrentCompanyId(): string | null {
  const store = useUserStore()
  return store.user?.companyId || null
}