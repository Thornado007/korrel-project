# Korrel — Web

The public Next.js site for Korrel: gallery, wiki, and about pages, backed by
content from the `korrel-studio` Sanity project.

## Getting Started

Install dependencies and copy the environment example:

```bash
npm install
cp .env.example .env.local
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Environment Variables

This app reads its Sanity connection details from three environment
variables. They are **not secret** (they're exposed to the browser via the
`NEXT_PUBLIC_` prefix, since the image URL builder and Sanity client run on
both server and client), but they must still be present at build time or the
app will throw on boot.

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID | `18qry6x0` |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset to read from | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | API version (`YYYY-MM-DD`) | `2024-01-01` |

See `.env.example` for a ready-to-copy template. These same three values must
also be set in your Vercel project (see below) — local `.env.local` files are
never deployed.

## Deploying to Vercel

1. Push this repository (or just the `korrel-web` folder, if using a
   monorepo import) to GitHub/GitLab/Bitbucket.
2. In the [Vercel dashboard](https://vercel.com/new), import the project and
   set the **Root Directory** to `korrel-web` (important if this repo also
   contains `korrel-studio`).
3. Vercel auto-detects Next.js — leave the build command (`next build`) and
   output settings as default.
4. Under **Settings → Environment Variables**, add the three variables from
   the table above (for the `Production`, `Preview`, and `Development`
   environments as needed). Values can be copied straight from `.env.local`
   or from the Sanity management console at
   [sanity.io/manage](https://sanity.io/manage).
5. Deploy. Every push to your production branch triggers a new deployment;
   pull requests get their own preview URLs automatically.

If you ever add a private/secret Sanity API token (e.g. for previewing drafts
or writing data), add it as `SANITY_API_READ_TOKEN` (no `NEXT_PUBLIC_` prefix)
so it stays server-only, and wire it into `src/sanity/lib/client.ts`.

## Triggering a Sanity Studio Deploy

The Studio (`korrel-studio`) is a separate app from this site and is deployed
independently to Sanity's hosting, not to Vercel.

From the `korrel-studio` folder:

```bash
cd ../korrel-studio
npm install
npx sanity deploy
```

This builds the Studio and publishes it to your configured Studio hostname
(configured the first time you run `deploy`, or found in
[sanity.io/manage](https://sanity.io/manage) under your project). Content
edits made in the Studio go live immediately via the Content API and don't
require a redeploy of either app — you only need to re-run `sanity deploy`
when the **schema or Studio configuration** changes.

If schema fields change, remember to also update the corresponding GROQ
queries and TypeScript types in `korrel-web/src/sanity/` so the site keeps
fetching the right shape of data.

## Project Structure

- `src/app/` — routes (`/`, `/gallery`, `/wiki`, `/wiki/[slug]`, `/about`)
- `src/components/` — shared UI, including the sitewide image lightbox
  (`components/lightbox/`) and the homepage `BeforeAfterSlider`
- `src/sanity/` — Sanity client, image URL builder, GROQ queries, and types

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
