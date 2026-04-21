const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { getHealthStatus } = require('./services/metaService');

function createApp(bot) {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.locals.bot = bot;

    // Serve static files from frontend
    app.use(express.static(path.join(__dirname, '../../frontend')));

    app.get('/', (req, res) => {
        res.json(getHealthStatus());
    });

    app.use('/api', apiRoutes);

    // Serve index.html for SPA routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/index.html'));
    });

    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };
