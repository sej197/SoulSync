
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer p-10 bg-bloom-cream text-base-content">
            <aside>
                <h2 className="text-2xl font-serif text-bloom-primary mb-2">SoulSync</h2>
                <p>Providing a compassionate platform to help you track your mental well being<br />Dedicated to your growth and happiness</p>
            </aside>
            <nav>
                <h6 className="footer-title text-bloom-muted opacity-100">Services</h6>
                <Link to="/services" className="link link-hover">Therapy</Link>
                <Link to="/services" className="link link-hover">Counseling</Link>
                <Link to="/services" className="link link-hover">Support Groups</Link>
            </nav>
            <nav>
                <h6 className="footer-title text-bloom-muted opacity-100">Company</h6>
                <Link to="/about" className="link link-hover">About us</Link>
                <Link to="/contact" className="link link-hover">Contact</Link>
            </nav>
            <nav>
                <h6 className="footer-title text-bloom-muted opacity-100">Legal</h6>
                <Link to="/terms" className="link link-hover">Terms of use</Link>
                <Link to="/privacy" className="link link-hover">Privacy policy</Link>
                <Link to="/cookie" className="link link-hover">Cookie policy</Link>
            </nav>
        </footer>
    );
};

export default Footer;
