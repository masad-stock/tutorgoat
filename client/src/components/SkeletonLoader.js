import React from "react";
import { motion } from "framer-motion";
import "./SkeletonLoader.css";

const SkeletonLoader = ({
  type = "text",
  width = "100%",
  height = "20px",
  count = 1,
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case "text":
        return (
          <div className="skeleton skeleton-text" style={{ width, height }} />
        );
      case "card":
        return (
          <div className="skeleton-card">
            <div
              className="skeleton skeleton-image"
              style={{ height: "200px" }}
            />
            <div className="skeleton-content">
              <div
                className="skeleton skeleton-text"
                style={{ height: "20px", marginBottom: "10px" }}
              />
              <div
                className="skeleton skeleton-text"
                style={{ height: "16px", width: "80%" }}
              />
            </div>
          </div>
        );
      case "form":
        return (
          <div className="skeleton-form">
            <div
              className="skeleton skeleton-text"
              style={{ height: "16px", width: "30%", marginBottom: "8px" }}
            />
            <div
              className="skeleton skeleton-input"
              style={{ height: "40px", marginBottom: "20px" }}
            />
            <div
              className="skeleton skeleton-text"
              style={{ height: "16px", width: "25%", marginBottom: "8px" }}
            />
            <div
              className="skeleton skeleton-textarea"
              style={{ height: "100px", marginBottom: "20px" }}
            />
            <div
              className="skeleton skeleton-button"
              style={{ height: "45px", width: "120px" }}
            />
          </div>
        );
      case "testimonial":
        return (
          <div className="skeleton-testimonial">
            <div
              className="skeleton skeleton-text"
              style={{ height: "16px", marginBottom: "10px" }}
            />
            <div
              className="skeleton skeleton-text"
              style={{ height: "16px", marginBottom: "10px" }}
            />
            <div
              className="skeleton skeleton-text"
              style={{ height: "16px", width: "70%", marginBottom: "15px" }}
            />
            <div
              className="skeleton skeleton-text"
              style={{ height: "14px", width: "40%" }}
            />
          </div>
        );
      default:
        return (
          <div
            className="skeleton skeleton-default"
            style={{ width, height }}
          />
        );
    }
  };

  return (
    <div className="skeleton-container">
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
