import React from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import "./Header.css";

const Header = () => {
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
    <header className="site-header">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <img src="/logo.png" alt="TutorGoat Logo" />
          </Link>
        </div>
        <nav className="main-nav">
          <ul>
            <li>
              <button
                onClick={() => scrollToSection("pricing")}
                className="nav-link"
              >
                Pricing
              </button>
            </li>
            <li>
              <Link to="/quote" className="nav-link">
                Get A Free Quote
              </Link>
            </li>
            <li>
              <Link to="/contact" className="nav-link">
                Contact
              </Link>
            </li>
            <li className="theme-toggle-container">
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
