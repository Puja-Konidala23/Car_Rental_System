
import { useContext, useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./Payment.css";

const Payment = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { token } = useContext(AuthContext);

  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState(false);

  const booking = location.state?.booking;
  const razorpayData = location.state?.razorpay;

  useEffect(() => {
    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!booking || !razorpayData) {
      setMessage(
        "Payment information is missing. Please create the booking again."
      );
      return;
    }

    if (!window.Razorpay) {
      setMessage(
        "Razorpay is still loading. Please try again."
      );
      return;
    }

    setPaying(true);
    setMessage("");

    const options = {
      key: razorpayData.key,

      amount: razorpayData.amount,

      currency: razorpayData.currency,

      name: "Car Rental",

      description: "Car Rental Advance Payment",

      order_id: razorpayData.orderId,

      handler: async function (response) {
        try {
          const verifyResponse = await api.post(
            "/bookings/verify-payment",
            {
              bookingId,

              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setMessage(
            verifyResponse.data.message
          );

          setTimeout(() => {
            navigate("/bookings");
          }, 1500);
        } catch (error) {
          setMessage(
            error.response?.data?.message ||
              "Payment verification failed"
          );
        } finally {
          setPaying(false);
        }
      },

      prefill: {
        name: "",
        email: "",
        contact: "",
      },

      theme: {
        color: "#000000",
      },

      modal: {
        ondismiss: function () {
          setPaying(false);
          setMessage("Payment cancelled");
        },
      },
    };

    const razorpay = new window.Razorpay(
      options
    );

    razorpay.on(
      "payment.failed",
      function (response) {
        setPaying(false);

        setMessage(
          response.error?.description ||
            "Payment failed"
        );
      }
    );

    razorpay.open();
  };

  if (!booking || !razorpayData) {
    return (
      <div className="payment-error-page">
        <div className="payment-error-container">

          <h2>
            Payment information not found
          </h2>

          <button
            className="home-button"
            onClick={() => navigate("/")}
          >
            Go Home
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">

        <h1 className="payment-title">
          Complete Payment
        </h1>

        <div className="payment-summary">

          <h2 className="payment-summary-title">
            Booking Summary
          </h2>

          <div className="payment-row">
            <span>Total Days</span>
            <strong>
              {booking.totalDays}
            </strong>
          </div>

          <div className="payment-row">
            <span>Total Amount</span>
            <strong>
              ₹{booking.totalAmount}
            </strong>
          </div>

          <div className="payment-row advance">
            <span>Advance Payment</span>
            <strong>
              ₹{booking.advanceAmount}
            </strong>
          </div>

          <div className="payment-row remaining">
            <span>Remaining Amount</span>
            <strong>
              ₹{booking.remainingAmount}
            </strong>
          </div>

        </div>

        {message && (
          <div className="payment-message">
            {message}
          </div>
        )}

        <button
          className="payment-button"
          onClick={handlePayment}
          disabled={paying}
        >
          {paying
            ? "Processing..."
            : `Pay ₹${booking.advanceAmount}`}
        </button>

      </div>
    </div>
  );
};

export default Payment;

