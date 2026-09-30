import { useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./MyBookings.css";

const MyBookings = () => {
  const { token, user } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchBookings = async () => {
    try {
      const response = await api.get(
        "/bookings/my",
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
    if (user) {
      fetchBookings();
    }
  }, [token, user]);

  const cancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.put(
        `/bookings/${bookingId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                bookingStatus: "Cancelled",
              }
            : booking
        )
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to cancel booking"
      );
    }
  };

  if (loading) {
    return (
      <div className="my-bookings-loading">
        <h2>Loading bookings...</h2>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">

        <h1 className="my-bookings-title">
          My Bookings
        </h1>

        {message && (
          <p className="my-bookings-message">
            {message}
          </p>
        )}

        {bookings.length === 0 ? (
          <p className="no-bookings">
            You have no bookings yet.
          </p>
        ) : (
          <div className="bookings-list">

            {bookings.map((booking) => (
              <div
                className="booking-card"
                key={booking._id}
              >

                {booking.car?.images?.length > 0 && (
                  <div className="booking-image-container">
                    <img
                      className="booking-image"
                      src={booking.car.images[0]}
                      alt={booking.car.name}
                    />
                  </div>
                )}

                <div className="booking-details">

                  <h2 className="booking-car-name">
                    {booking.car?.name}
                  </h2>

                  <p className="booking-car-model">
                    {booking.car?.brand}{" "}
                    {booking.car?.model}
                  </p>

                  <div className="booking-info">

                    <p>
                      <strong>Start Date:</strong>{" "}
                      {new Date(
                        booking.startDate
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      <strong>End Date:</strong>{" "}
                      {new Date(
                        booking.endDate
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      <strong>Total Days:</strong>{" "}
                      {booking.totalDays}
                    </p>

                    <p>
                      <strong>Total Amount:</strong>{" "}
                      ₹{booking.totalAmount}
                    </p>

                    <p>
                      <strong>Advance Paid:</strong>{" "}
                      ₹{booking.advanceAmount}
                    </p>

                    <p>
                      <strong>Remaining:</strong>{" "}
                      ₹{booking.remainingAmount}
                    </p>

                  </div>

                  <div className="booking-status-section">

                    <span className="status-badge payment-status">
                      Payment Status:{" "}
                      {booking.paymentStatus}
                    </span>

                    <span
                      className={`status-badge booking-status ${
                        booking.bookingStatus === "Cancelled"
                          ? "cancelled"
                          : booking.bookingStatus === "Completed"
                          ? "completed"
                          : ""
                      }`}
                    >
                      Booking Status:{" "}
                      {booking.bookingStatus}
                    </span>

                  </div>

                  {booking.bookingStatus !==
                    "Cancelled" &&
                    booking.bookingStatus !==
                      "Completed" && (
                      <button
                        className="cancel-booking-button"
                        onClick={() =>
                          cancelBooking(
                            booking._id
                          )
                        }
                      >
                        Cancel Booking
                      </button>
                    )}

                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;