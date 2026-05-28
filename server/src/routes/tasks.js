const express = require('express');
const { getDb } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// all task routes need auth
router.use(auth);

// Get tasks (optionally filter by stage)
router.get('/', (req, res) => {
  const db = getDb();
  const { stage } = req.query;

  if (stage) {
    const allowed = ['todo', 'in_progress', 'done'];
    if (!allowed.includes(stage)) {
      return res.status(400).json({ error: `Invalid stage. Must be one of: ${allowed.join(', ')}` });
    }
    const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? AND stage = ? ORDER BY created_at DESC').all(req.user.id, stage);
    return res.json({ tasks });
  }

  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ tasks });
});

// Create task
router.post('/', (req, res) => {
  const { title, description, stage, priority } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO tasks (user_id, title, description, stage, priority)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    req.user.id,
    title.trim(),
    description || '',
    stage || 'todo',
    priority || 'medium'
  );

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ task });
});

// Update task
router.put('/:id', (req, res) => {
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  if (task.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Not your task' });
  }

  const { title, description, stage, priority } = req.body;
  const updated = db.prepare(`
    UPDATE tasks SET
      title = ?,
      description = ?,
      stage = ?,
      priority = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title ?? task.title,
    description ?? task.description,
    stage ?? task.stage,
    priority ?? task.priority,
    req.params.id
  );

  const freshTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json({ task: freshTask });
});

// Delete task
router.delete('/:id', (req, res) => {
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  if (task.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Not your task' });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted' });
});

module.exports = router;
