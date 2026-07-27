export interface LocalizableCategory {
  id?: number | null
  categoryId?: number | null
  code?: string | null
  categoryCode?: string | null
  name?: string | null
  categoryName?: string | null
  systemDefined?: boolean | null
}

export interface CategoryLocalizationOptions {
  translate: (key: string) => string
  hasTranslation: (key: string) => boolean
  onMissingCode?: (code: string) => void
}

export const localizeCategory = (
  category: LocalizableCategory | null | undefined,
  options: CategoryLocalizationOptions,
) => {
  const { translate, hasTranslation, onMissingCode } = options
  if (!category?.categoryId && !category?.id) {
    return translate('reportAnalytics.uncategorized')
  }
  if (category.systemDefined === false) {
    return category.categoryName || category.name || translate('reportAnalytics.customCategory')
  }

  const code = String(category.categoryCode || category.code || '').trim().toLowerCase()
  const key = `categories.${code}`
  if (code && hasTranslation(key)) {
    return translate(key)
  }
  if (code) {
    onMissingCode?.(code)
  }
  return translate('reportAnalytics.unknownCategory')
}
