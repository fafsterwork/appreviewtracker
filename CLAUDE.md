# CLAUDE.md — KWSP i-Akaun "App Performance Review" Research Playbook

This file gives Claude Code full context on this project. Read it before making changes.

## What this project is

An interactive, single-file HTML **UX research methodology playbook** built to onboard a UX
research team (at KWSP / EPF Malaysia) on the methods, metrics, and terms used in an app audit
of the KWSP i-Akaun mobile app. It is a **learning/reference tool**, not the project tracker itself.

- **Live URL:** https://uxappaudit.pages.dev/
- **Hosting:** Cloudflare Pages (project name `uxappaudit`, account faznuramalia@gmail.com)
- **Access control:** Cloudflare Zero Trust — restricted to `@epf.gov.my` email domain (one-time email code login)
- **Owner / UXR Lead:** Faznur (Faz)

## Current deliverable

- `index.html` — the entire playbook. Fully **static HTML** (all content pre-rendered in the markup).
  JavaScript only handles interactivity: modals, search filter, the quiz, sidebar active-state, mobile nav,
  and the "See Data Execution Template" buttons (which open generated HTML in a new tab via Blob URLs).
- Deploy by zipping `index.html` (the file inside the zip **must** be named exactly `index.html`)
  and uploading via Cloudflare → Workers & Pages → uxappaudit → Create deployment.

## CRITICAL architecture decisions (do not regress these)

1. **Fully static HTML.** An earlier version built the entire DOM in JavaScript and a single JS error
   produced a blank page. Everything is now pre-rendered in the HTML. Keep it that way — JS is for
   interactivity only, never for building the core layout/content.
2. **No `<style>` tags injected via innerHTML.** Browsers drop them. Card accent colours use a CSS
   custom property (`--sc-accent`) set inline on each element instead.
3. **No browser storage in artifacts context** was a constraint in the old build tool, but in Claude Code /
   real hosting you CAN use localStorage or a real backend. (See "Next feature" below.)
4. **Copy style:** NO hyphens used as separators (` - `) and NO em dashes (—). Use commas instead.
   This was an explicit, repeated client request. Keep all copy free of both.
5. **Title** is just **"App Performance Review"** (hero h1, coral accent). Not "KWSP i-Akaun App
   Performance Review", not "Research Playbook".

## Section structure (order matters)

Sidebar groups by phase: **Desk Research** → **Field Research** → **Outputs**

1. 🔍 **Heuristic Evaluation** (desk) — expert review; Nielsen's 10, severity rating, impact score, UI Trust Signals
2. 📞 **Member Feedback Analysis** (desk) — RCM complaints + IM incidents, past 6 months; RCM analysis, IM analysis, Theme Analysis
3. ♿ **Accessibility Assessment** (desk) — WCAG 2.1 AA, mobile-focused (VoiceOver/TalkBack, 44pt targets, contrast)
4. 📊 **Analytics Review** (desk) — GA4 funnel drop-off, feature usage
5. 🏆 **Competitive Benchmarking** (desk) — three tiers: Local Malaysian (CIMB OCTO MY, Touch 'n Go eWallet,
   myASNB (ASB), MAE by Maybank2u); Regional Provident Fund (CPF Mobile Singapore, eMPF Hong Kong MPF);
   Government Agency Peer (PERKESO Prihatin)
6. 🧪 **Field Research / Usability Testing** (field) — 6-step flow; session modes: Guerrilla at EPF Branch,
   Online Remote Session, Unmoderated (family & friends, links to https://uttesting.pages.dev/)
7. 📋 **Research Outputs** (outputs) — narrative: Research Scorecard, Member Experience Summary,
   Competitive Standing, Issues Found, Issues Addressed, Phased Roadmap

## Key metrics / targets baked into content

- SUS benchmark = **80** (EPF benchmark, highlighted with ⭐) — NOT the generic 68
- SEQ > 5.5/7 · Task Success > 85% · Trust Score > 5.5/7 · NPS > 30 · Accessibility > 95% WCAG AA

## Data Execution Templates

Three sections have a bottom "See Data Execution Template" button that opens a generated, editable
(contenteditable) HTML table in a new tab:
- **Heuristic Evaluation** → `openHETemplate()` — heuristics reference + issue log
- **Member Feedback Analysis** → `openFeedbackTemplate()` — RCM log (30 rows), IM log (20 rows), cross-journey consolidation
- **Analytics Review** → `openAnalyticsTemplate()` — two approaches: per-journey funnel deep dive, then cross-journey consolidation
- **Accessibility Assessment** → `openAccessTemplate()` — WCAG 2.1 AA checklist + issue log
Benchmarking, Field Research, and Outputs intentionally have NO template (data unknown / not applicable).

## Design tokens

- Fonts: Arial/sans-serif. Ink `#1A1612`, cream bg `#FDFBF7`.
- Section accent colours: heuristic `#B83010`, feedback `#7C3D00`, access `#0F6B2F`,
  analytics `#5E2278`, benchmark `#163060`, usability `#0A6B66`, outputs `#344054`.
- Cards use a hard offset shadow on hover (`box-shadow:5px 5px 0`), 2px borders, rounded corners.
- Mobile responsive: <768px hides sidebar → horizontal pill nav, cards single-column, modals slide up from bottom.

## Project Tracker (Gantt + Kanban) — BUILT

Status: implemented as an 8th section inside `index.html` (id `sec-tracker`, accent `#0E7490`,
phase label "Manage"). Front end is pre-rendered static HTML; JS renders the bars and cards from
data. It reads and writes shared data through a Cloudflare D1 database via Pages Functions in
`/functions`. If the API is unreachable the page still opens fully populated from an embedded seed
(identical to `seed.sql`) and shows a "Local only" badge. See `TRACKER_DEPLOY.md` for the D1 setup,
bindings, and deploy steps. New files: `functions/api/tasks.js`, `functions/api/tasks/[id].js`,
`functions/_lib.js`, `schema.sql`, `seed.sql`, `wrangler.toml`.

Working day maths matches the Excel: `planEnd = WORKDAY(planStart, mandays - 1)` skipping weekends
and the 29 non-working dates from the MY Holidays sheet (verified against all 37 tasks).

Original requirements (kept for reference):

The client wants a project tracker page, opened from the playbook, with TWO views of the same data:

**Source data:** `Project_Tracker.xlsx` (included in this folder). Sheets: Dashboard, Task Tracker,
MY Holidays, Gantt. The Task Tracker has 37 tasks across 9 workstreams (Setup, Checkpoint,
Heuristics Study, Analytics Review, Benchmarking and Peer Study, Field Research, Analysis,
Recommendations, Reporting). Columns: #, Workstream, Owner (PIC), Task/Deliverable,
Plan Start (Week), Plan End (Week), Task concurrency (dependency), Mandays, Plan Start date,
Plan End date, Start Date, Actual End, Status, % Complete, Days Delayed, Off days taken, Notes/Blockers.
Statuses used: Not Started, In Progress, Delayed, Completed Early, Completed, "Starts in N days".
Working days are calculated around Malaysian public holidays (MY Holidays sheet).

**Requirements:**
- 📊 **Gantt view** — timeline bars by start date + mandays, grouped by workstream, colour-coded by
  status, a "today" marker line, hover shows owner/mandays/dependency/notes.
- 📋 **Kanban view** — columns by status, cards show task + workstream tag + PIC + mandays,
  drag between columns, "Add deliverable" form (name, workstream, owner, start date, mandays,
  dependency, remarks).
- Pre-load all 37 existing tasks from the Excel so it opens fully populated.

**The persistence decision (important):**
A standalone HTML file can only save to one person's browser (localStorage) — NOT shared across the team.
The client wants a SHARED team tracker. Since the project is already on Cloudflare, the recommended
approach is **Cloudflare D1 (SQLite) or KV** for shared persistence, served via a small Cloudflare
Pages Function / Worker API. Build the front-end (Gantt + Kanban) first, wire it to a D1-backed API
so all `@epf.gov.my` users see the same live data. Keep the existing Zero Trust access control.

## Deployment notes

- Zip must contain `index.html` at the root (not inside a subfolder, not renamed).
- After adding the tracker, the project becomes multi-file (HTML + Functions + wrangler config) —
  at that point switch from "Direct Upload zip" to connecting a Git repo or using Wrangler for deploys.
- Keep `@epf.gov.my` Zero Trust policy intact on redeploys.

## Tone for any new copy

Warm, plain, practical. Malaysian context welcome (the playbook uses pasar malam / mamak / kopitiam
analogies in its "I Still Don't Understand" explanations). No hyphens-as-separators, no em dashes.
