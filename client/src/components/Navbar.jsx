
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`navbar sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-base-100/90 backdrop-blur-md border-b border-gray-100' : 'bg-transparent'}`}>
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li><Link to="/community-chat">Community Chat</Link></li>
                        <li><Link to="/daily-quiz">Daily Quiz</Link></li>
                        <li><Link to="/insights">Insights</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/chatbot">Chatbot</Link></li>
                    </ul>
                </div>
                <Link to="/" className="btn btn-ghost text-xl font-serif text-bloom-primary">SoulSync</Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className={`menu menu-horizontal px-1 font-medium whitespace-nowrap flex-nowrap transition-colors duration-300 ${isScrolled ? 'text-gray-600' : 'text-bloom-secondary'}`}>
                    <li><Link to="/community-chat">Community Chat</Link></li>
                    <li><Link to="/daily-quiz">Daily Quiz</Link></li>
                    <li><Link to="/insights">Insights</Link></li>
                    <li><Link to="/about">About Us</Link></li>
                    <li><Link to="/chatbot">Chatbot</Link></li>
                </ul>
            </div>
            <div className="navbar-end">
                <button className={`btn btn-ghost transition-colors duration-300 hover:text-bloom-secondary ${isScrolled ? 'text-gray-600' : 'text-bloom-primary'}`}>Logout</button>
            </div>
        </div>
    );
};

export default Navbar;
