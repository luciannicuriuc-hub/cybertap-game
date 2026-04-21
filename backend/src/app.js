const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { getHealthStatus } = require('./services/metaService');

function createApp(bot) {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.locals.bot = bot;

    app.get('/', (req, res) => {
        res.json(getHealthStatus());
    });

    app.use('/api', apiRoutes);
    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };
