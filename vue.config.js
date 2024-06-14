// Importa defineConfig diretamente do módulo @vue/cli-service
import { defineConfig } from '@vue/cli-service'

// Configuração inicial usando defineConfig
export default defineConfig({
  pluginOptions: {
    vuetify: {
      // Aqui você pode configurar opções específicas do Vuetify, se necessário
      // Exemplo: theme: { dark: true }
      // Mais opções em: https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    }
  }

  // Configuração do Vue CLI Service pode continuar aqui, se necessário
})

// Importa VuetifyPlugin diretamente do módulo webpack-plugin-vuetify
import { VuetifyPlugin } from 'webpack-plugin-vuetify'

// Adiciona o VuetifyPlugin aos plugins de webpack
export const configureWebpack = {
  plugins: [
    new VuetifyPlugin({ autoImport: true }) // autoImport habilitado por padrão
  ]
}
