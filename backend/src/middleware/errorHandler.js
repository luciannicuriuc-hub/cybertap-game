function notFound(req, res, next) {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || err.status || 500;

    if (statusCode >= 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        error: err.message || 'Server error',
        ...(err.details || {}),
    });
}

module.exports = {
    notFound,
    errorHandler,
};
