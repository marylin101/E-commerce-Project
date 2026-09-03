const errorHandler = ( req, res, err, next) => {
    const message = 'There is an internal Server Error'+ err.message;
    res.status(500).json({
        success: false,
        data: null,
        error: {  message: message },
    });
};

module.exports = errorHandler;