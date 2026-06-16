# Project Tracker, deployment notes

The tracker is a new section inside `index.html` (Gantt + Kanban, all 37 deliverables
pre-loaded). It reads and writes shared data through a Cloudflare D1 database via Pages
Functions in `/functions`. Until D1 is wired up the page still opens fully populated from
its embedded seed, and shows a "Local only, changes not shared yet" badge.

## Files

- `index.html` , playbook + the Project Tracker section (front end).
- `functions/api/tasks.js` , `GET` list all tasks, `POST` create a task.
- `functions/api/tasks/[id].js` , `GET` one, `PUT` update or upsert, `DELETE`.
- `functions/_lib.js` , shared row to JSON mapping and response helpers.
- `schema.sql` , the `tasks` table.
- `seed.sql` , the 37 deliverables, kept identical to the embedded seed in `index.html`.
- `wrangler.toml` , Pages config with the `DB` binding.

## One time setup

```sh
# 1. Create the database
wrangler d1 create uxappaudit-tracker
#    Copy the printed database_id into wrangler.toml (database_id = "...")

# 2. Create the table and load the 37 deliverables
wrangler d1 execute uxappaudit-tracker --remote --file=./schema.sql
wrangler d1 execute uxappaudit-tracker --remote --file=./seed.sql
```

In the Cloudflare dashboard, bind the database to the Pages project as well:
Workers & Pages, uxappaudit, Settings, Functions, D1 database bindings,
add binding `DB` to `uxappaudit-tracker` (for both Production and Preview).

## Deploy

The project is now multi-file (HTML + Functions + wrangler config), so move off the
"Direct Upload zip" flow:

```sh
wrangler pages deploy . --project-name uxappaudit
```

or connect this Git repo to the Pages project for automatic deploys on push (see below).

Keep the existing `@epf.gov.my` Cloudflare Zero Trust access policy intact on redeploys.

## Connect to Git (GitHub connected Pages)

This sets Cloudflare Pages to build and deploy automatically whenever the production
branch is pushed. The connection itself is done in the Cloudflare dashboard (it is an
OAuth step against your Cloudflare account, it cannot be scripted from the repo).

**Important caveat.** The current `uxappaudit` project is a Direct Upload project (the
zip flow). Cloudflare does not let you convert a Direct Upload project to Git connected,
so you create a new Git connected project. The `*.pages.dev` subdomain is tied to the
project name, so to keep `uxappaudit.pages.dev` you either delete the old project and
name the new one `uxappaudit`, or move your custom domain across. Either way, re attach
the `@epf.gov.my` Zero Trust Access policy to the new project afterward.

Steps:

1. **Code is on GitHub.** The work lives on branch `claude/wonderful-cannon-3frv2` of
   `fafsterwork/appreviewtracker`. That branch is the production branch for now.

2. **Create the D1 database** (see "One time setup" above): `wrangler d1 create`, then
   apply `schema.sql` and `seed.sql` with `--remote`.

3. **Connect the repo:** Cloudflare dashboard, Workers & Pages, Create, Pages, Connect to
   Git. Authorize GitHub, select `fafsterwork/appreviewtracker`.
   - Production branch: `claude/wonderful-cannon-3frv2`
   - Framework preset: None
   - Build command: empty
   - Build output directory: `/` (the site is served from the repo root)

4. **Bind D1 to the project:** project, Settings, Functions, D1 database bindings, add
   binding `DB` to `uxappaudit-tracker`, for both Production and Preview.

5. **Re attach Zero Trust:** add the existing `@epf.gov.my` Access policy to the new
   project's domain.

6. **Deploy:** push to the production branch, or hit Retry deployment. The playbook and
   tracker go live, and `/api/tasks` is served by the Functions backed by D1.

Notes:

- `wrangler.toml` carries the `DB` binding with `database_id = "REPLACE_WITH_DATABASE_ID"`.
  If you want the Pages build to read the binding from `wrangler.toml`, paste the real id
  from step 2. Otherwise bind via the dashboard (step 4) and the placeholder is harmless.
- The repo root is served as is, so the source and data files (`Project_Tracker.xlsx`,
  `seed.sql`, the `.md` docs) are reachable at the deployed URL, but stay behind the Zero
  Trust gate. That is the tradeoff of the flat layout. To stop serving them, move
  `index.html` into a `public/` folder and set the build output directory to `public`
  (the `functions/` folder stays at the repo root either way).

## Local development

```sh
wrangler pages dev . --d1 DB=uxappaudit-tracker
```

`wrangler pages dev` serves `index.html` and the Functions together, with a local D1
instance, so the tracker runs end to end. Apply `schema.sql` and `seed.sql` to the local
DB first with `--local` instead of `--remote`.

## API shape

Tasks are JSON with camelCase keys:

```json
{
  "id": 1, "workstream": "Setup", "owner": "UXR Lead", "task": "Research Planning",
  "planStartWeek": "W0", "planEndWeek": "W1", "dependency": null, "mandays": 8,
  "planStart": "2026-05-06", "planEnd": "2026-05-18", "startDate": "2026-05-04",
  "actualEnd": "2026-05-19", "status": "Delayed", "pctComplete": 0.99,
  "daysDelayed": 1, "offDays": 5, "notes": "..."
}
```
