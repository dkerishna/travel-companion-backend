const pool = require('../db/pool');

// GET /api/trips
const getAllTrips = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM trips ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

// POST /api/trips
const createTrip = async (req, res) => {
    const { user_firebase_uid, title, country, city, start_date, end_date, notes, image_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO trips (user_firebase_uid, title, country, city, start_date, end_date, notes, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [user_firebase_uid, title, country, city, start_date, end_date, notes, image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getAllTrips,
    createTrip
};