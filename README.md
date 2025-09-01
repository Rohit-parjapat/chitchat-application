# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).
cd my-turborepo

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager


# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
# Chitchat Application

yarn exec turbo dev --filter=web

pnpm exec turbo dev --filter=web



- Real-time messaging (Socket.io)
- User authentication (JWT, cookies)
- Friend requests and user search
- Responsive dashboard with sidebar navigation
- Chat list, chat box, and notifications
- Built with TypeScript throughout

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.



By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo


# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)

turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login


```



- Frontend uses service name `api` to reach backend in Docker Compose
- All requests from frontend go to `NEXT_PUBLIC_API_URL`
- Backend uses Prisma for database access
- Real-time events via Socket.io

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:
- apps/web: Next.js app (dashboard, chat, login, register)
- apps/api: Express app (auth, chat, user, friend APIs)
- packages/ui: Shared UI components
- packages/utils: Shared utility functions


```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link


# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
