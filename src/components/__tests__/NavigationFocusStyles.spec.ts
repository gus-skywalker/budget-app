import { describe, expect, it } from 'vitest'
import { compileStyle, parse } from '@vue/compiler-sfc'
import sidebarSource from '@/components/SideBar.vue?raw'
import notificationSource from '@/components/NotificationBellDropdown.vue?raw'

function compiledStyle(source: string, filename: string): string {
  const { descriptor } = parse(source)
  const style = descriptor.styles[0]
  expect(style).toBeDefined()

  const { code, errors } = compileStyle({
    source: style.content,
    filename,
    id: 'navigation-focus-test',
    scoped: true,
  })
  expect(errors).toEqual([])
  return code
}

describe('navigation keyboard focus styles', () => {
  it('keeps a visible focus ring on the mobile trigger, drawer controls and theme switch', () => {
    const css = compiledStyle(sidebarSource, 'SideBar.vue')
    expect(css).toMatch(/\.mobile-nav-trigger\[data-v-[^\]]+\]:focus-visible/)
    expect(css).toContain('.v-list-item:focus-visible')
    expect(css).toContain('.v-btn:focus-visible')
    expect(css).toContain('.v-selection-control__wrapper:has(input:focus-visible)')
  })

  it('keeps a visible focus ring on the notification trigger', () => {
    const css = compiledStyle(notificationSource, 'NotificationBellDropdown.vue')
    expect(css).toMatch(/\.notification-bell\[data-v-[^\]]+\]:focus-visible/)
  })
})
