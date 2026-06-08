// /api/tasks  ,  list all tasks (GET) and create a task (POST)
import { rowToJson, jsonToCols, json, err } from '../_lib.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return err('Database not configured', 500);
  const { results } = await env.DB.prepare('SELECT * FROM tasks ORDER BY id').all();
  return json(results.map(rowToJson));
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return err('Database not configured', 500);
  let body;
  try { body = await request.json(); } catch (e) { return err('Invalid JSON body'); }
  if (!body || !body.task) return err('A task name is required');

  const cols = jsonToCols(body);

  // Assign next id when the client did not supply one
  let id = body.id;
  if (id === undefined || id === null || id === '') {
    const row = await env.DB.prepare('SELECT COALESCE(MAX(id), 0) + 1 AS next FROM tasks').first();
    id = row.next;
  }
  cols.id = id;

  const keys = Object.keys(cols);
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map((k) => cols[k]);

  await env.DB.prepare(
    `INSERT INTO tasks (${keys.join(', ')}) VALUES (${placeholders})`
  ).bind(...values).run();

  const saved = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  return json(rowToJson(saved), 201);
}
