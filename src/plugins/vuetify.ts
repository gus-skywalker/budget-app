// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { createVuetify } from 'vuetify'

const lightTheme = {
  dark: false,
  colors: {
    primary:    '#b6551f',
    secondary:  '#205f63',
    accent:     '#205f63',
    error:      '#dc2626',
    warning:    '#d97706',
    success:    '#205f63',
    info:       '#205f63',
    background: '#f5f1e8',
    surface:    '#ffffff',
  },
}

const darkTheme = {
  dark: true,
  colors: {
    primary:    '#e8693e',
    secondary:  '#2dd4c0',
    accent:     '#2dd4c0',
    error:      '#f87171',
    warning:    '#fbbf24',
    success:    '#34d399',
    info:       '#818cf8',
    background: '#0e1117',
    surface:    '#161c27',
  },
}

export default createVuetify(
  {
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi
      }
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: lightTheme,
        dark:  darkTheme,
      },
    },
  }
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
)
