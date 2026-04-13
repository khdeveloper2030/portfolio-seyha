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

/**
 * --- SECTION: PROFILE & CONTENT SETTINGS ---
 */

// API: ទាញយកព័ត៌មាន Profile ទាំងអស់ (Logo, Title, Bio, Contacts)
app.get('/api/profile', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT logo_url, title, bio, gmail, telegram FROM profile WHERE id = 1');
    if (rows.length === 0) {
      return res.json({ 
        logo_url: 'https://via.placeholder.com/150',
        title: 'Full-Stack Developer',
        bio: 'ជំរាបសួរ...',
        gmail: '',
        telegram: ''
      });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Profile Fetch Error: " + err.message });
  }
});

// API: អាប់ដេតព័ត៌មាន Profile ទាំងអស់
app.put('/api/profile', async (req, res) => {
  const { logo_url, title, bio, gmail, telegram } = req.body;
  try {
    const query = `
      UPDATE profile 
      SET logo_url = $1, title = $2, bio = $3, gmail = $4, telegram = $5, updated_at = CURRENT_TIMESTAMP 
      WHERE id = 1
    `;
    const values = [logo_url, title, bio, gmail, telegram];
    await pool.query(query, values);
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Profile Update Error: " + err.message });
  }
});


/**
 * --- SECTION: PROJECTS ---
 */

app.get('/api/projects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  const { title, description, tags, link, image_url } = req.body;
  try {
    const query = 'INSERT INTO projects (title, description, tags, link, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [title, description, tags, link, image_url];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, tags, link, image_url } = req.body;
  try {
    const query = 'UPDATE projects SET title=$1, description=$2, tags=$3, link=$4, image_url=$5 WHERE id=$6';
    await pool.query(query, [title, description, tags, link, image_url, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * --- SECTION: MESSAGES (CONTACT) ---
 */

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await pool.query('INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)', [name, email, message]);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM messages ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;