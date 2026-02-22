# CI/CD Guide for Beginners

## What is CI/CD?

**CI** stands for **Continuous Integration**. It means: every time you push code to GitHub, automated checks run to make sure you didn't break anything.

**CD** stands for **Continuous Deployment**. It means: after those checks pass, your code automatically gets deployed (published) to your live website.

Right now, MirrorQuiz only uses **CI** (automated checks). Deployment is done manually. This is a good setup for a new project — you want control over when your site goes live.

---

## What is a CI/CD Pipeline?

A **pipeline** is just a series of steps that your code goes through automatically before it reaches your users. Think of it like an assembly line in a factory:

```
Raw materials → Quality check → Assembly → Final inspection → Ship to customer
```

For software, it looks like this:

```
Your code → Lint → Type check → Build → Test → Deploy
```

Each step is a **gate**. If any gate fails, the code stops moving forward and doesn't reach your users. This prevents broken code from ever going live.

### Why Does This Matter?

Without a pipeline, the process looks like this:

1. You write code
2. You push it to GitHub
3. You manually deploy to your live site
4. Users find bugs
5. You panic and fix them

With a pipeline:

1. You write code
2. You push it to GitHub
3. **Automated checks catch problems before deployment**
4. You deploy (manually or automatically) only when checks pass
5. Users get working code

The key insight: **a pipeline catches your mistakes before your users do.**

### Stages of a Typical Pipeline

Most CI/CD pipelines have these stages, in order:

| Stage | What It Does | MirrorQuiz Status |
|-------|-------------|-------------------|
| **Lint** | Checks code style and common mistakes | Active |
| **Type Check** | Validates TypeScript types | Active |
| **Unit Tests** | Tests individual functions in isolation | Not set up yet |
| **Build** | Compiles the app to make sure it can build | Not in CI (you do this manually) |
| **Integration Tests** | Tests features working together | Not set up yet |
| **Deploy to Staging** | Publishes to a test environment | Not set up (don't need it yet) |
| **Deploy to Production** | Publishes to the live site | Manual (you run `bunx wrangler deploy`) |

You don't need every stage right now. As your project grows and you have more users, you add more stages. Here's a realistic timeline:

- **Now (solo developer, pre-launch):** Lint + type check in CI, manual deploy. This is where you are.
- **After launch (real users):** Add automated deploy so pushing to main updates the site automatically.
- **Growing (multiple features in progress):** Add unit tests so you know new code doesn't break old features.
- **Scaling (team or complex features):** Add staging environment to test changes before they hit production.

### How a Pipeline Flows

Pipelines have a concept called **dependencies** — one step can't start until the previous one finishes. This is the "pipeline" part. It flows in one direction:

```
Push to GitHub
      │
      ▼
┌─────────────┐
│  Lint &      │  ← If this fails, everything stops.
│  Type Check  │     You see a red X on GitHub.
└──────┬──────┘
       │ (passes)
       ▼
┌─────────────┐
│   Build     │  ← Only runs if checks passed.
└──────┬──────┘
       │ (passes)
       ▼
┌─────────────┐
│   Deploy    │  ← Only runs if build passed.
│ (Production)│     Your site updates.
└─────────────┘
```

If lint fails, the build never runs. If the build fails, deploy never runs. Each stage is a gatekeeper.

### How This Applies to MirrorQuiz Specifically

Your app runs on **Cloudflare Workers**. The deployment process is:

1. **Build:** `bunx opennextjs-cloudflare build` — takes your Next.js app and compiles it into a format Cloudflare Workers can run
2. **Deploy:** `bunx wrangler deploy` — uploads that compiled code to Cloudflare's servers around the world

Your **database** (Cloudflare D1) and **secrets** (API keys) live separately on Cloudflare — they don't get redeployed with your code. This means:

- Deploying new code **does not** affect your database or lose data
- Deploying new code **does not** change your environment variables
- You can deploy as many times as you want safely
- If you deploy broken code, your database is still fine

The only thing deployment changes is the **application code** — the pages, API routes, and logic.

### What "Environment" Means

You'll hear the word "environment" a lot. It just means "a copy of your app running somewhere." Common environments:

- **Local** (`localhost:3000`) — your computer, for development. Uses `.dev.vars` for secrets.
- **Staging** — a test copy on the internet that only you can see. Same code as production but separate database. (You don't have this.)
- **Production** (`mirrorquiz.com`) — the real thing. Uses secrets set via `wrangler secret put`.

Each environment can have different settings. For example, your local environment uses a fake auth secret (`dev-secret-change-me`) while production uses a real one.

---

## How It Works for MirrorQuiz

### The File

Everything is controlled by one file: `.github/workflows/deploy.yml`

GitHub looks at this file and knows: "When code is pushed, run these steps."

### What Happens When You Push Code

```
You push code to GitHub
        ↓
GitHub sees the workflow file
        ↓
It spins up a fresh computer (called a "runner")
        ↓
It installs bun and your dependencies
        ↓
It runs two checks:
  1. "bun run lint"   — checks your code style (no obvious mistakes)
  2. "bunx tsc --noEmit" — checks your TypeScript types (no type errors)
        ↓
If both pass: green checkmark ✓
If either fails: red X ✗
```

That's it. Nothing gets deployed. Your live site doesn't change. It's just a safety net that catches mistakes before they become problems.

### Where You See This

On your GitHub repo page, next to each commit, you'll see either:
- **Green checkmark** — all checks passed
- **Red X** — something failed (click it to see what)
- **Orange dot** — checks are still running

---

## The Workflow File Explained

Here's the current workflow, line by line:

```yaml
name: CI                          # The name that shows up on GitHub
```

```yaml
on:
  push:
    branches: [main]              # Run when you push to main
  pull_request:
    branches: [main]              # Run when you open a PR to main
```

This means: "Run these checks whenever code lands on the main branch."

```yaml
jobs:
  check:                          # The job name (you can have multiple jobs)
    name: Lint & Type Check       # What shows up in the GitHub UI
    runs-on: ubuntu-latest        # Use a Linux computer to run this
```

```yaml
    steps:
      - uses: actions/checkout@v4           # Download your code
      - uses: oven-sh/setup-bun@v2         # Install bun
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile  # Install your dependencies
      - run: bun run lint                   # Run the linter
      - run: bunx tsc --noEmit              # Run the type checker
```

Each `step` runs one command, in order. If any step fails, the whole job fails and you see a red X.

---

## Key Concepts

### What is Linting?

Linting is like a spell-checker for code. It finds things like:
- Variables you created but never used
- Importing something that doesn't exist
- React patterns that could cause bugs

It doesn't change your code — it just tells you about problems.

Your lint command is `eslint .` which checks all files in the project using the rules defined in `eslint.config.mjs`.

### What is Type Checking?

TypeScript adds types to JavaScript (like saying "this variable is a number, not a string"). The type checker (`tsc --noEmit`) reads all your code and makes sure you're not doing things like passing a string where a number is expected.

`--noEmit` means "just check, don't create any output files."

### What is a Runner?

When GitHub runs your workflow, it creates a temporary virtual computer in the cloud. This computer:
- Starts completely fresh (nothing installed)
- Downloads your code from GitHub
- Installs bun and your packages
- Runs your checks
- Gets deleted when it's done

You don't pay for this — GitHub gives you 2,000 minutes per month of free runner time for private repos, and unlimited for public repos.

### What is `--frozen-lockfile`?

When you run `bun install --frozen-lockfile`, it means "install exactly the versions in my lock file, and fail if anything doesn't match." This ensures the CI computer has the exact same packages as your local computer.

---

## What Was Wrong Before (The Error You Saw)

The old workflow had three jobs:

```
1. Lint & Type Check
        ↓ (if passes)
2. Deploy to Staging     ← This failed
        ↓ (if passes)
3. Deploy to Production
```

**"Deploy to Staging"** failed for two reasons:

1. **No staging environment configured** — The command `wrangler deploy --env staging` looks for a `[env.staging]` section in your `wrangler.jsonc` file. You don't have one because you only have one environment (production).

2. **No CLOUDFLARE_API_TOKEN secret** — The deploy step needs a Cloudflare API token stored as a GitHub Secret. You haven't set one up because you haven't needed automated deployments yet.

**Staging** is a concept where you have two copies of your website:
- **Staging** — a private test version (like `staging.mirrorquiz.com`) where you check things before they go live
- **Production** — the real live website (`mirrorquiz.com`)

This is useful for bigger teams, but overkill for you right now. That's why we simplified the workflow to just run checks.

---

## How You Deploy Right Now (Manual)

Since the workflow only runs checks, you deploy manually from your terminal:

```bash
# Build the app for Cloudflare
bunx opennextjs-cloudflare build

# Deploy to your live site
bunx wrangler deploy
```

This pushes your code to Cloudflare Workers, which hosts your site at `mirrorquiz.com`.

**You are in full control.** Nothing goes live unless you run these two commands.

---

## Adding Automated Deployment Later

When you're ready for automatic deploys (push to GitHub → site updates automatically), here's what you'd do:

### Step 1: Create a Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template
4. Copy the token

### Step 2: Add It as a GitHub Secret

1. Go to your repo on GitHub → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `CLOUDFLARE_API_TOKEN`
4. Value: paste your token

### Step 3: Update the Workflow

Add a deploy job after the check job:

```yaml
  deploy:
    name: Deploy to Production
    needs: check
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bunx opennextjs-cloudflare build
      - run: bunx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

After this, every push to main would: check your code → build → deploy to Cloudflare automatically.

**Don't do this yet** — it's here for when you're ready. Manual deploys give you more control while you're still building.

---

## Summary

| Term | What It Means |
|------|--------------|
| CI | Automated checks that run when you push code |
| CD | Automated deployment after checks pass |
| Workflow | The YAML file that tells GitHub what to do |
| Runner | The temporary computer GitHub uses to run your checks |
| Lint | Code style checker (finds mistakes) |
| Type check | TypeScript validator (finds type errors) |
| Staging | A test version of your site (you don't have one yet) |
| Production | Your live site (mirrorquiz.com) |
| GitHub Secret | A hidden variable stored on GitHub (for API keys) |

### Current Setup

- **CI:** Lint + type check on every push (automatic)
- **CD:** Manual (`bunx opennextjs-cloudflare build && bunx wrangler deploy`)

This is the right setup for where you are. You can add automated deployment later when you're comfortable with the workflow.
