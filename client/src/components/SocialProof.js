import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaUsers,
  FaCalendarAlt,
  FaGraduationCap,
  FaShieldAlt,
} from "react-icons/fa";
import "./SocialProof.css";

const SocialProof = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [counters, setCounters] = useState({
    students: 0,
    years: 0,
    experts: 0,
    successRate: 0,
  });

  const stats = [
    {
      icon: FaUsers,
      value: 35000,
      suffix: "+",
      label: "Students Served",
      color: "#667eea",
      description: "Happy students who trust us with their academic success",
    },
    {
      icon: FaCalendarAlt,
      value: 14,
      suffix: "+",
      label: "Years Experience",
      color: "#28a745",
      description: "Over a decade of reliable academic assistance",
    },
    {
      icon: FaGraduationCap,
      value: 200,
      suffix: "+",
      label: "Expert Tutors",
      color: "#ffc107",
      description: "Highly qualified professionals in their fields",
    },
    {
      icon: FaShieldAlt,
      value: 99,
      suffix: "%",
      label: "Success Rate",
      color: "#dc3545",
      description: "A or B grade guarantee success rate",
    },
  ];

  const animateCounter = (target, key, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCounters((prev) => ({ ...prev, [key]: target }));
        clearInterval(timer);
      } else {
        setCounters((prev) => ({ ...prev, [key]: Math.floor(start) }));
      }
    }, 16);
  };

  useEffect(() => {
    if (inView) {
      stats.forEach((stat, index) => {
        setTimeout(() => {
          animateCounter(
            stat.value,
            stat.label
              .toLowerCase()
              .replace(/\s+/g, "")
              .replace(/[^a-z]/g, "")
          );
        }, index * 200);
      });
    }
  }, [inView]);

  const getCounterValue = (stat) => {
    const key = stat.label
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z]/g, "");
    return counters[key] || 0;
  };

  return (
    <section className="social-proof" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="social-proof-content"
        >
          {/* Left side - Images */}
          <div className="social-proof-image">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="image-container"
              style={{ height: "45%", minHeight: "300px" }}
            >
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Professional expert tutor"
                className="expert-image"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="image-container"
              style={{ height: "55%", minHeight: "400px" }}
            >
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Professional expert tutor woman"
                className="expert-image"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </motion.div>
          </div>

          {/* Right side - Cards */}
          <div className="social-proof-cards">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="social-proof-header"
            >
              <h2>See why 35,000+ students trust us with their coursework</h2>
              <p>
                The numbers don't lie. We've worked hard to gain the trust of
                students across North America and overseas. And we'd love the
                chance to earn your trust.
              </p>
            </motion.div>

            <div className="stats-grid">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="stat-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="stat-icon" style={{ color: stat.color }}>
                    <stat.icon />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      <motion.span
                        className="counter"
                        initial={{ scale: 0.5 }}
                        animate={inView ? { scale: 1 } : { scale: 0.5 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {getCounterValue(stat).toLocaleString()}
                      </motion.span>
                      <span className="suffix">{stat.suffix}</span>
                    </div>
                    <h3 className="stat-label">{stat.label}</h3>
                    <p className="stat-description">{stat.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Indicators */}
            <motion.div
              className="trust-indicators"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="trust-item">
                <div className="trust-icon">
                  <FaShieldAlt />
                </div>
                <div className="trust-content">
                  <h4>We Use Real Experts (No AI Ever)</h4>
                  <p>
                    We guarantee that all work is completed by human experts,
                    not AI tools. With colleges cracking down on AI usage, our
                    human-only approach ensures that students stay safe and
                    compliant with academic integrity policies.
                  </p>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon">
                  <FaShieldAlt />
                </div>
                <div className="trust-content">
                  <h4>Your Privacy Guaranteed</h4>
                  <p>
                    Our proprietary security process ensures that your
                    information remains confidential. We employ the strictest
                    privacy measures to protect students, ensuring that your
                    academic identity remains anonymous and secure.
                  </p>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon">
                  <FaGraduationCap />
                </div>
                <div className="trust-content">
                  <h4>Top US-Based Experts</h4>
                  <p>
                    Our team consists of hundreds of experienced professionals,
                    primarily based in the US. This ensures clear communication,
                    cultural relevance, and high-quality work that meets
                    American academic standards.
                  </p>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon">
                  <FaCalendarAlt />
                </div>
                <div className="trust-content">
                  <h4>Over a Decade of Excellence</h4>
                  <p>
                    As the oldest homework help company, founded in 2010, we
                    have over a decade of experience in providing reliable and
                    top-quality academic assistance. We've been featured by
                    countless media including Vice, ABC, CBS, and NBC
                    affiliates.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
