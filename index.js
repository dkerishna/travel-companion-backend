const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Neon DB connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Test route
app.get("/", (req, res) => {
    res.send("Travel Companion API is running.");
});

// GET all trips
app.get("/api/trips", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM trips ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// POST a new trip
app.post("/api/trips", async (req, res) => {
    const {
        user_firebase_uid,
        title,
        country,
        city,
        start_date,
        end_date,
        notes,
        image_url,
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO trips
      (user_firebase_uid, title, country, city, start_date, end_date, notes, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
            [user_firebase_uid, title, country, city, start_date, end_date, notes, image_url]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});