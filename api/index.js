const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ១. ការភ្ជាប់ទៅកាន់ Database (Neon Postgres)
// ប្រើឈ្មោះ Variable "POSTGRES" តាមអ្វីដែលលោកគ្រូបានដាក់ក្នុង Vercel
const pool = new Pool({
  connectionString: process.env.POSTGRES + "?sslmode=require",
});

/** * --- SECTION: PROJECTS ---
 */

// API សម្រាប់ទាញយក Projects មកបង្ហាញលើទំព័រមុខ
app.get('/api/projects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database Error: " + err.message });
  }
});

// API សម្រាប់បញ្ចូល Project ថ្មី (ពី Admin)
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

// API សម្រាប់លុប Project (ពី Admin)
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

// API សម្រាប់ទទួលសារពី Contact Form (ក្នុង index.html)
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const query = 'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING *';
    const values = [name, email, message];
    const result = await pool.query(query, values);
    
    res.status(201).json({ 
      success: true, 
      message: "សារត្រូវបានបញ្ជូនទៅកាន់ Database រួចរាល់!",
      data: result.rows[0] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "មិនអាចបញ្ជូនសារបានទេ: " + err.message });
  }
});

// API សម្រាប់ទាញយកសារមកបង្ហាញក្នុង Inbox (ក្នុង admin.html)
app.get('/api/messages', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch Messages Error: " + err.message });
  }
});

// Export សម្រាប់ឱ្យ Vercel ដំណើរការ
module.exports = app;