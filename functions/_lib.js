// Shared helpers for the Project Tracker API (Cloudflare Pages Functions + D1).

export const COLUMNS = [
  'id', 'workstream', 'owner', 'task', 'plan_start_week', 'plan_end_week',
  'dependency', 'mandays', 'plan_start', 'plan_end', 'start_date', 'actual_end',
  'status', 'pct_complete', 'days_delayed', 'off_days', 'notes'
];

// D1 row (snake_case) to API JSON (camelCase)
export function rowToJson(r) {
  return {
    id: r.id,
    workstream: r.workstream,
    owner: r.owner,
    task: r.task,
    planStartWeek: r.plan_start_week,
    planEndWeek: r.plan_end_week,
    dependency: r.dependency,
    mandays: r.mandays,
    planStart: r.plan_start,
    planEnd: r.plan_end,
    startDate: r.start_date,
    actualEnd: r.actual_end,
    status: r.status,
    pctComplete: r.pct_complete,
    daysDelayed: r.days_delayed,
    offDays: r.off_days,
    notes: r.notes
  };
}

// API JSON (camelCase) to a column map (snake_case), only defined keys
export function jsonToCols(b) {
  const m = {};
  if (b.workstream !== undefined) m.workstream = b.workstream;
  if (b.owner !== undefined) m.owner = b.owner;
  if (b.task !== undefined) m.task = b.task;
  if (b.planStartWeek !== undefined) m.plan_start_week = b.planStartWeek;
  if (b.planEndWeek !== undefined) m.plan_end_week = b.planEndWeek;
  if (b.dependency !== undefined) m.dependency = b.dependency;
  if (b.mandays !== undefined) m.mandays = b.mandays;
  if (b.planStart !== undefined) m.plan_start = b.planStart;
  if (b.planEnd !== undefined) m.plan_end = b.planEnd;
  if (b.startDate !== undefined) m.start_date = b.startDate;
  if (b.actualEnd !== undefined) m.actual_end = b.actualEnd;
  if (b.status !== undefined) m.status = b.status;
  if (b.pctComplete !== undefined) m.pct_complete = b.pctComplete;
  if (b.daysDelayed !== undefined) m.days_delayed = b.daysDelayed;
  if (b.offDays !== undefined) m.off_days = b.offDays;
  if (b.notes !== undefined) m.notes = b.notes;
  return m;
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

export function err(message, status = 400) {
  return json({ error: message }, status);
}
