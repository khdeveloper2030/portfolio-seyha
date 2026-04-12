const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.POSTGRES + "?sslmode=require",
});

// PROJECTS API
app.get('/api/projects', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM projects ORDER BY id DESC');
  res.json(rows);
});

app.post('/api/projects', async (req, res) => {
  const { title, description, tags, link, image_url } = req.body;
  const result = await pool.query(
    'INSERT INTO projects (title, description, tags, link, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [title, description, tags, link, image_url]
  );
  res.status(201).json(result.rows[0]);
});

app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, tags, link, image_url } = req.body;
  await pool.query(
    'UPDATE projects SET title=$1, description=$2, tags=$3, link=$4, image_url=$5 WHERE id=$6',
    [title, description, tags, link, image_url, id]
  );
  res.json({ success: true });
});

app.delete('/api/projects/:id', async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// MESSAGES API (បន្ថែម Email ក្នុង INSERT)
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await pool.query('INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)', [name, email, message]);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/messages', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM messages ORDER BY id DESC');
  res.json(rows);
});

app.delete('/api/messages/:id', async (req, res) => {
  await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

module.exports = app;