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
        res.send(`
            <h1>CyberTap Backend API</h1>
            <p>✅ Server is running successfully!</p>
            <p>Frontend is available at: <a href="${process.env.WEBAPP_URL || 'https://your-frontend-url'}">${process.env.WEBAPP_URL || 'Frontend URL'}</a></p>
            <p>API endpoints: /api/*</p>
        `);
    });

    app.use('/api', apiRoutes);
    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };
