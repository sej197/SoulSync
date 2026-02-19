import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { logoutUser } from '../lib/authapi';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { IoMdNotificationsOutline } from "react-icons/io";
import { useEffect } from 'react';
import StreakIndicator from './StreakIndicator';

const Navbar = () => {
    const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    
      useEffect(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/service-worker.js')
            .then(() => console.log("Service Worker registered"))
            .catch(err => console.log("Service Worker registration failed", err));
        }
      }, []);
      async function getCurrentUserId() {
      try {
        const res = await fetch("/api/auth/is-authenticated", {
          method: "GET",
          credentials: "include", // send cookies
        });
        const data = await res.json();
        if (data.isAuthenticated) return data.user.id;
        return null;
      } catch (err) {
        console.error(err);
        return null;
      }
    }
    
    
      function getUserIdFromCookie() {
        const cookieString = document.cookie; 
        const match = cookieString.match(/token=([^;]+)/);
        if (!match) return null;
    
        const token = match[1];
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload._id;
        } catch (err) {
          console.error("Invalid token", err);
          return null;
        }
      }
    
     async function handleEnableNotifications() {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Please allow notifications!");
        return;
      }
    
      const userId = await getCurrentUserId() || getUserIdFromCookie();
      if (!userId) {
        console.error("User not logged in");
        return;
      }
    
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    
      await fetch(`/api/reminders/subscribe/${userId}`, {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: { "Content-Type": "application/json" }
      });
    
      alert("Notifications enabled! You will get daily quiz reminders.");
    }
    function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
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
                        <li>
                            <details>
                                <summary className="list-none before:hidden after:hidden marker:hidden">Quiz</summary>
                                <ul className="p-2 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 min-w-[160px]">
                                    <li>
                                        <Link to="/daily-quiz" className="text-gray-700 dark:text-gray-200 hover:bg-bloom-primary/10 hover:text-bloom-primary rounded-xl transition-all">
                                            Daily Quiz
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/anxiety-quiz" className="text-gray-700 dark:text-gray-200 hover:bg-bloom-primary/10 hover:text-bloom-primary rounded-xl transition-all">
                                            Anxiety Quiz
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/depression-quiz" className="text-gray-700 dark:text-gray-200 hover:bg-bloom-primary/10 hover:text-bloom-primary rounded-xl transition-all">
                                            Depression Quiz
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/stress-quiz" className="text-gray-700 dark:text-gray-200 hover:bg-bloom-primary/10 hover:text-bloom-primary rounded-xl transition-all">
                                            Stress Quiz
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/sleep-quiz" className="text-gray-700 dark:text-gray-200 hover:bg-bloom-primary/10 hover:text-bloom-primary rounded-xl transition-all">
                                            Sleep Quiz
                                        </Link>
                                    </li>
                                </ul>
                            </details>
                        </li>
                        <li><Link to="/journal">Journal</Link></li>
                        <li><Link to="/insights">Insights</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/chatbot">Chatbot</Link></li>
                        <li><Link to="/helplines">Helplines</Link></li>
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
                    className={`menu menu-horizontal px-1 font-medium whitespace-nowrap flex-nowrap transition-colors duration-300 ${isScrolled
                        ? "text-slate-900 hover:text-bloom-primary"
                        : "text-white hover:text-bloom-primary"
                        }`}

                >
                    <li>
                        <Link to="/community-chat">Community Chat</Link>
                    </li>
                    <li>
                        <details>
                            <summary className="list-none before:hidden after:hidden marker:hidden">
                                Quiz
                            </summary>
                            <ul className="p-2 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 min-w-[160px]">
                                <li>
                                    <Link to="/daily-quiz" className="text-gray-700 dark:text-gray-200 hover:bg-bloom-primary/10 hover:text-bloom-primary rounded-xl transition-all">
                                        Daily Quiz
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/anxiety-quiz" className="text-gray-700 dark:text-gray-200 hover:bg-bloom-primary/10 hover:text-bloom-primary rounded-xl transition-all">
                                        Anxiety Quiz
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/depression-quiz" className="text-gray-700 dark:text-gray-200 hover:bg-bloom-primary/10 hover:text-bloom-primary rounded-xl transition-all">
                                        Depression Quiz
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/stress-quiz" className="text-gray-700 dark:text-gray-200 hover:bg-bloom-primary/10 hover:text-bloom-primary rounded-xl transition-all">
                                        Stress Quiz
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/sleep-quiz" className="text-gray-700 dark:text-gray-200 hover:bg-bloom-primary/10 hover:text-bloom-primary rounded-xl transition-all">
                                        Sleep Quiz
                                    </Link>
                                </li>
                            </ul>
                        </details>
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
                    <li>
                        <Link to="/helplines">Helplines</Link>
                    </li>
                </ul>
            </div>

            {/* RIGHT SIDE */}

            <div className="navbar-end flex items-center gap-3">
                {/* Streak Indicator */}
                {isLoggedIn && (
                    <StreakIndicator />
                )}

                {/* Notification Button */}
                {isLoggedIn && (
                    <button
                        onClick={handleEnableNotifications} 
                    >
                        <IoMdNotificationsOutline size={20}/>
                    </button>
                )}

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
