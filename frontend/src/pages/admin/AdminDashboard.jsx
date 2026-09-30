import { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { token, user } = useContext(AuthContext);

  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchDashboardData = async () => {
    try {
      const [carsResponse, bookingsResponse] =
        await Promise.all([
          api.get("/cars"),
          api.get("/bookings/all", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      setCars(carsResponse.data);
      setBookings(bookingsResponse.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this car?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/cars/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCars(
        cars.filter((car) => car._id !== id)
      );

      setMessage("Car deleted successfully");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to delete car"
      );
    }
  };

  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter(
    (booking) =>
      booking.bookingStatus === "Confirmed"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) =>
      booking.bookingStatus === "Pending"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) =>
      booking.bookingStatus === "Cancelled"
  ).length;

  const totalRevenue = bookings
    .filter(
      (booking) =>
        booking.paymentStatus === "Paid"
    )
    .reduce(
      (total, booking) =>
        total + Number(booking.advanceAmount || 0),
      0
    );

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-access-denied">
        <h2>Admin access required</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">

        <h1 className="admin-dashboard-title">
          Admin Dashboard
        </h1>

        <div className="admin-dashboard-actions">

          <Link
            className="admin-action-link"
            to="/admin/add-car"
          >
            <button className="admin-action-button">
              Add New Car
            </button>
          </Link>

          <Link
            className="admin-action-link"
            to="/admin/bookings"
          >
            <button className="admin-action-button">
              Manage Bookings
            </button>
          </Link>

        </div>

        {message && (
          <p className="admin-dashboard-message">
            {message}
          </p>
        )}

        <hr className="admin-section-divider" />

        <h2 className="admin-section-title">
          Dashboard Overview
        </h2>

        <div className="dashboard-stats">

          <div className="dashboard-stat-card">
            <h3>Total Cars</h3>
            <p>{cars.length}</p>
          </div>

          <div className="dashboard-stat-card">
            <h3>Total Bookings</h3>
            <p>{totalBookings}</p>
          </div>

          <div className="dashboard-stat-card">
            <h3>Confirmed Bookings</h3>
            <p>{confirmedBookings}</p>
          </div>

          <div className="dashboard-stat-card">
            <h3>Pending Bookings</h3>
            <p>{pendingBookings}</p>
          </div>

          <div className="dashboard-stat-card">
            <h3>Cancelled Bookings</h3>
            <p>{cancelledBookings}</p>
          </div>

          <div className="dashboard-stat-card revenue">
            <h3>Advance Revenue</h3>
            <p>₹{totalRevenue}</p>
          </div>

        </div>

        <hr className="admin-section-divider" />

        <h2 className="admin-section-title">
          Total Cars: {cars.length}
        </h2>

        {cars.length === 0 ? (
          <p className="admin-no-cars">
            No cars added yet.
          </p>
        ) : (
          <div className="admin-cars-list">

            {cars.map((car) => (
              <div
                className="admin-car-card"
                key={car._id}
              >

                {car.images.length > 0 && (
                  <img
                    className="admin-car-image"
                    src={car.images[0]}
                    alt={car.name}
                  />
                )}

                <div className="admin-car-content">

                  <h2 className="admin-car-name">
                    {car.name}
                  </h2>

                  <p className="admin-car-model">
                    {car.brand} {car.model} ({car.year})
                  </p>

                  <p className="admin-car-price">
                    ₹{car.pricePerDay} / day
                  </p>

                  <p className="admin-car-city">
                    📍 {car.city}
                  </p>

                  <p className="admin-car-features">
                    {car.seats} Seats • {car.fuelType} •{" "}
                    {car.transmission}
                  </p>

                  <div className="admin-car-actions">

                    <Link
                      className="admin-car-link"
                      to={`/cars/${car._id}`}
                    >
                      View
                    </Link>

                    <Link
                      className="admin-car-link admin-car-edit"
                      to={`/admin/edit-car/${car._id}`}
                    >
                      Edit
                    </Link>

                    <button
                      className="admin-car-delete"
                      onClick={() =>
                        handleDelete(car._id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;