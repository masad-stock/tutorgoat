import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const TestimonialsSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: "Got an A+ on my Python programming assignment! The expert understood exactly what I needed and delivered beyond expectations.",
      author: "Sarah M.",
      subject: "Computer Science",
    },
    {
      text: "Amazing service! My statistics project was completed perfectly and on time. The anonymity feature gave me complete peace of mind.",
      author: "Alex K.",
      subject: "Statistics",
    },
    {
      text: "The business case study was handled professionally. I received a detailed analysis that helped me understand the concepts better.",
      author: "Mike R.",
      subject: "Business Administration",
    },
    {
      text: "Outstanding work on my web development project! The code was clean, well-documented, and exactly what the professor was looking for.",
      author: "Jessica L.",
      subject: "Web Development",
    },
    {
      text: "Perfect solution for my database design assignment. The expert explained everything clearly and delivered a comprehensive solution.",
      author: "David T.",
      subject: "Information Technology",
    },
    {
      text: "Excellent help with my mobile app development project. The final product exceeded all requirements and got me the grade I needed.",
      author: "Emma W.",
      subject: "App Development",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="testimonials-section" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">What Our Students Say</h2>
          <p className="section-subtitle">
            Don't just take our word for it. Here's what students say about our
            service.
          </p>
        </motion.div>

        <div className="testimonials-grid">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">{testimonial.author}</div>
              <div className="testimonial-subject">{testimonial.subject}</div>
            </motion.div>
          ))}
        </div>

        {/* Rotating testimonial carousel */}
        <motion.div
          className="testimonial-carousel"
          style={{
            maxWidth: "600px",
            margin: "3rem auto 0",
            textAlign: "center",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "15px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-10px",
                left: "20px",
                fontSize: "4rem",
                color: "#667eea",
                fontFamily: "serif",
              }}
            >
              "
            </div>
            <p
              style={{
                fontStyle: "italic",
                color: "#555",
                marginBottom: "1.5rem",
                lineHeight: "1.6",
                fontSize: "1.1rem",
              }}
            >
              {testimonials[currentTestimonial].text}
            </p>
            <div
              style={{
                fontWeight: "600",
                color: "#2c3e50",
                marginBottom: "0.5rem",
              }}
            >
              {testimonials[currentTestimonial].author}
            </div>
            <div
              style={{
                color: "#6c757d",
                fontSize: "0.9rem",
              }}
            >
              {testimonials[currentTestimonial].subject}
            </div>
          </motion.div>

          {/* Dots indicator */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1.5rem",
              gap: "0.5rem",
            }}
          >
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  border: "none",
                  background:
                    index === currentTestimonial ? "#667eea" : "#dee2e6",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
