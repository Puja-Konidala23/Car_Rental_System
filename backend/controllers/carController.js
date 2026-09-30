const Car = require("../models/Car");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../config/cloudinaryUpload");

// Create Car
const createCar = async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      year,
      pricePerDay,
      advancePercentage,
      address,
      city,
      description,
      seats,
      fuelType,
      transmission,
    } = req.body;

    const images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer
        );

        images.push(result.secure_url);
      }
    }

    const car = await Car.create({
      name,
      brand,
      model,
      year,
      pricePerDay,
      advancePercentage,
      address,
      city,
      description,
      images,
      seats,
      fuelType,
      transmission,
    });

    res.status(201).json({
      message: "Car added successfully",
      car,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Cars
const getAllCars = async (req, res) => {
  try {
    const {
      search,
      city,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    if (city) {
      filter.city = {
        $regex: city,
        $options: "i",
      };
    }

    if (fuelType) {
      filter.fuelType = fuelType;
    }

    if (transmission) {
      filter.transmission = transmission;
    }

    if (minPrice || maxPrice) {
      filter.pricePerDay = {};

      if (minPrice) {
        filter.pricePerDay.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.pricePerDay.$lte = Number(maxPrice);
      }
    }

    const cars = await Car.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Car
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Car
const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    const {
      removeImages,
      ...carData
    } = req.body;

    let imagesToRemove = [];

    if (removeImages) {
      try {
        imagesToRemove = JSON.parse(removeImages);
      } catch {
        imagesToRemove = [];
      }
    }

    // Delete selected Cloudinary images
    for (const imageUrl of imagesToRemove) {
      try {
        const urlParts = imageUrl.split("/upload/");

        if (urlParts.length === 2) {
          const publicIdWithExtension =
            urlParts[1]
              .split("/")
              .slice(1)
              .join("/");

          const publicId =
            publicIdWithExtension
              .split(".")
              .slice(0, -1)
              .join(".");

          if (publicId) {
            await cloudinary.uploader.destroy(
              `car-rental/${publicId}`
            );
          }
        }
      } catch (error) {
        console.log(
          "Cloudinary delete error:",
          error.message
        );
      }
    }

    let remainingImages = car.images.filter(
      (image) =>
        !imagesToRemove.includes(image)
    );

    // Upload new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer
        );

        remainingImages.push(
          result.secure_url
        );
      }
    }

    const updatedCar =
      await Car.findByIdAndUpdate(
        req.params.id,
        {
          ...carData,
          images: remainingImages,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    res.status(200).json({
      message: "Car updated successfully",
      car: updatedCar,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Car
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    // Delete images from Cloudinary
    for (const imageUrl of car.images) {
      try {
        const urlParts = imageUrl.split("/upload/");

        if (urlParts.length === 2) {
          const publicIdWithExtension =
            urlParts[1]
              .split("/")
              .slice(1)
              .join("/");

          const publicId =
            publicIdWithExtension
              .split(".")
              .slice(0, -1)
              .join(".");

          if (publicId) {
            await cloudinary.uploader.destroy(
              `car-rental/${publicId}`
            );
          }
        }
      } catch (error) {
        console.log(
          "Cloudinary delete error:",
          error.message
        );
      }
    }

    await Car.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Car deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
};