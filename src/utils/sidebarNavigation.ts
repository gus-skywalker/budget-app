const childRoutes: Record<string, readonly string[]> = {
  decisions: ['decision-detail', 'planning-decision-start'],
  'blog-app': ['blog-app-article', 'blog-playbook-hire', 'blog-playbook-pay-now-or-installments'],
  'planning-financial-closings': [
    'closing-import-wizard',
    'closing-publication-history',
    'closing-rules',
    'closing-result',
    'closing-decision',
  ],
  'planning-scenarios': [
    'planning-scenarios-new',
    'planning-scenarios-debt-new',
    'planning-scenarios-edit',
    'planning-scenarios-debt-edit',
    'planning-scenarios-result',
  ],
}

export function sidebarRouteCurrentState(itemKey: string, targetName: string | undefined, currentName: string | undefined): 'page' | 'location' | undefined {
  if (!targetName || !currentName) return undefined
  if (targetName === currentName) return 'page'
  return childRoutes[itemKey]?.includes(currentName) ? 'location' : undefined
}

export function isSidebarRouteActive(itemKey: string, targetName: string | undefined, currentName: string | undefined): boolean {
  return sidebarRouteCurrentState(itemKey, targetName, currentName) !== undefined
}
