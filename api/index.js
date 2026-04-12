const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ១. ការភ្ជាប់ទៅកាន់ Database (Neon Postgres)
const pool = new Pool({
  connectionString: process.env.POSTGRES + "?sslmode=require",
});

/** * --- SECTION: PROJECTS ---
 */

// API: ទាញយក Projects ទាំងអស់
app.get('/api/projects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database Error: " + err.message });
  }
});

// API: បញ្ចូល Project ថ្មី
app.post('/api/projects', async (req, res) => {
  const { title, description, tags, link, image_url } = req.body;
  try {
    const query = 'INSERT INTO projects (title, description, tags, link, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [title, description, tags, link, image_url];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Insert Error: " + err.message });
  }
});

// API: កែសម្រួល Project (Update)
app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, tags, link, image_url } = req.body;
  try {
    const query = `
      UPDATE projects 
      SET title = $1, description = $2, tags = $3, link = $4, image_url = $5 
      WHERE id = $6
    `;
    const values = [title, description, tags, link, image_url, id];
    await pool.query(query, values);
    res.json({ success: true, message: "Project updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Update Error: " + err.message });
  }
});

// API: លុប Project
app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete Error: " + err.message });
  }
});


/** * --- SECTION: MESSAGES (CONTACT) ---
 */

// API: ទទួលសារពី Contact Form (Update ដើម្បីទទួល Email)
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body; // បន្ថែម email ត្រង់នេះ
  try {
    // ត្រូវប្រាកដថាTable messages មាន Column 'email'
    const query = 'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING *';
    const values = [name, email, message];
    const result = await pool.query(query, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Send Message Error: " + err.message });
  }
});

// API: ទាញយកសារទាំងអស់មកបង្ហាញក្នុង Inbox
app.get('/api/messages', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM messages ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch Messages Error: " + err.message });
  }
});

// API: លុបសារចេញពី Inbox
app.delete('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete Message Error: " + err.message });
  }
});

module.exports = app;