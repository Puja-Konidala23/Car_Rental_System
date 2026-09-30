import { useContext, useEffect, useState } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import "./AdminBookings.css";

const AdminBookings = () => {
  const { token, user } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchBookings = async () => {
    try {
      const response = await api.get(
        "/bookings/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchBookings();
    }
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(
        `/bookings/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking._id === id
            ? {
                ...booking,
                bookingStatus: status,
              }
            : booking
        )
      );

      setMessage("Booking status updated");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-access-denied">
        <h2>Admin access required</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-bookings-loading">
        <h2>Loading bookings...</h2>
      </div>
    );
  }

  return (
    <div className="admin-bookings-page">
      <div className="admin-bookings-container">

        <h1 className="admin-bookings-title">
          All Bookings
        </h1>

        {message && (
          <p className="admin-bookings-message">
            {message}
          </p>
        )}

        {bookings.length === 0 ? (
          <p className="admin-bookings-empty">
            No bookings found.
          </p>
        ) : (
          <div className="admin-bookings-list">

            {bookings.map((booking) => (
              <div
                className="admin-booking-card"
                key={booking._id}
              >
                <h2 className="admin-booking-title">
                  {booking.car?.name}
                </h2>

                <p className="admin-booking-customer">
                  <strong>Customer:</strong>{" "}
                  {booking.user?.name}
                  <br />
                  <strong>Email:</strong>{" "}
                  {booking.user?.email}
                </p>

                <div className="admin-booking-info">

                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(
                      booking.startDate
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    <strong>End:</strong>{" "}
                    {new Date(
                      booking.endDate
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    <strong>Total:</strong>{" "}
                    ₹{booking.totalAmount}
                  </p>

                  <p>
                    <strong>Advance:</strong>{" "}
                    ₹{booking.advanceAmount}
                  </p>

                </div>

                <div className="admin-booking-status">

                  <span className="admin-status-badge admin-payment-status">
                    Payment: {booking.paymentStatus}
                  </span>

                  <span
                    className={`admin-status-badge admin-booking-status-badge ${
                      booking.bookingStatus === "Cancelled"
                        ? "cancelled"
                        : booking.bookingStatus === "Completed"
                        ? "completed"
                        : ""
                    }`}
                  >
                    Booking: {booking.bookingStatus}
                  </span>

                </div>

                <div className="admin-booking-actions">

                  <button
                    className="admin-booking-button confirm-button"
                    onClick={() =>
                      updateStatus(
                        booking._id,
                        "Confirmed"
                      )
                    }
                  >
                    Confirm
                  </button>

                  <button
                    className="admin-booking-button cancel-button"
                    onClick={() =>
                      updateStatus(
                        booking._id,
                        "Cancelled"
                      )
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="admin-booking-button complete-button"
                    onClick={() =>
                      updateStatus(
                        booking._id,
                        "Completed"
                      )
                    }
                  >
                    Complete
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;