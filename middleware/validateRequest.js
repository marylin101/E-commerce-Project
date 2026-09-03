function validateRequest(validatorFn) {
  return (req, res, next) => {
    const errors = validatorFn(req.body || {});
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          message: 'Validation failed.',
          details: errors,
        },
      });
    }
    next();
  };
}

module.exports = validateRequest;
