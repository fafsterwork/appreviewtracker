-- D1 schema for the Project Tracker (Gantt + Kanban)
-- Apply with: wrangler d1 execute uxappaudit-tracker --file=./schema.sql
CREATE TABLE IF NOT EXISTS tasks (
  id              INTEGER PRIMARY KEY,
  workstream      TEXT,
  owner           TEXT,
  task            TEXT,
  plan_start_week TEXT,
  plan_end_week   TEXT,
  dependency      INTEGER,
  mandays         REAL,
  plan_start      TEXT,
  plan_end        TEXT,
  start_date      TEXT,
  actual_end      TEXT,
  status          TEXT,
  pct_complete    REAL,
  days_delayed    REAL,
  off_days        REAL,
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_workstream ON tasks(workstream);
