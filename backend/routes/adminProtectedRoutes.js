const express = require("express");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.json({
    message: "Welcome to Admin Dashboard",
    admin: req.user,
  });
});

module.exports = router;