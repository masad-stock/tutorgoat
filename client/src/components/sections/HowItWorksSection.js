import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const HowItWorksSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const steps = [
    {
      number: 1,
      title: "Submit Your Assignment",
      description:
        "Fill out our simple form with your assignment details, upload any relevant files, and provide your contact email.",
      icon: "📝",
    },
    {
      number: 2,
      title: "Receive Your Quote",
      description:
        "Our team reviews your assignment and sends you a personalized quote within 24 hours via email.",
      icon: "📧",
    },
    {
      number: 3,
      title: "Get Guaranteed Results",
      description:
        "Once you pay, our expert completes your assignment with an A or B grade guarantee. 100% confidential.",
      icon: "🎓",
    },
  ];

  return (
    <section className="how-it-works-section" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Getting help with your assignment is simple and secure. Follow these
            three easy steps.
          </p>
        </motion.div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="step-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="step-number">
                <span style={{ fontSize: "2rem" }}>{step.icon}</span>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Additional info section */}
        <motion.div
          className="additional-info"
          style={{
            maxWidth: "1200px",
            margin: "4rem auto 0",
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "3rem 2rem",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            Why Choose TutorGoat?
          </h3>
          <div className="why-choose-grid">
            <div className="why-choose-item">
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔒</div>
              <h4
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Complete Anonymity
              </h4>
              <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                No accounts, no profiles, no personal data stored
              </p>
            </div>
            <div className="why-choose-item">
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
              <h4
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                A or B Guarantee
              </h4>
              <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Full refund if you don't get an A or B grade
              </p>
            </div>
            <div className="why-choose-item">
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👨‍💻</div>
              <h4
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Expert Tutors
              </h4>
              <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Specialized in CS, IT, Business, and Statistics
              </p>
            </div>
            <div className="why-choose-item">
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
              <h4
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Fast Turnaround
              </h4>
              <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Quick quotes and timely delivery
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
