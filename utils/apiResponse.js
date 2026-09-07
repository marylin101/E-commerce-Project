const sucResponse = (res, data, statuscode = 200 ) => {
    return res.status(statuscode).json({
        success: true,
        data,
        error: null,
    });
};

module.exports = {sucResponse};