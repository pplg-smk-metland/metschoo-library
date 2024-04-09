# metschoo-library-real

Source code of Metschoo Library web app, made with Vue 3.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
(and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Development

The example .env file is included under the name .env.example, there are two variables: `SUPABASE_URL` and
`SUPABASE_ANON_KEY`. When developing, make copy of the file and rename the file to .env.local so git can ignore it.

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

You can preview the build with

```sh
npm run preview
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Todo

The codebase is really messy at the moment. If you would like to help, here are
some tasks, ordered by priority:

- style
  - change function names and variables into English
  - make sure all UI elements are written in Indonesian
- add types (TypeScript)
- set up TypeScript config for dynamic imports (`@`)
- implement unit testing with Vitest

In the future we would also like to write a full documentation of some sorts.
