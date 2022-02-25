// Load modules
const express = require("express");
const router = express.Router();

// Router to Home
router.get("/", (req, res) => {
    res.render("general/index");
});

module.exports = router;
