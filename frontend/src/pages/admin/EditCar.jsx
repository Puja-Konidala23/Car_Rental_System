import {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

import "./EditCar.css";

const EditCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token, user } =
    useContext(AuthContext);

  const [formData, setFormData] =
    useState({
      name: "",
      brand: "",
      model: "",
      year: "",
      pricePerDay: "",
      advancePercentage: "",
      address: "",
      city: "",
      description: "",
      seats: "",
      fuelType: "Petrol",
      transmission: "Manual",
      isAvailable: true,
    });

  const [existingImages, setExistingImages] =
    useState([]);

  const [newImages, setNewImages] =
    useState([]);

  const [removeImages, setRemoveImages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await api.get(
          `/cars/${id}`
        );

        const car = response.data;

        setFormData({
          name: car.name,
          brand: car.brand,
          model: car.model,
          year: car.year,
          pricePerDay: car.pricePerDay,
          advancePercentage:
            car.advancePercentage,
          address: car.address,
          city: car.city,
          description:
            car.description || "",
          seats: car.seats,
          fuelType: car.fuelType,
          transmission: car.transmission,
          isAvailable:
            car.isAvailable,
        });

        setExistingImages(
          car.images || []
        );
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Failed to load car"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleNewImages = (e) => {
    setNewImages(e.target.files);
  };

  const toggleRemoveImage = (imageUrl) => {
    const filename =
      imageUrl.split("/").pop();

    setRemoveImages((previous) =>
      previous.includes(filename)
        ? previous.filter(
            (image) =>
              image !== filename
          )
        : [...previous, filename]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const data = new FormData();

      Object.keys(formData).forEach(
        (key) => {
          data.append(
            key,
            formData[key]
          );
        }
      );

      data.append(
        "removeImages",
        JSON.stringify(removeImages)
      );

      for (
        let i = 0;
        i < newImages.length;
        i++
      ) {
        data.append(
          "images",
          newImages[i]
        );
      }

      await api.put(
        `/cars/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setMessage(
        "Car updated successfully"
      );

      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to update car"
      );
    } finally {
      setSaving(false);
    }
  };

  if (
    !user ||
    user.role !== "admin"
  ) {
    return (
      <div className="edit-car-access-denied">
        <h2>
          Admin access required
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="edit-car-loading">
        <h2>Loading car...</h2>
      </div>
    );
  }

  return (
    <div className="edit-car-page">
      <div className="edit-car-container">

        <h1 className="edit-car-title">
          Edit Car
        </h1>

        <form
          className="edit-car-form"
          onSubmit={handleSubmit}
        >

          <div className="edit-car-field">
            <label>Car Name</label>
            <input
              type="text"
              name="name"
              placeholder="Car Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-car-field">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              placeholder="Brand"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-car-field">
            <label>Model</label>
            <input
              type="text"
              name="model"
              placeholder="Model"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-car-field">
            <label>Year</label>
            <input
              type="number"
              name="year"
              placeholder="Year"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-car-field">
            <label>Price Per Day</label>
            <input
              type="number"
              name="pricePerDay"
              placeholder="Price Per Day"
              value={formData.pricePerDay}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-car-field">
            <label>Advance Percentage</label>
            <input
              type="number"
              name="advancePercentage"
              placeholder="Advance Percentage"
              value={
                formData.advancePercentage
              }
              onChange={handleChange}
              min="1"
              max="100"
              required
            />
          </div>

          <div className="edit-car-field">
            <label>Address</label>
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-car-field">
            <label>City</label>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-car-field full-width">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="edit-car-field">
            <label>Seats</label>
            <input
              type="number"
              name="seats"
              placeholder="Seats"
              value={formData.seats}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="edit-car-field">
            <label>Fuel Type</label>

            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
            >
              <option value="Petrol">
                Petrol
              </option>

              <option value="Diesel">
                Diesel
              </option>

              <option value="Electric">
                Electric
              </option>

              <option value="CNG">
                CNG
              </option>

              <option value="Hybrid">
                Hybrid
              </option>
            </select>
          </div>

          <div className="edit-car-field">
            <label>Transmission</label>

            <select
              name="transmission"
              value={
                formData.transmission
              }
              onChange={handleChange}
            >
              <option value="Manual">
                Manual
              </option>

              <option value="Automatic">
                Automatic
              </option>
            </select>
          </div>

          <div className="edit-availability-field">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              checked={
                formData.isAvailable
              }
              onChange={handleChange}
            />

            <label htmlFor="isAvailable">
              Available for rental
            </label>
          </div>

          <div className="edit-images-section">

            <h3 className="edit-images-title">
              Existing Images
            </h3>

            <div className="existing-images">

              {existingImages.map(
                (image, index) => {
                  const filename =
                    image.split("/").pop();

                  const markedForRemoval =
                    removeImages.includes(
                      filename
                    );

                  return (
                    <div
                      className={`existing-image-card ${
                        markedForRemoval
                          ? "marked-remove"
                          : ""
                      }`}
                      key={index}
                    >

                      <img
                        className="existing-image"
                        src={image}
                        alt={`Car ${
                          index + 1
                        }`}
                      />

                      <button
                        className={`image-remove-button ${
                          markedForRemoval
                            ? "image-keep-button"
                            : ""
                        }`}
                        type="button"
                        onClick={() =>
                          toggleRemoveImage(
                            image
                          )
                        }
                      >
                        {markedForRemoval
                          ? "Keep Image"
                          : "Remove Image"}
                      </button>

                    </div>
                  );
                }
              )}

            </div>
          </div>

          <div className="edit-images-section">

            <h3 className="edit-images-title">
              Add New Images
            </h3>

            <input
              className="new-images-input"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              multiple
              onChange={
                handleNewImages
              }
            />

          </div>

          <button
            className="edit-car-button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Update Car"}
          </button>

        </form>

        {message && (
          <p className="edit-car-message">
            {message}
          </p>
        )}

      </div>
    </div>
  );
};

export default EditCar;