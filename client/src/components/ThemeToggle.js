import React from "react";
import { motion } from "framer-motion";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      className="theme-toggle"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
    >
      <motion.div
        className="theme-toggle-track"
        animate={{
          backgroundColor: isDarkMode ? "#4a5568" : "#e2e8f0",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="theme-toggle-thumb"
          animate={{
            x: isDarkMode ? 24 : 0,
            backgroundColor: isDarkMode ? "#2d3748" : "#ffffff",
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <motion.div
            className="theme-icon"
            animate={{
              opacity: isDarkMode ? 0 : 1,
              rotate: isDarkMode ? 180 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <FaSun />
          </motion.div>
          <motion.div
            className="theme-icon"
            animate={{
              opacity: isDarkMode ? 1 : 0,
              rotate: isDarkMode ? 0 : -180,
            }}
            transition={{ duration: 0.3 }}
          >
            <FaMoon />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
