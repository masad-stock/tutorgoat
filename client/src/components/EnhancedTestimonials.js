import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaStar,
  FaQuoteLeft,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./EnhancedTestimonials.css";

const EnhancedTestimonials = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah M.",
      subject: "Computer Science",
      rating: 5,
      text: "Got an A+ on my Python programming assignment! The expert understood exactly what I needed and delivered beyond expectations. The code was clean, well-documented, and exactly what the professor was looking for.",
      avatar: "SM",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      verified: true,
    },
    {
      id: 2,
      name: "Alex K.",
      subject: "Statistics",
      rating: 5,
      text: "Amazing service! My statistics project was completed perfectly and on time. The anonymity feature gave me complete peace of mind. The analysis was thorough and helped me understand the concepts better.",
      avatar: "AK",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      verified: true,
    },
    {
      id: 3,
      name: "Mike R.",
      subject: "Business Administration",
      rating: 5,
      text: "The business case study was handled professionally. I received a detailed analysis that helped me understand the concepts better. The turnaround time was impressive and the quality exceeded my expectations.",
      avatar: "MR",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      verified: true,
    },
    {
      id: 4,
      name: "Jessica L.",
      subject: "Web Development",
      rating: 5,
      text: "Outstanding work on my web development project! The code was clean, well-documented, and exactly what the professor was looking for. The responsive design implementation was flawless.",
      avatar: "JL",
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      verified: true,
    },
    {
      id: 5,
      name: "David T.",
      subject: "Information Technology",
      rating: 5,
      text: "Perfect solution for my database design assignment. The expert explained everything clearly and delivered a comprehensive solution. The ER diagrams were professionally designed and the documentation was excellent.",
      avatar: "DT",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      verified: true,
    },
    {
      id: 6,
      name: "Emma W.",
      subject: "App Development",
      rating: 5,
      text: "Excellent help with my mobile app development project. The final product exceeded all requirements and got me the grade I needed. The code structure was clean and the app functionality was perfect.",
      avatar: "EW",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      verified: true,
    },
    {
      id: 7,
      name: "Carlos M.",
      subject: "Data Science",
      rating: 5,
      text: "I was struggling with my machine learning project until I found TutorGoat. The expert not only completed the assignment but also explained the algorithms used. Got an A+ and learned so much!",
      avatar: "CM",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      verified: true,
    },
    {
      id: 8,
      name: "Priya S.",
      subject: "Software Engineering",
      rating: 5,
      text: "The software engineering project was complex, but the expert handled it perfectly. The documentation was comprehensive, and the code followed best practices. Highly recommend this service!",
      avatar: "PS",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      verified: true,
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`star ${index < rating ? "filled" : "empty"}`}
      />
    ));
  };

  return (
    <section className="enhanced-testimonials" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="testimonials-header"
        >
          <h2>Client Love</h2>
          <p>
            We ask that clients don't submit positive reviews on third-party
            websites because colleges frequently check out review sites to
            identify students who outsource their coursework.
          </p>
          <p className="disclaimer">
            <em>
              PLEASE NOTE: All names and images have been changed to protect our
              clients' identities.
            </em>
          </p>
        </motion.div>

        {/* Featured Testimonials Grid */}
        <div className="testimonials-grid">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="testimonial-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="testimonial-image-container">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="testimonial-image"
                />
              </div>
              <div className="testimonial-rating">
                {renderStars(testimonial.rating)}
              </div>
              <div className="testimonial-content">
                <FaQuoteLeft className="quote-icon" />
                <p className="testimonial-text">{testimonial.text}</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <span className="subject">{testimonial.subject}</span>
                  {testimonial.verified && (
                    <span className="verified">✓ Verified</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Carousel for Additional Testimonials */}
        <motion.div
          className="testimonials-carousel"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="carousel-container">
            <button
              className="carousel-btn prev"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <FaChevronLeft />
            </button>

            <motion.div
              key={currentTestimonial}
              className="carousel-testimonial"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="carousel-image-container">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="carousel-image"
                />
              </div>
              <div className="carousel-rating">
                {renderStars(testimonials[currentTestimonial].rating)}
              </div>
              <div className="carousel-content">
                <FaQuoteLeft className="quote-icon" />
                <p className="carousel-text">
                  {testimonials[currentTestimonial].text}
                </p>
              </div>
              <div className="carousel-author">
                <div className="author-avatar">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="author-info">
                  <h4>{testimonials[currentTestimonial].name}</h4>
                  <span className="subject">
                    {testimonials[currentTestimonial].subject}
                  </span>
                  {testimonials[currentTestimonial].verified && (
                    <span className="verified">✓ Verified</span>
                  )}
                </div>
              </div>
            </motion.div>

            <button
              className="carousel-btn next"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="carousel-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${
                  index === currentTestimonial ? "active" : ""
                }`}
                onClick={() => setCurrentTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EnhancedTestimonials;
