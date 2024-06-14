// src/shims-vue.d.ts
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// src/shims-webfontloader.d.ts
declare module 'webfontloader' {
  export function load(config: { google?: { families: string[] } }): void
}
