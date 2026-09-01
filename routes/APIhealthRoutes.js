const express = require('express');
const router = express.Router();

router.get('/api/health', (req, res) =>{
    res.status(200).json({
        success: true,
        data: { message: "The Study Desk's API is running."},
        error: null
        });
});

module.exports = router;