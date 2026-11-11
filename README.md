# budget-app

This template helps you get started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Production

```sh
npm run build
pm2 start ecosystem.config.cjs
node server.cjs
```

Production browser-facing API variables should point to public HTTPS domains:

```env
VITE_API_BASE_URL=https://api.cobudget.app/api
VITE_AUTH_URL=https://auth.cobudget.app
VITE_PAYMENT_URL=https://api.cobudget.app/api
```

The frontend must not use `*.railway.internal` because browsers cannot resolve Railway private networking.
