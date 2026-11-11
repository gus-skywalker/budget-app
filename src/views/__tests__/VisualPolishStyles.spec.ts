import { describe, expect, it } from 'vitest'
import { compileStyle, parse } from '@vue/compiler-sfc'
import choosePlanSource from '@/views/ChoosePlan.vue?raw'
import blogSource from '@/views/BlogView.vue?raw'
import workspaceSource from '@/views/SelectWorkspaceView.vue?raw'
import notificationSource from '@/components/NotificationBellDropdown.vue?raw'

function compiledStyle(source: string, filename: string): string {
  const { descriptor } = parse(source)
  const style = descriptor.styles[0]
  expect(style).toBeDefined()

  const { code, errors } = compileStyle({
    source: style.content,
    filename,
    id: 'visual-polish-test',
    scoped: true,
  })
  expect(errors).toEqual([])
  return code
}

describe('light visual polish stays within its intended pages', () => {
  it('scopes the plan palette and offer actions to the plan page', () => {
    const css = compiledStyle(choosePlanSource, 'ChoosePlan.vue')
    expect(css).toContain('.v-theme--light #choose-plan-page .plan-offer__primary')
    expect(css).toContain('.v-theme--light #choose-plan-page .feature-context')
    expect(css).not.toMatch(/(?:^|})\s*\.v-theme--light\s*\{/m)
  })

  it('limits the blog accents to its authenticated route', () => {
    const css = compiledStyle(blogSource, 'BlogView.vue')
    expect(css).toContain('.v-theme--light #blog-page.blog-page--app .hero__copy')
    expect(css).toContain('.v-theme--dark #blog-page.blog-page--app')
    expect(css).not.toMatch(/(?:^|})\s*\.v-theme--light\s*\{/m)
    expect(css).not.toMatch(/(?:^|})\s*\.v-theme--dark\s*\{/m)
  })

  it('keeps the workspace selector light and dark styles separate', () => {
    const css = compiledStyle(workspaceSource, 'SelectWorkspaceView.vue')
    expect(css).toContain('.v-theme--light .select-workspace-view .gradient-card')
    expect(css).toContain('.select-workspace-view[data-v-visual-polish-test]')
  })

  it('does not recolor the entire dark app for an empty notification state', () => {
    const css = compiledStyle(notificationSource, 'NotificationBellDropdown.vue')
    expect(css).toContain('.v-theme--dark .notification-empty__illustration')
    expect(css).not.toMatch(/(?:^|})\s*\.v-theme--dark\s*\{/m)
  })
})
