import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If not on home page, navigate to home and then scroll
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <motion.div
            className="footer-main"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="footer-brand">
              <h3 className="footer-title">TutorGoat</h3>
              <p className="footer-text">
                Your trusted partner for anonymous academic assistance. We provide expert tutoring
                services with complete confidentiality and a guaranteed A or B grade promise.
              </p>
            </div>

            <div className="footer-navigation">
              <h4 className="footer-section-title">Quick Links</h4>
              <ul className="footer-nav-list">
                <li><Link to="/" className="footer-nav-link">Home</Link></li>
                <li><button onClick={() => scrollToSection("inquiry-form")} className="footer-nav-link">Get a Free Quote</button></li>
                <li><button onClick={() => scrollToSection("pricing")} className="footer-nav-link">Pricing</button></li>
                <li><Link to="/contact" className="footer-nav-link">Contact Us</Link></li>
              </ul>
            </div>

            <div className="footer-services">
              <h4 className="footer-section-title">Our Services</h4>
              <ul className="footer-services-list">
                <li>Computer Science</li>
                <li>Information Technology</li>
                <li>Business Administration</li>
                <li>Programming & Development</li>
                <li>Statistics & Analytics</li>
              </ul>
            </div>

            <div className="footer-contact">
              <h4 className="footer-section-title">Contact Info</h4>
              <div className="footer-contact-info">
                <p>📧 Email: admin@tutorgoat.com</p>
                <p>⏰ Response Time: Within 24 hours</p>
                <p>🔒 Secure & Anonymous</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="footer-social"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="footer-section-title">Follow Us</h4>
            <div className="social-icons">
              <a href="https://facebook.com/tutorgoat" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com/tutorgoat" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com/company/tutorgoat" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaLinkedinIn />
              </a>
              <a href="https://instagram.com/tutorgoat" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaInstagram />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="footer-bottom"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p>
              © {currentYear} TutorGoat. All rights reserved. |
              <span className="footer-bottom-text">
                Anonymous tutoring service with academic integrity.
              </span>
            </p>
            <div className="footer-disclaimer">
              <p>
                Disclaimer: Our service is designed to provide educational assistance and guidance.
                Students are responsible for understanding and complying with their institution's
                academic integrity policies.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
