# Korrel

A film-scanning archive and reference site — gallery, wiki, services, and the people doing the work.

Built with **Next.js 16** (frontend) and **Sanity** (CMS / content studio).

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Pages & Features](#pages--features)
4. [Prerequisites](#prerequisites)
5. [Local Setup (step by step)](#local-setup-step-by-step)
6. [Running Locally](#running-locally)
7. [How Sanity Works](#how-sanity-works)
8. [Deploy to Cloudflare Pages via GitHub](#deploy-to-cloudflare-pages-via-github)
9. [Auto-Rebuild When Content Changes](#auto-rebuild-when-content-changes)
10. [Sanity Studio Link](#sanity-studio-link)
11. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
korrel-project/
├── korrel-studio/          ← Sanity Studio (CMS dashboard)
│   ├── schemaTypes/        ← Content models (scanGallery, wikiArticle, etc.)
│   ├── sanity.config.ts    ← Studio config (project ID, dataset, plugins)
│   ├── sanity.cli.ts       ← CLI config
│   └── package.json
│
├── korrel-web/             ← Next.js 16 frontend
│   ├── src/
│   │   ├── app/            ← Pages (App Router)
│   │   │   ├── page.tsx            ← Home
│   │   │   ├── about/page.tsx      ← About
│   │   │   ├── gallery/page.tsx    ← Scan Gallery
│   │   │   ├── services/page.tsx   ← Services
│   │   │   └── wiki/               ← Wiki (landing + category + article)
│   │   ├── components/     ← UI components (Nav, Footer, Lightbox, etc.)
│   │   └── sanity/         ← Sanity client, queries, types, image helpers
│   ├── .env.example        ← Environment variables template
│   ├── .env.local          ← Your local env (not committed to git)
│   ├── next.config.ts
│   └── package.json
│
├── .gitignore
└── README.md               ← You are here
```

---

## Tech Stack

| Layer     | Technology                                    |
| --------- | --------------------------------------------- |
| Frontend  | Next.js 16 (App Router, React 19, Turbopack)  |
| Styling   | Tailwind CSS v4                                |
| CMS       | Sanity (hosted, headless)                      |
| Fonts     | Geist Sans & Geist Mono (Google Fonts)         |
| Images    | Sanity CDN (`cdn.sanity.io`) via `next/image`  |
| Hosting   | Cloudflare Pages (static export)               |

---

## Pages & Features

| Route                             | Description                                      |
| --------------------------------- | ------------------------------------------------ |
| `/`                               | Home — hero with before/after slider, about text  |
| `/gallery`                        | Grid of restored scans with lightbox + zoom       |
| `/services`                       | Service cards with images                         |
| `/wiki`                           | Wiki landing — selected articles on top, category submenus below |
| `/wiki/category/[slug]`           | Articles filtered by category                     |
| `/wiki/[slug]`                    | Full wiki article (Portable Text + image blocks)  |
| `/about`                          | About page                                        |

### Special Components

- **Before/After Slider** — drag to compare two images (home hero + wiki articles)
- **Lightbox** — full-screen image viewer with pinch-to-zoom, pan, keyboard nav
- **Image Comparison** — slider, overlay-switch, and slideshow modes for wiki articles

---

## Writing Wiki Articles

The article editor (`Wiki Article` → *Body*) is a free sequence of blocks, so
text and images can be interleaved in any order.

| Block | What it does |
| ----- | ------------ |
| **Text**             | Headings (H2–H4), lists, quote, bold/italic/underline/strike/code/highlight, external + internal links |
| **Image**            | One full-width image with its label and caption shown underneath |
| **Image Group**      | 1–4 images per row. Pick the *Layout* (stacked, 2/3/4 across) and *Image framing* (whole image, or equal cropped tiles) |
| **Image Comparison** | *Slider* (drag across 2 images), *Overlay* (any number of images stacked — big numbered buttons underneath switch between them), *Slideshow* (browse with prev/next, info shown underneath) |
| **Callout**          | Highlighted Note / Tip / Warning box |

### Image metadata & the comparison database

Every image in an article body shares the same fields:

- **Label** — short name shown under the image and on comparison buttons
- **Caption** — longer description shown underneath
- **Alt text** — for screen readers and search engines
- **Include in comparison database** — turn on for genuine sample scans that
  should be comparable across articles. Only then do the **taxonomy tags**
  (lens, scanner, film stock, light source, …) appear — the same taxonomy the
  Scan Gallery uses. Leave it off for product shots, screenshots and other
  illustrative photos, which need no metadata.

### Categories are optional

`Categories` is a multi-select, so an article can appear under several
equipment submenus — or under none at all. A standalone blog post (e.g. an
RGB-scanning write-up) can simply be left uncategorised and featured via
**Wiki Page → Selected Articles**, which renders it with its thumbnail at the
top of `/wiki`. The legacy single-category field is kept read-only as a
fallback so existing articles keep working.

---

## Prerequisites

Make sure you have these installed:

- **Node.js** — version 18 or higher ([download](https://nodejs.org/))
- **npm** — comes with Node.js
- **Git** — ([download](https://git-scm.com/))

To verify:

```bash
node -v    # should show v18+ or v20+
npm -v     # should show 9+ or 10+
git -v     # should show git version 2.x
```

---

## Local Setup (step by step)

### 1. Clone the repo (if you haven't already)

```bash
git clone https://github.com/YOUR_USERNAME/korrel-project.git
cd korrel-project
```

### 2. Install dependencies for BOTH projects

Open a terminal and run:

```bash
# Install frontend dependencies
cd korrel-web
npm install

# Install studio dependencies
cd ../korrel-studio
npm install
```

### 3. Set up environment variables for the frontend

The frontend needs three environment variables to connect to Sanity.  
A template is already provided:

```bash
cd korrel-web
```

If `.env.local` doesn't exist yet, copy the template:

```bash
# Windows (Command Prompt)
copy .env.example .env.local

# Mac / Linux
cp .env.example .env.local
```

The file should contain:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=18qry6x0
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

> **Note:** These values are already correct for the Korrel project. You don't need to change anything unless you create a new Sanity project.

---

## Running Locally

You need **two terminals** — one for the frontend, one for the studio.

### Terminal 1 — Start the frontend (Next.js)

```bash
cd korrel-web
npm run dev
```

Opens at: **http://localhost:3000**

### Terminal 2 — Start the Sanity Studio

```bash
cd korrel-studio
npm run dev
```

Opens at: **http://localhost:3333**

### Quick reference

| Command                | What it does                         |
| ---------------------- | ------------------------------------ |
| `cd korrel-web`        | Go to frontend folder                |
| `npm run dev`          | Start Next.js dev server (port 3000) |
| `npm run build`        | Build for production                 |
| `cd korrel-studio`     | Go to studio folder                  |
| `npm run dev`          | Start Sanity Studio (port 3333)      |
| `npm run build`        | Build studio for deployment          |
| `npm run deploy`       | Deploy studio to Sanity hosting      |

---

## How Sanity Works

Sanity is the CMS (Content Management System) that stores all the content for the site.

### The basics

- **Project ID:** `18qry6x0`
- **Dataset:** `production`
- **Studio URL:** [https://korrel-studio.sanity.studio](https://korrel-studio.sanity.studio) (after deploying)
- **Manage project:** [https://www.sanity.io/manage/project/18qry6x0](https://www.sanity.io/manage/project/18qry6x0)

### Content types in the studio

| Type              | What it is                                           |
| ----------------- | ---------------------------------------------------- |
| `homePage`        | Singleton — hero images, slogan, about section        |
| `servicePage`     | Singleton — service list with titles + images         |
| `scanGallery`     | Gallery items — image + title + tags                  |
| `wikiArticle`     | Wiki articles — title, slug, category, rich text body |
| `wikiCategoryPage`| Category cards for the wiki landing page              |
| `tag`             | Taxonomy tags (lens, film holder, etc.)               |
| `taxonomyCategory`| Groups for tags                                       |

### How the frontend reads content

1. The frontend uses `@sanity/client` to fetch data from Sanity's API
2. Queries are written in GROQ (Sanity's query language)
3. All queries live in `korrel-web/src/sanity/lib/queries.ts`
4. The Sanity client is configured in `korrel-web/src/sanity/lib/client.ts`
5. Images are served from `cdn.sanity.io` and optimized via `next/image`

### How to edit content

1. Open the Sanity Studio (locally via `npm run dev` in `korrel-studio/`, or via the hosted URL)
2. Edit your content (pages, gallery items, wiki articles)
3. Click **Publish** in the studio
4. The frontend picks up changes automatically (within 60 seconds due to revalidation, or on next deploy)

---

## Deploy to Cloudflare Pages via GitHub

### Step 1 — Push your code to GitHub

```bash
# From the korrel-project root folder
git init
git add .
git commit -m "Initial commit"

# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/korrel-project.git
git branch -M main
git push -u origin main
```

### Step 2 — Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **Workers & Pages** in the left sidebar
3. Click **Create** → **Pages** → **Connect to Git**
4. Sign in to GitHub and select the `korrel-project` repository
5. Configure the build:

| Setting              | Value                       |
| -------------------- | --------------------------- |
| **Production branch** | `main`                     |
| **Build command**     | `cd korrel-web && npm install && npm run build` |
| **Build output directory** | `korrel-web/.next`     |
| **Root directory**    | `/` (leave as default)      |
| **Framework preset**  | `Next.js`                   |

> **Important:** If Cloudflare doesn't offer a Next.js preset, use "None" and set the build command and output directory manually as shown above.

### Step 3 — Add environment variables

Still on the Cloudflare Pages setup screen (or go to **Settings → Environment Variables** after creating):

Add these three variables for **both Production and Preview**:

| Variable Name                      | Value          |
| ---------------------------------- | -------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`    | `18qry6x0`    |
| `NEXT_PUBLIC_SANITY_DATASET`       | `production`   |
| `NEXT_PUBLIC_SANITY_API_VERSION`   | `2024-01-01`   |

### Step 4 — Deploy

Click **Save and Deploy**. Cloudflare will:
1. Pull your code from GitHub
2. Run `npm install` and `npm run build` in the `korrel-web` folder
3. Deploy the built site to a `.pages.dev` URL

### Step 5 — Add a custom domain (optional)

1. In your Cloudflare Pages project, go to **Custom Domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `korrel.com`)
4. Follow the DNS instructions

### Every future `git push` to `main` will automatically trigger a new deploy.

---

## Auto-Rebuild When Content Changes

When you publish new content in Sanity, you want the site to rebuild. Here's how:

### Option A — Manual rebuild

Go to Cloudflare Pages → your project → **Deployments** → click **Retry deployment**.

### Option B — Automatic via Sanity webhook (recommended)

1. In Cloudflare Pages, go to your project **Settings → Builds → Deploy hooks**
2. Click **Add deploy hook** and copy the URL
3. Go to [sanity.io/manage](https://www.sanity.io/manage/project/18qry6x0) → **API** → **Webhooks**
4. Click **Create webhook**:

| Setting       | Value                                    |
| ------------- | ---------------------------------------- |
| **Name**      | `Cloudflare Pages Rebuild`               |
| **URL**       | Paste the deploy hook URL from step 2    |
| **Trigger on**| `Create`, `Update`, `Delete`             |
| **Filter**    | Leave empty (triggers on all changes)    |

Now every time you publish content in Sanity, the site rebuilds automatically.

---

## Sanity Studio Link

### Access the studio

- **Locally:** Run `npm run dev` in the `korrel-studio` folder → opens at `http://localhost:3333`
- **Online:** After deploying with `npm run deploy` in the `korrel-studio` folder → hosted at `https://korrel-studio.sanity.studio`
- **Manage project:** [https://www.sanity.io/manage/project/18qry6x0](https://www.sanity.io/manage/project/18qry6x0)

### Deploy the studio online

```bash
cd korrel-studio
npm run deploy
```

This deploys the Sanity Studio to `https://korrel-studio.sanity.studio` so you can edit content from anywhere without running it locally.

### Add CORS origins (if needed)

If you deploy the frontend to a new domain, you may need to allow it in Sanity:

1. Go to [sanity.io/manage](https://www.sanity.io/manage/project/18qry6x0) → **API** → **CORS origins**
2. Add your domain (e.g., `https://korrel.pages.dev`)
3. Check **Allow credentials** if you plan to use authenticated requests

---

## Troubleshooting

### "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"

You don't have a `.env.local` file in `korrel-web/`. Create one:

```bash
cd korrel-web
copy .env.example .env.local    # Windows
cp .env.example .env.local      # Mac/Linux
```

### Build fails with "Error while requesting resource" (Google Fonts)

This happens when fonts can't be downloaded during the build (no internet or firewall). The build will work fine on Cloudflare Pages (they have internet). For local builds, make sure you're connected to the internet.

### "Module not found" errors during build

Run `npm install` in the `korrel-web` folder to make sure all dependencies are installed:

```bash
cd korrel-web
npm install
```

### Studio shows "Unauthorized" or CORS error

Add `http://localhost:3333` to your Sanity CORS origins:

1. Go to [sanity.io/manage/project/18qry6x0](https://www.sanity.io/manage/project/18qry6x0) → **API** → **CORS origins**
2. Add `http://localhost:3333` with **Allow credentials** checked

### Images not loading

Make sure `cdn.sanity.io` is in `next.config.ts` under `images.remotePatterns` (it already is by default).

### Changes in Sanity not showing on the frontend

- **Locally:** Pages revalidate every 60 seconds. Wait or restart the dev server.
- **On Cloudflare:** You need to rebuild. Use the webhook (see [Auto-Rebuild](#auto-rebuild-when-content-changes)) or manually trigger a deployment.

---

## Summary of All Commands

```bash
# ─── FRONTEND (korrel-web) ───────────────────────
cd korrel-web
npm install              # Install dependencies
npm run dev              # Start dev server → localhost:3000
npm run build            # Production build
npm run start            # Start production server locally

# ─── SANITY STUDIO (korrel-studio) ───────────────
cd korrel-studio
npm install              # Install dependencies
npm run dev              # Start studio → localhost:3333
npm run build            # Build studio
npm run deploy           # Deploy studio to sanity.studio
```
