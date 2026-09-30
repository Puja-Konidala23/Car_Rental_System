const express = require("express");

const {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
} = require("../controllers/carController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAllCars);

router.get("/:id", getCarById);

router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 10),
  createCar
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 10),
  updateCar
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCar
);

module.exports = router;