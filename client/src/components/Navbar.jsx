import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import authapi from '../lib/authapi';
import { User, Settings, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const Navbar = () => {
    const navigate = useNavigate();
    const { setUser, setIsLoggedIn } = useContext(AuthContext);

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

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
                    className={`menu menu-horizontal px-1 font-medium whitespace-nowrap flex-nowrap transition-colors duration-300 ${isScrolled ? 'text-gray-600' : 'text-white'
                        }`}
                >
                    <li><Link to="/community-chat">Community Chat</Link></li>
                    <li><Link to="/daily-quiz">Daily Quiz</Link></li>
                    <li><Link to="/insights">Insights</Link></li>
                    <li><Link to="/about">About Us</Link></li>
                    <li><Link to="/chatbot">Chatbot</Link></li>
                </ul>
            </div>

            {/* RIGHT SIDE */}

            <div className="navbar-end flex items-center gap-3">

                {/* Profile Dropdown */}
                <div className="dropdown dropdown-end">
                    <div
                        tabIndex={0}
                        role="button"
                        className={`btn btn-ghost btn-circle avatar transition-colors duration-300 ${isScrolled ? 'text-gray-600' : 'text-white'
                            }`}
                    >
                        <div className="w-9 h-9 rounded-full bg-bloom-primary/20 flex items-center justify-center border border-bloom-primary/30 text-bloom-primary">
                            <User className="w-5 h-5" />
                        </div>
                    </div>

                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-soft bg-base-100 rounded-box w-56 border border-gray-100"
                    >
                        <li className="menu-title px-4 py-2 border-b border-gray-100 mb-2">
                            <span className="text-gray-900 font-semibold block">Hello, User</span>
                            <span className="text-xs text-gray-500 font-normal">user@example.com</span>
                        </li>
                        <li>
                            <Link to="/profile" className="flex items-center gap-2 py-2 text-gray-700 hover:text-bloom-primary hover:bg-bloom-primary/10">
                                <User className="w-4 h-4" />
                                Profile
                            </Link>
                        </li>
                        <li>
                            <Link to="/settings" className="flex items-center gap-2 py-2 text-gray-700 hover:text-bloom-primary hover:bg-bloom-primary/10">
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
