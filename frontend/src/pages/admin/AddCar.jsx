import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import "./AddCar.css";

const AddCar = () => {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    year: "",
    pricePerDay: "",
    advancePercentage: "20",
    address: "",
    city: "",
    description: "",
    seats: "",
    fuelType: "Petrol",
    transmission: "Manual",
  });

  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "admin") {
      setMessage("Admin access required");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      for (let i = 0; i < images.length; i++) {
        data.append("images", images[i]);
      }

      const response = await api.post("/cars", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to add car"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-car-page">
      <div className="add-car-container">

        <h1 className="add-car-title">
          Add New Car
        </h1>

        <form
          className="add-car-form"
          onSubmit={handleSubmit}
        >
          <div className="add-car-field">
            <label>Car Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-car-field">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-car-field">
            <label>Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-car-field">
            <label>Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-car-field">
            <label>Price Per Day</label>
            <input
              type="number"
              name="pricePerDay"
              value={formData.pricePerDay}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-car-field">
            <label>Advance Percentage</label>
            <input
              type="number"
              name="advancePercentage"
              value={formData.advancePercentage}
              onChange={handleChange}
              min="1"
              max="100"
              required
            />
          </div>

          <div className="add-car-field">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-car-field">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-car-field full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="add-car-field">
            <label>Seats</label>
            <input
              type="number"
              name="seats"
              value={formData.seats}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="add-car-field">
            <label>Fuel Type</label>

            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="CNG">CNG</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="add-car-field">
            <label>Transmission</label>

            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
            >
              <option value="Manual">Manual</option>
              <option value="Automatic">
                Automatic
              </option>
            </select>
          </div>

          <div className="add-car-field full-width">
            <label>Car Images</label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              multiple
              onChange={handleImageChange}
            />
          </div>

          <button
            className="add-car-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Adding Car..." : "Add Car"}
          </button>
        </form>

        {message && (
          <p className="add-car-message">
            {message}
          </p>
        )}

      </div>
    </div>
  );
};

export default AddCar;