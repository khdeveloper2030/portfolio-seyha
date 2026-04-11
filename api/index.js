const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ភ្ជាប់ទៅកាន់ Database ដោយប្រើ URL ដែលអ្នកបាន Copy ពី Neon
const pool = new Pool({
  connectionString: process.env.POSTGRES + "?sslmode=require",
});

// API សម្រាប់ទាញយក Projects មកបង្ហាញលើទំព័រមុខ
app.get('/api/projects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database Error" });
  }
});

// API សម្រាប់ទំព័រ Admin បញ្ចូល Project ថ្មី
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
// API សម្រាប់ទទួលសារពី Contact Form
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
app.get('/api/messages', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = app;