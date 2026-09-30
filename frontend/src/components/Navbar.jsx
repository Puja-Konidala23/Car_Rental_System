import { Link } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
      <div className="container">
        <Link
          to="/"
          className="navbar-brand fw-bold"
        >
          CarRental
        </Link>

        <div className="navbar-nav ms-auto align-items-center">

          {/* Home */}
          <Link
            to="/"
            className="nav-link"
          >
            Home
          </Link>

          {/* NOT LOGGED IN */}
          {!user && (
            <>
              <Link
                to="/login"
                className="nav-link"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="nav-link"
              >
                Register
              </Link>
            </>
          )}

          {/* NORMAL USER */}
          {user && user.role === "user" && (
            <>
              <Link
                to="/profile"
                className="nav-link"
              >
                Profile
              </Link>

              <Link
                to="/bookings"
                className="nav-link"
              >
                My Bookings
              </Link>

              <button
                onClick={logout}
                className="btn btn-outline-light btn-sm ms-2"
              >
                Logout
              </button>
            </>
          )}

          {/* ADMIN */}
          {user && user.role === "admin" && (
            <>
              <Link
                to="/admin"
                className="nav-link"
              >
                Admin Dashboard
              </Link>

              <Link
                to="/admin/add-car"
                className="nav-link"
              >
                Add Car
              </Link>

              <Link
                to="/admin/bookings"
                className="nav-link"
              >
                Bookings
              </Link>

              <button
                onClick={logout}
                className="btn btn-outline-light btn-sm ms-2"
              >
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;