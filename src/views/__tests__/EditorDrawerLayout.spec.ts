import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import transactionsSource from '@/views/TransactionsView.vue?raw'
import categoriesSource from '@/views/CategoriesView.vue?raw'
import scenariosSource from '@/views/ScenariosHubView.vue?raw'
import goalsSource from '@/components/FinancialGoal.vue?raw'

const visualStyles = readFileSync('src/assets/experienceVisual.css', 'utf8')

describe('transaction and category editor layout', () => {
  it('keeps transaction save actions in a shared footer outside the form sections', () => {
    const drawer = transactionsSource.split('<!-- FORM DRAWER (right side slide-over) -->')[1]
      ?.split('<v-dialog')[0]

    expect(drawer).toContain('class="transaction-form-section"')
    expect(drawer).toContain('class="transaction-form-footer"')
    expect(drawer).toMatch(/<\/div>\s*<div class="transaction-form-footer">/)
    expect(drawer).toContain('@click="saveIncome"')
    expect(drawer).toContain('@click="saveExpense"')
    expect(drawer).toContain('@click="cancelFormDrawer"')
    expect(drawer).not.toContain('mdi-content-save')
  })

  it('styles only the intended editors and labels category choices', () => {
    expect(categoriesSource.match(/class="category-drawer"/g)).toHaveLength(3)
    expect(categoriesSource.match(/class="drawer-shell__save"/g)).toHaveLength(3)
    expect(categoriesSource).toContain(':aria-pressed="editorDisplayIcon === icon"')
    expect(categoriesSource).toContain(':aria-pressed="editorDisplayColor === color"')
    expect(visualStyles).toContain('.v-theme--light.transaction-form-drawer')
    expect(visualStyles).toContain('.v-theme--light.category-drawer')
    expect(visualStyles).toContain('.v-navigation-drawer.category-drawer .drawer-shell__footer')
  })

  it('separates the creation cue from the transaction type without cash icons', () => {
    const categoryType = categoriesSource.split('<div class="type-toggle">')[1]?.split('</div>')[0]
    const transactionHeader = transactionsSource.split('<page-header')[1]?.split('</page-header>')[0]

    expect(categoryType).toContain("$t('categories_page.money_out')")
    expect(categoryType).toContain("$t('categories_page.money_in')")
    expect(categoryType).not.toContain('<v-icon')
    expect(categoriesSource.match(/cb-create-action__mark--add/g)).toHaveLength(3)
    expect(transactionHeader?.match(/cb-create-action__mark--add/g)).toHaveLength(2)
    expect(transactionsSource).toContain('transaction-type-chip__dot')
    expect(transactionHeader).not.toContain('mdi-receipt-text-plus-outline')
    expect(visualStyles).toContain('.cb-create-action--secondary .cb-create-action__mark--add')
    expect(visualStyles).toContain('background: #f7fad6')
    expect(visualStyles).not.toContain('#efb066')
  })

  it('uses the same plus cue for scenario and goal creation, without a plus on save', () => {
    expect(scenariosSource.match(/cb-create-action__mark--add/g)).toHaveLength(2)
    expect(goalsSource.match(/cb-create-action__mark--add/g)).toHaveLength(2)
    expect(goalsSource).not.toContain("isEditing ? 'mdi-check' : 'mdi-plus'")
    expect(scenariosSource).not.toContain('↗')
    expect(goalsSource).not.toContain('↗')
  })
})
