import React, { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaCheck,
  FaClipboardCheck,
  FaBookOpen,
  FaProjectDiagram,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const PricingSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [activeTab, setActiveTab] = useState(0);

  const pricingPlans = [
    {
      type: "Quizzes and Exams",
      price: "$79",
      period: "starts at",
      icon: <FaClipboardCheck />,
      features: [
        "A or B Grade Guarantee",
        "Premium Expert Assignment",
        "Fast and Friendly Support",
        "100% Confidentiality",
      ],
      popular: false,
    },
    {
      type: "Full or Partial Class",
      price: "$99",
      period: "starts at /wk",
      icon: <FaBookOpen />,
      features: [
        "A or B Grade Guarantee",
        "Premium Expert Assignment",
        "Fast and Friendly Support",
        "100% Confidentiality",
      ],
      popular: true,
    },
    {
      type: "Assignments and Projects",
      price: "$59",
      period: "starts at",
      icon: <FaProjectDiagram />,
      features: [
        "A or B Grade Guarantee",
        "Premium Expert Assignment",
        "Fast and Friendly Support",
        "100% Confidentiality",
      ],
      popular: false,
    },
  ];

  return (
    <section className="pricing-section" id="pricing" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Transparent Pricing</h2>
          <p className="section-subtitle">
            Choose the service that fits your needs. All plans include our A or
            B grade guarantee.
          </p>
        </motion.div>

        <motion.div
          className="pricing-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="tab-buttons">
            {pricingPlans.map((plan, index) => (
              <motion.button
                key={plan.type}
                className={`tab-button ${activeTab === index ? "active" : ""} ${
                  plan.popular ? "featured" : ""
                }`}
                onClick={() => setActiveTab(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <span className="tab-icon">{plan.icon}</span>
                <span className="tab-text">{plan.type}</span>
                {plan.popular && (
                  <span className="popular-badge">Most Popular</span>
                )}
              </motion.button>
            ))}
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.type}
                className={`pricing-card ${
                  activeTab === index ? "active" : ""
                } ${plan.popular ? "featured" : ""}`}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: activeTab === index ? 1.02 : 1.01 }}
              >
                <div className="card-header">
                  <div className="service-icon">{plan.icon}</div>
                  <h3 className="service-type">{plan.type}</h3>
                </div>

                <div className="price-container">
                  <div className="price">{plan.price}</div>
                  <div className="price-period">{plan.period}</div>
                </div>

                <ul className="benefits-list">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: featureIndex * 0.1 }}
                    >
                      <FaCheck className="check-icon" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/quote"
                    className="cta-button"
                    style={{
                      background: plan.popular
                        ? "linear-gradient(45deg, #ff6b6b, #ee5a24)"
                        : "linear-gradient(45deg, #667eea, #764ba2)",
                    }}
                  >
                    Get A Quote Now
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
