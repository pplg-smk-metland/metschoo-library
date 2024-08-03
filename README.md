# Metschoo Library

Source code of Metschoo Library web app, made with Vue 3 and Supabase. Please see
[CONTRIBUTING.md](CONTRIBUTING.md) before doing anything

## Development

There are two ways of local development. The first one is easier and quicker:

This project uses PNPM. install it first on your machine if you don't have it:

```sh
npm i -g pnpm
```

Then install dependencies:

```sh
pnpm install
```

Here are a couple of commands you might need:

```sh
pnpm dev # Compile and Hot-Reload for Development
pnpm build # Compile and Minify for Production
pnpm preview # preview the build
pnpm lint # Lint with [ESLint](https://eslint.org/)
```

### Supabase

Now copy the `.env.example` file and rename the copy to `.env`, fill the
variables with the corresponding values from the dashboard, `SUPABASE_URL` and
`SUPABASE_ANON_KEY`.

This project already has the Supabase CLI installed as a dependency, you can run
it with `pnpm supabase`. For local development you have to have Docker installed
locally. I recommend Docker Desktop. If you don't want to install Docker, you
can connect directly to cloud. To initialize run `pnpm supabase init`, then
`pnpm supabase start`, (it will take a while at first). Then you can run `pnpm
supabase db reset` to migrate and seed all local dev data. Read more at
[supabase's official docs](https://supabase.com/docs/guides/cli/getting-started).

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
  - make sure all UI elements are written in Indonesian
  - change function names and variables into English (TBD don't do it yet)
- Make the ugly admin routes pretty
- admin stuff
  - automate the process of adding a new admin user in local dev and prod
  - (optional) make a page in the admin for adding new admin users
- ~~set up TypeScript~~
  - ~~add types~~
  - ~~set up config for dynamic imports (`@`)~~
- implement forgot password flow
- implement oAuth
- move buku API implentation details in a Pinia store
- implement unit testing with Vitest

In the future we would also like to write a full documentation of some sorts.
