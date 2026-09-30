
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import "./CarDetails.css";

const CarDetails = () => {
  const { id } = useParams();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await api.get(`/cars/${id}`);
        setCar(response.data);
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

  if (loading) {
    return (
      <div className="car-details-status">
        <h2>Loading car...</h2>
      </div>
    );
  }

  if (message) {
    return (
      <div className="car-details-status">
        <h2>{message}</h2>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="car-details-status">
        <h2>Car not found</h2>
      </div>
    );
  }

  return (
    <div className="car-details-page">
      <div className="car-details-container">

        <h1 className="car-details-title">
          {car.name}
        </h1>

        <div className="car-images">
          {car.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${car.name} ${index + 1}`}
              className="car-image"
            />
          ))}
        </div>

        <h2>
          {car.brand} {car.model}
        </h2>

        <div className="car-info">

          <div className="car-info-item">
            <strong>Year:</strong> {car.year}
          </div>

          <div className="car-info-item">
            <strong>Seats:</strong> {car.seats}
          </div>

          <div className="car-info-item">
            <strong>Fuel:</strong> {car.fuelType}
          </div>

          <div className="car-info-item">
            <strong>Transmission:</strong>{" "}
            {car.transmission}
          </div>

          <div className="car-info-item">
            <strong>City:</strong> {car.city}
          </div>

          <div className="car-info-item">
            <strong>Address:</strong> {car.address}
          </div>

        </div>

        <p className="car-price">
          ₹{car.pricePerDay} / day
        </p>

        <p className="car-advance">
          Advance: {car.advancePercentage}%
        </p>

        <div className="car-description">
          <strong>Description</strong>
          <p>{car.description}</p>
        </div>

        <div
          className={`car-status ${
            car.isAvailable
              ? "available"
              : "unavailable"
          }`}
        >
          Status:{" "}
          {car.isAvailable
            ? "Available"
            : "Currently unavailable"}
        </div>

        {car.isAvailable && (
          <Link to={`/book/${car._id}`}>
            <button className="book-car-button">
              Book This Car
            </button>
          </Link>
        )}

      </div>
    </div>
  );
};

export default CarDetails;

