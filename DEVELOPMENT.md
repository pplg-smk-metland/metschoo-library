# Contributor manual

## Table of contents

<!--toc:start-->

- [Contributor manual](#contributor-manual)
  - [Table of contents](#table-of-contents)
  - [General workflow](#general-workflow)
  - [Recommended IDE Setup](#recommended-ide-setup)
  - [Project setup](#project-setup)
  - [Supabase](#supabase)
    - [Local environment variables](#local-environment-variables)
    - [Supabase CLI](#supabase-cli)
    - [Admin user](#admin-user)
  - [Todo](#todo)
  <!--toc:end-->

Welcome to the contribution guide for Metschoo Library. Remember this is a team
project and communication is of utmost importance. So when you want to make a
new feature or just implemented a new one, please tell the other team members.

## General workflow

This project uses version control, with the Trunk-based Development (TBD) flow.
Each feature is implemented in a separate, focused and isolated branch, that gets
merged via a pull request so other team members can initiate evaluate the code in
a code review together. Each pull request is, as mentioned, separate, focused and
isolated. Remember to make each commit (and therefore the whole pull request)
small.

Say you want to make implement a new authentication feature with oAuth that enables
users to sign up and log in in just one click with Google or other popular providers.
You would:

1. clone this project locally with `git clone`
2. Install deps (see [installation](#installation))
3. make a new git branch and switch to it (remember to give the branch a name)
   with `git switch -c <BRANCH_NAME>`
4. start working in the git branch. remember just work on the feature you're trying
   to implement, don't touch other code that doesn't have anything to do with it.
   Resist the temptation to refactor everything.
5. After you're done with the feature, push the branch and make a pull request.
   If the feature you're working on is quite large, break it up into several pull
   requests.
6. After all this, ideally other team members will review and correct any mistakes
   in a code review.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
(and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

This project uses [Prettier](https://prettier.io) for formatting. For VS Code,
you can install the Prettier extension

## Project setup

This project uses PNPM, so install it first locally:

```bash
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

## Supabase

### Local environment variables

Now copy the `.env.example` file and rename the copy to `.env`, fill the
variables with the corresponding values from the dashboard, `SUPABASE_URL` and
`SUPABASE_ANON_KEY`.

### Supabase CLI

This project already has the Supabase CLI installed as a dependency, you can run
it with `pnpm supabase`. For local development you have to have Docker installed
locally. I recommend Docker Desktop. If you don't want to install Docker, you
can connect directly to cloud. To initialize run `pnpm supabase init`, then
`pnpm supabase start`, (it will take a while at first). Then you can run `pnpm
supabase db reset` to migrate and seed all local dev data. Read more at
[supabase's official docs](https://supabase.com/docs/guides/cli/getting-started).

### Admin user

To add a new admin user, add a new user like usual, through the app or Supabase
dashboard, then run this query in the SQL Editor on the dashboard:

```sql
update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role": "super-admin"}' where auth.users.id = 'id';
```

This will add the role 'super-admin' to the target user.

## Todo

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
