function parseTelegramId(value) {
    const telegramId = Number.parseInt(value, 10);
    return Number.isFinite(telegramId) && telegramId > 0 ? telegramId : null;
}

function requireTelegramId(source = 'body') {
    return function telegramIdMiddleware(req, res, next) {
        const rawValue = source === 'params'
            ? req.params.telegramId
            : req.body?.telegramId;

        const telegramId = parseTelegramId(rawValue);
        if (!telegramId) {
            return res.status(400).json({ error: 'Invalid telegramId' });
        }

        req.telegramId = telegramId;
        next();
    };
}

function requireFields(fields = [], source = 'body') {
    return function fieldsMiddleware(req, res, next) {
        const payload = source === 'params' ? req.params : req.body || {};
        const missing = fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');

        if (missing.length > 0) {
            return res.status(400).json({
                error: `Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
            });
        }

        next();
    };
}

module.exports = {
    parseTelegramId,
    requireTelegramId,
    requireFields,
};
