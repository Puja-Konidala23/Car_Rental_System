
import {
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { token, user, login } =
    useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(
          "/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setName(response.data.name);
        setEmail(response.data.email);
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const response = await api.put(
        "/users/profile",
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      login(response.data.user, token);

      setMessage(
        response.data.message
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        <h1 className="profile-title">
          My Profile
        </h1>

        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >

          <div className="profile-field">
            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />
          </div>

          <div className="profile-field">
            <label>Email</label>

            <input
              type="email"
              value={email}
              disabled
            />
          </div>

          <div className="profile-field">
            <label>Role</label>

            <input
              type="text"
              value={user?.role || ""}
              disabled
            />
          </div>

          <button
            className="profile-button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Update Profile"}
          </button>

        </form>

        {message && (
          <div className="profile-message">
            {message}
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
