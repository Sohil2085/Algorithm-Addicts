const errorHandler = (err, req, res, next) => {
    console.error('[Error Middleware]:', err.message);

    let statusCode = err.status || (res.statusCode === 200 ? 500 : res.statusCode);
    let message = err.message || 'Internal Server Error';

    if (err.name === 'ValidationError') {
        statusCode = 400;
    } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
        statusCode = 401;
    } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        error: {
            code: err.name || 'ServerError',
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
    });
};

export default errorHandler;
