# Metschoo Library

Source code of Metschoo Library web app, made with Vue 3 and Supabase.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
(and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Development

The example .env file is included under the name .env.example, there are two variables: `SUPABASE_URL` and
`SUPABASE_ANON_KEY`. When developing, make copy of the file and rename the file to .env.local so git can ignore it.

This project uses PNPM. install it first on your machine if you don't have it:

```sh
npm i -g pnpm
```

Then install dependencies:

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Compile and Minify for Production

```sh
pnpm build
```

You can preview the build with

```sh
pnpm preview
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

### Todo

The codebase is really messy at the moment. If you would like to help, here are
some tasks, ordered by priority:

- code style
  - change function names and variables into English (TBD don't do it yet)
- make sure all UI elements are written in Indonesian
- app styling
  - move to Tailwind (RFC)
  - integrate a component/UI library (RFC)
  - Make the ugly admin routes pretty
- ~~set up TypeScript~~
  - ~~add types~~
  - ~~set up config for dynamic imports (`@`)~~
- move buku API implentation details in a Pinia store
- implement unit testing with Vitest

In the future we would also like to write a full documentation of some sorts.
