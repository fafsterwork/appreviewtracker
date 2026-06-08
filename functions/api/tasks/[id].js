// /api/tasks/:id  ,  fetch (GET), update or upsert (PUT), delete (DELETE) one task
import { rowToJson, jsonToCols, json, err } from '../../_lib.js';

export async function onRequestGet({ params, env }) {
  if (!env.DB) return err('Database not configured', 500);
  const row = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(params.id).first();
  if (!row) return err('Task not found', 404);
  return json(rowToJson(row));
}

export async function onRequestPut({ params, request, env }) {
  if (!env.DB) return err('Database not configured', 500);
  let body;
  try { body = await request.json(); } catch (e) { return err('Invalid JSON body'); }

  const id = params.id;
  const cols = jsonToCols(body);
  const existing = await env.DB.prepare('SELECT id FROM tasks WHERE id = ?').bind(id).first();

  if (existing) {
    const keys = Object.keys(cols);
    if (keys.length) {
      const setClause = keys.map((k) => `${k} = ?`).join(', ');
      const values = keys.map((k) => cols[k]);
      await env.DB.prepare(`UPDATE tasks SET ${setClause} WHERE id = ?`).bind(...values, id).run();
    }
  } else {
    // Upsert: keep client and server in sync even if the row was never seeded
    cols.id = isNaN(Number(id)) ? id : Number(id);
    const keys = Object.keys(cols);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map((k) => cols[k]);
    await env.DB.prepare(`INSERT INTO tasks (${keys.join(', ')}) VALUES (${placeholders})`).bind(...values).run();
  }

  const saved = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  return json(rowToJson(saved));
}

export async function onRequestDelete({ params, env }) {
  if (!env.DB) return err('Database not configured', 500);
  await env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
