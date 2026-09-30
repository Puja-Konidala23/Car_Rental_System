const Booking = require("../models/Booking");
const Car = require("../models/Car");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

// Create Booking + Razorpay Order
const createBooking = async (req, res) => {
  const session = await Booking.startSession();

  try {
    const {
      carId,
      startDate,
      endDate,
    } = req.body;

    if (!carId || !startDate || !endDate) {
      return res.status(400).json({
        message:
          "Car, start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid dates",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const millisecondsPerDay =
      1000 * 60 * 60 * 24;

    const totalDays = Math.ceil(
      (end - start) / millisecondsPerDay
    );

    const now = new Date();

    let razorpayOrder;
    let booking;

    await session.withTransaction(async () => {
      const car = await Car.findOneAndUpdate(
        {
          _id: carId,
          isAvailable: true,
        },
        {
          $inc: {
            bookingVersion: 1,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!car) {
        throw new Error(
          "Car not found or currently unavailable"
        );
      }

      const existingBooking =
        await Booking.findOne({
          car: carId,

          $or: [
            {
              bookingStatus: "Confirmed",
            },
            {
              bookingStatus: "Pending",
              expiresAt: {
                $gt: now,
              },
            },
          ],

          startDate: {
            $lt: end,
          },

          endDate: {
            $gt: start,
          },
        }).session(session);

      if (existingBooking) {
        throw new Error(
          "Car is already booked for these dates"
        );
      }

      const totalAmount =
        totalDays * car.pricePerDay;

      const advancePercentage =
        car.advancePercentage || 20;

      const advanceAmount =
        (totalAmount * advancePercentage) /
        100;

      const remainingAmount =
        totalAmount - advanceAmount;

      razorpayOrder =
        await razorpay.orders.create({
          amount: Math.round(
            advanceAmount * 100
          ),
          currency: "INR",
          receipt: `booking_${Date.now()}`,
        });

      const expiresAt = new Date(
        Date.now() + 15 * 60 * 1000
      );

      const createdBookings =
        await Booking.create(
          [
            {
              user: req.user.id,
              car: carId,
              startDate: start,
              endDate: end,
              totalDays,
              pricePerDay: car.pricePerDay,
              totalAmount,
              advanceAmount,
              remainingAmount,
              expiresAt,
              razorpayOrderId:
                razorpayOrder.id,
            },
          ],
          {
            session,
          }
        );

      booking = createdBookings[0];
    });

    res.status(201).json({
      message:
        "Booking created and payment order generated",

      booking: {
        id: booking._id,
        totalDays: booking.totalDays,
        totalAmount: booking.totalAmount,
        advanceAmount:
          booking.advanceAmount,
        remainingAmount:
          booking.remainingAmount,
        expiresAt: booking.expiresAt,
      },

      razorpay: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// Verify Razorpay Payment
const verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !bookingId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment details are required",
      });
    }

    const booking = await Booking.findById(
      bookingId
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      booking.user.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to verify this booking",
      });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({
        message: "Payment already verified",
      });
    }

    if (
      booking.expiresAt &&
      booking.expiresAt < new Date()
    ) {
      booking.bookingStatus = "Cancelled";
      booking.paymentStatus = "Failed";
      booking.expiresAt = null;

      await booking.save();

      return res.status(400).json({
        message:
          "Booking payment window has expired",
      });
    }

    if (
      booking.razorpayOrderId !==
      razorpay_order_id
    ) {
      return res.status(400).json({
        message: "Invalid Razorpay order",
      });
    }

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          razorpay_order_id +
            "|" +
            razorpay_payment_id
        )
        .digest("hex");

    const signaturesMatch =
      generatedSignature.length ===
        razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      );

    if (!signaturesMatch) {
      booking.paymentStatus = "Failed";

      await booking.save();

      return res.status(400).json({
        message:
          "Payment verification failed",
      });
    }

    booking.paymentStatus = "Paid";
    booking.bookingStatus = "Confirmed";

    booking.razorpayPaymentId =
      razorpay_payment_id;

    booking.razorpaySignature =
      razorpay_signature;

    booking.expiresAt = null;

    await booking.save();

    res.status(200).json({
      message:
        "Payment successful and booking confirmed",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get My Bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id,
    })
      .populate("car")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Cancel My Booking
const cancelMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      booking.user.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to cancel this booking",
      });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    if (booking.bookingStatus === "Completed") {
      return res.status(400).json({
        message:
          "Completed booking cannot be cancelled",
      });
    }

    booking.bookingStatus = "Cancelled";
    booking.expiresAt = null;

    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Bookings - Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate(
        "car",
        "name brand model pricePerDay"
      )
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Booking Status - Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Cancelled",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    booking.bookingStatus = status;

    if (status !== "Pending") {
      booking.expiresAt = null;
    }

    await booking.save();

    res.status(200).json({
      message: "Booking status updated",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// Check Car Availability for Dates
const checkAvailability = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.query;

    if (!carId || !startDate || !endDate) {
      return res.status(400).json({
        message:
          "Car, start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid dates",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    if (!car.isAvailable) {
      return res.status(200).json({
        available: false,
        message: "Car is currently unavailable",
      });
    }

    const now = new Date();

    const existingBooking = await Booking.findOne({
      car: carId,

      $or: [
        {
          bookingStatus: "Confirmed",
        },
        {
          bookingStatus: "Pending",
          expiresAt: {
            $gt: now,
          },
        },
      ],

      startDate: {
        $lt: end,
      },

      endDate: {
        $gt: start,
      },
    });

    if (existingBooking) {
      return res.status(200).json({
        available: false,
        message:
          "Car is already booked for these dates",
      });
    }

    res.status(200).json({
      available: true,
      message: "Car is available for these dates",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  createBooking,
  verifyPayment,
  getMyBookings,
  cancelMyBooking,
  getAllBookings,
  updateBookingStatus,
    checkAvailability,

};