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

or connect this Git repo to the Pages project for automatic deploys on push.

Keep the existing `@epf.gov.my` Cloudflare Zero Trust access policy intact on redeploys.

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
