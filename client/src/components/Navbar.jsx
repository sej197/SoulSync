import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import authapi from '../lib/authapi';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const Navbar = () => {
    const navigate = useNavigate();
    const { setUser, setIsLoggedIn, isLoggedIn } = useContext(AuthContext);

    //logout function
    const handleLogout = async () => {
        try {
            await authapi.post("/logout");
            setUser(null);
            setIsLoggedIn(false);
            navigate("/login", { replace: true });
        }catch(error) {
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
            {isLoggedIn && (
            <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className={`btn btn-ghost btn-circle avatar transition-colors duration-300 ${
                isScrolled ? 'text-gray-600' : 'text-white'
                }`}
            >
                <div className="w-9 rounded-full bg-bloom-primary/20 flex items-center justify-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-bloom-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5.121 17.804A9 9 0 1118.88 17.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
                </svg>
            </div>
            </div>

            <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-44"
            >
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/settings">Settings</Link></li>
            <li>
            <button  onClick={handleLogout}>Logout</button>
            </li>
            </ul>
            </div>
            )}

        </div>  

    </div>
    );
};

export default Navbar;
