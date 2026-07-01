import  { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
      {/* LEFT - Brand */}
      <Link to="/dashboard" className="text-lg font-bold">
        Grand Matériel
      </Link>

      {/* CENTER - Links */}
      <ul className="flex items-center gap-6 text-sm">
        <li>
          <Link
            to="/dashboard"
            className="hover:text-gray-300 transition-colors"
          >
            Home
          </Link>
        </li>

        <li>
          <Link
            to="/dashboard"
            className="hover:text-gray-300 transition-colors"
          >
            Grand Matériel
          </Link>
        </li>

        {/* Reports Dropdown */}
        <li className="relative">
          <button
            onClick={() => setReportsOpen(!reportsOpen)}
            className="flex items-center gap-1 hover:text-gray-300"
          >
            Reports
            <svg
              className={`w-4 h-4 transition-transform ${
                reportsOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {reportsOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white text-black rounded shadow-lg overflow-hidden z-50">
              <Link
                to="/reports/analyse-quantitative"
                onClick={() => setReportsOpen(false)}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Analyse Quantitative
              </Link>
            </div>
          )}
        </li>
      </ul>

      {/* RIGHT - User Menu */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded hover:bg-gray-700"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>User</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg overflow-hidden z-50">
            <div className="px-4 py-2 text-sm border-b">
              Signed in
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;