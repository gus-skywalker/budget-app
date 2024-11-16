// src/shims-vue.d.ts

import 'vue-i18n'
import { I18n } from 'vue-i18n'

declare module 'vue' {
  interface ComponentCustomProperties {
    $i18n: I18n
    $t: (key: string, ...params: unknown[]) => string
  }
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// src/shims-webfontloader.d.ts
declare module 'webfontloader' {
  export function load(config: { google?: { families: string[] } }): void
}
