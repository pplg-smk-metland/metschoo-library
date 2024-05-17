# Contributor manual

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

### Project setup

This project uses PNPM, so install it first locally:

```bash
npm i -g pnpm
```

First cloning this repo and `cd`ing into it, install all dependencies:

```bash
pnpm i
```

Then run the development server.

```bash
pnpm dev
```

### Supabase Setup

This section is still WIP
