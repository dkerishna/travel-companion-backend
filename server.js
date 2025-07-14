const express = require('express');
const cors = require('cors');
require('dotenv').config();

const tripRoutes = require('./routes/trips');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/trips', tripRoutes);

app.get('/', (req, res) => {
    res.send('Travel Companion API is running.');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});