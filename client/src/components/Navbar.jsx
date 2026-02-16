import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import authapi from "../lib/authapi";
import { User, Settings, LogOut } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setIsLoggedIn } = useContext(AuthContext);

  const isHome = location.pathname === "/";
  const isInsights = location.pathname === "/insights";
  const isLightPage = isHome || isInsights;

  //logout function
  const handleLogout = async () => {
    try {
      await authapi.post("/logout");
      setUser(null);
      setIsLoggedIn(false);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={!isScrolled && !isLightPage ? { backgroundColor: "#1a1a2e" } : {}}
      className={`navbar sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : isLightPage
            ? "bg-transparent"
            : ""
      }`}
    >
      {/* LEFT SIDE */}
      <div className="navbar-start">
       
        <Link
          to="/"
          className={`btn btn-ghost text-xl font-serif ${
            isScrolled ? "text-slate-900" : "text-white"
          }`}
        >
          SoulSync
        </Link>
      </div>

      {/* CENTER MENU */}
      <div className="navbar-center hidden lg:flex">
        <ul
          className={`menu menu-horizontal px-1 font-medium whitespace-nowrap flex-nowrap transition-colors duration-300 ${
  isScrolled
    ? "text-slate-900 hover:text-bloom-primary"
    : "text-white hover:text-bloom-primary"
}`}

        >
          <li>
            <Link to="/community-chat">Community Chat</Link>
          </li>
          <li>
            <Link to="/daily-quiz">Daily Quiz</Link>
          </li>
          <li>
            <Link to="/insights">Insights</Link>
          </li>
          <li>
            <Link to="/about">About Us</Link>
          </li>
          <li>
            <Link to="/chatbot">Chatbot</Link>
          </li>
        </ul>
      </div>

      {/* RIGHT SIDE */}

      <div className="navbar-end flex items-center gap-3">
        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-ghost text-xl font-serif ${
              isScrolled ? "text-slate-900" : "text-white"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center border ${isScrolled || isLightPage ? "bg-orange-50 text-slate-900 border-slate-200" : "bg-bloom-primary/20 text-bloom-primary border-bloom-primary/30"}`}
            >
              <User className="w-5 h-5" />
            </div>
          </div>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-soft bg-white text-slate-900 rounded-box w-56 border border-gray-100"
          >
            <li className="menu-title px-4 py-2 border-b border-gray-100 mb-2">
              <span className="text-gray-900 font-semibold block">
                Hello, User
              </span>
              <span className="text-xs text-gray-500 font-normal">
                user@example.com
              </span>
            </li>
            <li>
              <Link
                to="/profile"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-bloom-primary hover:bg-bloom-primary/10"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-bloom-primary hover:bg-bloom-primary/10"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </li>
            <div className="divider my-1"></div>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
