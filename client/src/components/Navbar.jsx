import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { logoutUser } from '../lib/authapi';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, setUser, setIsLoggedIn, isLoggedIn } = useContext(AuthContext);

    //logout function
    const handleLogout = async () => {
        try {
            await logoutUser();
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
            style={!isScrolled ? { backgroundColor: '#1a1a2e' } : {}}
            className={`navbar sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-base-100/70 backdrop-blur-md border-b border-gray-100'
                : ''
                }`}
        >
            {/* LEFT SIDE */}
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>

                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li><Link to="/community-chat">Community Chat</Link></li>
                        <li><Link to="/daily-quiz">Daily Quiz</Link></li>
                        <li><Link to="/journal">Journal</Link></li>
                        <li><Link to="/insights">Insights</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/chatbot">Chatbot</Link></li>
                    </ul>
                </div>

                <Link
                    to="/"
                    className={`btn btn-ghost text-xl font-serif ${isScrolled ? 'text-bloom-primary' : 'text-bloom-primary'
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
                    <li><Link to="/journal">Journal</Link></li>
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
                {isLoggedIn && (
                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className={`btn btn-ghost btn-circle avatar transition-colors duration-300 ${isScrolled ? 'text-gray-600' : 'text-white'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-bloom-primary to-blue-400 p-[2px]">
                                <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center">
                                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-tr from-bloom-primary to-blue-400">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-3 z-[1] p-3 w-64
                              bg-white dark:bg-gray-800
                              shadow-xl shadow-black/10 dark:shadow-black/30
                              backdrop-blur-md rounded-2xl
                              border border-gray-200 dark:border-gray-700"
                        >
                            <li className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 mb-2 pointer-events-none">
                                <div className="flex flex-col gap-1 !bg-transparent !p-0">
                                    <span className="text-base font-bold text-gray-900 dark:text-white">{user?.name}</span>
                                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 truncate w-full">{user?.email}</span>
                                </div>
                            </li>
                            <li>
                                <Link to="/profile" className="py-2.5 px-4 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-bloom-primary/10 hover:text-bloom-primary active:bg-bloom-primary/20 transition-all">
                                    <User className="w-4 h-4" />
                                    Profile
                                </Link>
                            </li>
                            <li>
                                <Link to="/settings" className="py-2.5 px-4 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-bloom-primary/10 hover:text-bloom-primary active:bg-bloom-primary/20 transition-all">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                            </li>
                            <div className="my-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="py-2.5 px-4 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 active:bg-red-500/20 transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                )}

            </div>

        </div>
    );
};

export default Navbar;
