const express = require("express");

const {
  createBooking,
  verifyPayment,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelMyBooking,
  checkAvailability,
} = require("../controllers/bookingController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Check availability
router.get(
  "/availability",
  checkAvailability
);

// User
router.get(
  "/my",
  protect,
  getMyBookings
);

// User - Cancel booking
router.put(
  "/:id/cancel",
  protect,
  cancelMyBooking
);

// Admin
router.get(
  "/all",
  protect,
  adminOnly,
  getAllBookings
);

router.put(
  "/:id/status",
  protect,
  adminOnly,
  updateBookingStatus
);

// User - Create booking
router.post(
  "/",
  protect,
  createBooking
);

// User - Verify payment
router.post(
  "/verify-payment",
  protect,
  verifyPayment
);

module.exports = router;