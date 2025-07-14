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

// EDIT a trip
app.put("/api/trips/:id", async (req, res) => {
    const { id } = req.params;
    const {
        title,
        country,
        city,
        start_date,
        end_date,
        notes,
        image_url
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE trips SET
        title = $1,
        country = $2,
        city = $3,
        start_date = $4,
        end_date = $5,
        notes = $6,
        image_url = $7
       WHERE id = $8
       RETURNING *`,
            [title, country, city, start_date, end_date, notes, image_url, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Trip not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating trip:", err);
        res.status(500).send("Server error");
    }
});

// DELETE a trip
app.delete("/api/trips/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM trips WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Trip not found" });
        }

        res.json({ message: "Trip deleted successfully" });
    } catch (err) {
        console.error("Error deleting trip:", err);
        res.status(500).send("Server error");
    }
});

// POST a new destination for a trip
app.post("/api/destinations", async (req, res) => {
    const { trip_id, name, description, latitude, longitude, image_url, order_index } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO destinations 
      (trip_id, name, description, latitude, longitude, image_url, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
            [trip_id, name, description, latitude, longitude, image_url, order_index]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating destination:", err);
        res.status(500).send("Server error");
    }
});


// GET all destinations for a trip
app.get("/api/destinations/:trip_id", async (req, res) => {
    const { trip_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM destinations 
       WHERE trip_id = $1 
       ORDER BY order_index ASC, created_at ASC`,
            [trip_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching destinations:", err);
        res.status(500).send("Server error");
    }
});

// EDIT a destination
app.put("/api/destinations/:id", async (req, res) => {
    const { id } = req.params;
    const { name, description, latitude, longitude, image_url, order_index } = req.body;

    try {
        const result = await pool.query(
            `UPDATE destinations
       SET name = $1,
           description = $2,
           latitude = $3,
           longitude = $4,
           image_url = $5,
           order_index = $6
       WHERE id = $7
       RETURNING *`,
            [name, description, latitude, longitude, image_url, order_index, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Destination not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating destination:", err);
        res.status(500).send("Server error");
    }
});

// DELETE a destination
app.delete("/api/destinations/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM destinations WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Destination not found" });
        }

        res.json({ message: "Destination deleted successfully" });
    } catch (err) {
        console.error("Error deleting destination:", err);
        res.status(500).send("Server error");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
