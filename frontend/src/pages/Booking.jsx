
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./Booking.css";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token, user } = useContext(AuthContext);

  const [car, setCar] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [totalDays, setTotalDays] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] =
    useState(0);

  const [availability, setAvailability] =
    useState(null);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] =
    useState(false);

  const [bookingLoading, setBookingLoading] =
    useState(false);

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

  useEffect(() => {
    if (!startDate || !endDate || !car) {
      setTotalDays(0);
      setTotalAmount(0);
      setAdvanceAmount(0);
      setRemainingAmount(0);
      setAvailability(null);

      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setTotalDays(0);
      setTotalAmount(0);
      setAdvanceAmount(0);
      setRemainingAmount(0);
      setAvailability(null);

      return;
    }

    const millisecondsPerDay =
      1000 * 60 * 60 * 24;

    const days = Math.ceil(
      (end - start) / millisecondsPerDay
    );

    const total = days * car.pricePerDay;

    const advance =
      (total * car.advancePercentage) / 100;

    const remaining = total - advance;

    setTotalDays(days);
    setTotalAmount(total);
    setAdvanceAmount(advance);
    setRemainingAmount(remaining);
  }, [startDate, endDate, car]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!startDate || !endDate) {
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        setAvailability({
          available: false,
          message:
            "End date must be after start date",
        });

        return;
      }

      try {
        setCheckingAvailability(true);

        const response = await api.get(
          "/bookings/availability",
          {
            params: {
              carId: id,
              startDate,
              endDate,
            },
          }
        );

        setAvailability(response.data);
      } catch (error) {
        setAvailability({
          available: false,
          message:
            error.response?.data?.message ||
            "Unable to check availability",
        });
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [startDate, endDate, id]);

  const handleBooking = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!startDate || !endDate) {
      setMessage(
        "Please select both dates"
      );

      return;
    }

    if (totalDays <= 0) {
      setMessage(
        "End date must be after start date"
      );

      return;
    }

    if (
      availability &&
      !availability.available
    ) {
      setMessage(
        "This car is not available for the selected dates"
      );

      return;
    }

    try {
      setBookingLoading(true);
      setMessage("");

      const response = await api.post(
        "/bookings",
        {
          carId: id,
          startDate,
          endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(
        `/payment/${response.data.booking.id}`,
        {
          state: {
            booking: response.data.booking,
            razorpay:
              response.data.razorpay,
          },
        }
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Booking failed"
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-status">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="booking-status">
        <h2>Car not found</h2>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">

        <h1>
          Book {car.name}
        </h1>

        <p className="car-price">
          ₹{car.pricePerDay} / day
        </p>

        <div className="date-section">

          <div className="date-field">
            <label>Start Date</label>

            <input
              type="date"
              value={startDate}
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(e) =>
                setStartDate(e.target.value)
              }
            />
          </div>

          <div className="date-field">
            <label>End Date</label>

            <input
              type="date"
              value={endDate}
              min={
                startDate ||
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(e) =>
                setEndDate(e.target.value)
              }
            />
          </div>

        </div>

        {checkingAvailability && (
          <div className="availability checking">
            Checking availability...
          </div>
        )}

        {availability &&
          !checkingAvailability && (
            <div
              className={`availability ${
                availability.available
                  ? "available"
                  : "unavailable"
              }`}
            >
              {availability.available
                ? "✅ Car is available for these dates"
                : `❌ ${availability.message}`}
            </div>
          )}

        <hr className="booking-divider" />

        <div className="booking-summary">

          <h2>Booking Summary</h2>

          <div className="summary-row">
            <span>Total Days</span>
            <strong>{totalDays}</strong>
          </div>

          <div className="summary-row total">
            <span>Total Amount</span>
            <strong>₹{totalAmount}</strong>
          </div>

          <div className="summary-row advance">
            <span>
              Advance ({car.advancePercentage}%)
            </span>

            <strong>
              ₹{advanceAmount}
            </strong>
          </div>

          <div className="summary-row remaining">
            <span>Remaining Amount</span>

            <strong>
              ₹{remainingAmount}
            </strong>
          </div>

        </div>

        {message && (
          <div className="booking-message">
            {message}
          </div>
        )}

        <button
          className="booking-button"
          onClick={handleBooking}
          disabled={
            bookingLoading ||
            checkingAvailability ||
            availability?.available === false
          }
        >
          {bookingLoading
            ? "Creating Booking..."
            : `Pay ₹${advanceAmount}`}
        </button>

      </div>
    </div>
  );
};

export default Booking;

