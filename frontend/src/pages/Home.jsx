import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";

const Home = () => {
  const [cars, setCars] = useState([]);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchCars = async () => {
    try {
      setLoading(true);

      const response = await api.get("/cars", {
        params: {
          search,
          city,
          fuelType,
          transmission,
        },
      });

      setCars(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to load cars"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCars();
  };

  return (
    <div className="page-container">
      <section className="hero-section text-center">
        <h1>Find Your Perfect Car</h1>

        <p className="lead">
          Rent reliable cars at affordable prices.
        </p>

        <form
          onSubmit={handleSearch}
          className="row g-2 justify-content-center mt-4"
        >
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search cars..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="City"
              value={city}
              onChange={(e) =>
                setCity(e.target.value)
              }
            />
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={fuelType}
              onChange={(e) =>
                setFuelType(e.target.value)
              }
            >
              <option value="">
                Fuel
              </option>
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

          <div className="col-md-2">
            <select
              className="form-select"
              value={transmission}
              onChange={(e) =>
                setTransmission(e.target.value)
              }
            >
              <option value="">
                Transmission
              </option>
              <option value="Manual">
                Manual
              </option>
              <option value="Automatic">
                Automatic
              </option>
            </select>
          </div>

          <div className="col-md-1">
            <button
              type="submit"
              className="btn btn-primary w-100"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      <h2 className="mb-4">
        Available Cars
      </h2>

      {message && (
        <div className="alert alert-danger">
          {message}
        </div>
      )}

      {loading ? (
        <p>Loading cars...</p>
      ) : cars.length === 0 ? (
        <div className="alert alert-info">
          No cars found.
        </div>
      ) : (
        <div className="row g-4">
          {cars.map((car) => (
            <div
              className="col-md-6 col-lg-4"
              key={car._id}
            >
              <div className="car-card">
                {car.images.length > 0 ? (
                  <img
                    src={car.images[0]}
                    alt={car.name}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center bg-secondary text-white"
                    style={{
                      height: "220px",
                    }}
                  >
                    No Image
                  </div>
                )}

                <div className="car-card-content">
                  <h3>{car.name}</h3>

                  <p className="text-muted">
                    {car.brand} {car.model} •{" "}
                    {car.year}
                  </p>

                  <p>
                    {car.seats} Seats •{" "}
                    {car.fuelType} •{" "}
                    {car.transmission}
                  </p>

                  <p className="price">
                    ₹{car.pricePerDay}
                    <span className="text-muted fs-6">
                      {" "}
                      / day
                    </span>
                  </p>

                  <Link
                    to={`/cars/${car._id}`}
                    className="btn btn-dark w-100"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;