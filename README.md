# Metschoo Library

Source code of Metschoo Library web app, made with Vue 3 and Supabase. Please see
[CONTRIBUTING.md](CONTRIBUTING.md) before doing anything

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

### Supabase

This project already has the Supabase CLI installed as a dependency, you can run
it with `pnpm supabase`. For local development You have to have Docker installed
locally. I recommend Docker Desktop. If you don't want to have Docker, you can
connect directly to cloud. To initialize run `pnpm supabase start`, it will take
a while at first. Then `pnpm supabase db reset` to migrate and seed all local dev
data. Read more at [supabase's official docs](https://supabase.com/docs/guides/cli/getting-started).

To add a new admin user, add a new user like usual, through the app or Supabase
dashboard, then run this query in the SQL Editor on the dashboard:

```sql
update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role": "super-admin"}' where auth.users.id = 'id';
```

This will add the role 'super-admin' to the target user.

### Todo

The codebase is really messy at the moment. If you would like to help, here are
some tasks, ordered by priority:

- style
  - change function names and variables into English (TBD don't do it yet)
  - make sure all UI elements are written in Indonesian
- Make the ugly admin routes pretty
- ~~set up TypeScript~~
  - ~~add types~~
  - ~~set up config for dynamic imports (`@`)~~
- move buku API implentation details in a Pinia store
- implement unit testing with Vitest

In the future we would also like to write a full documentation of some sorts.
