import { describe, expect, it } from 'vitest'
import { isSidebarRouteActive, sidebarRouteCurrentState } from '@/utils/sidebarNavigation'

describe('sidebar route families', () => {
  it('keeps a parent selected through its decision, scenario, closing and blog deep links', () => {
    expect(isSidebarRouteActive('decisions', 'decisions', 'decision-detail')).toBe(true)
    expect(isSidebarRouteActive('decisions', 'decisions', 'planning-decision-start')).toBe(true)
    expect(isSidebarRouteActive('planning-scenarios', 'planning-scenarios', 'planning-scenarios-result')).toBe(true)
    expect(isSidebarRouteActive('planning-scenarios', 'planning-scenarios', 'planning-scenarios-debt-edit')).toBe(true)
    expect(isSidebarRouteActive('planning-financial-closings', 'planning-financial-closings', 'closing-rules')).toBe(true)
    expect(isSidebarRouteActive('blog-app', 'blog-app', 'blog-app-article')).toBe(true)
    expect(sidebarRouteCurrentState('planning-scenarios', 'planning-scenarios', 'planning-scenarios-result')).toBe('location')
  })

  it('does not confuse decisions, insights, scenarios and budget', () => {
    expect(isSidebarRouteActive('decisions', 'decisions', 'insights')).toBe(false)
    expect(isSidebarRouteActive('planning-scenarios', 'planning-scenarios', 'decision-detail')).toBe(false)
    expect(isSidebarRouteActive('planning-budget', 'planning-budget', 'planning-scenarios-result')).toBe(false)
    expect(isSidebarRouteActive('planning-budget', 'planning-budget', 'planning-budget')).toBe(true)
    expect(sidebarRouteCurrentState('planning-budget', 'planning-budget', 'planning-budget')).toBe('page')
    expect(isSidebarRouteActive('planning-scenarios', 'planning-scenarios', undefined)).toBe(false)
  })
})
