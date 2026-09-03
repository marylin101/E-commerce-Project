const sucResponse = (res, data, statuscode) => {
    const message = 'The request was successful';
    return res.status(statuscode).json({
        status: 'success',
        data,
        error: null,
        message,
    });
};

const errResponse = (res, err) => {
    const message = 'There was an error while trying to process the request'+err.message;
    return res.status(statuscode).json({
        success: false,
        data: null,
        error: {message},
    });
};

module.exports = { sucResponse, errResponse };