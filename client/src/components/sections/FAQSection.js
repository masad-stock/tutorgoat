import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

const FAQSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [activeFAQ, setActiveFAQ] = useState(null);

  const faqs = [
    {
      question: "Is my information really anonymous?",
      answer:
        "Yes, absolutely. We don't require any personal accounts, and we only store your inquiry ID and email address for communication purposes. Your personal information is never shared with tutors or third parties.",
    },
    {
      question: "What subjects do you cover?",
      answer:
        "We specialize in Computer Science, Information Technology, Business Administration, Programming (all languages), Web & App Development, and Statistics. Our experts are highly qualified in these specific fields.",
    },
    {
      question: "How does the A or B grade guarantee work?",
      answer:
        "If you don't receive an A or B grade on your assignment, we provide a full refund. This guarantee applies to the quality of work delivered, not to cases where the assignment requirements were misunderstood or changed after submission.",
    },
    {
      question: "How quickly will I receive my quote?",
      answer:
        "We typically send personalized quotes within 24 hours of receiving your inquiry. For urgent assignments, we may respond even faster. The quote will be sent to the email address you provide.",
    },
    {
      question: "What file types can I upload?",
      answer:
        "You can upload PDF, DOC, DOCX, TXT files, and common image formats (PNG, JPG, JPEG, GIF). Each file can be up to 10MB, and you can upload up to 5 files total.",
    },
    {
      question: "How do I pay for the service?",
      answer:
        "Once you receive your quote, we'll send you a secure payment link. We accept all major credit cards and PayPal. All payments are processed securely and anonymously.",
    },
    {
      question: "Can I request revisions?",
      answer:
        "Yes, we offer unlimited revisions to ensure you're completely satisfied with the work. Our goal is to deliver exactly what you need for your assignment.",
    },
    {
      question: "What if I'm not satisfied with the work?",
      answer:
        "We stand behind our work with our A or B grade guarantee. If you're not satisfied, we'll work with you to make it right or provide a full refund if the work doesn't meet our quality standards.",
    },
    {
      question: "How do you ensure the work is plagiarism-free?",
      answer:
        "All work is original and written specifically for your assignment. We use plagiarism detection tools to ensure originality, and our experts are experienced in academic writing standards.",
    },
    {
      question: "Can I communicate with the tutor directly?",
      answer:
        "For complete anonymity, all communication goes through our secure system. You can ask questions or request changes, and we'll relay them to the assigned expert while maintaining your privacy.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <section className="faq-section" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Have questions? We've got answers. Here are the most common
            questions about our service.
          </p>
        </motion.div>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                style={{ cursor: "pointer" }}
              >
                <span>{faq.question}</span>
                <span
                  className={`faq-icon ${activeFAQ === index ? "rotated" : ""}`}
                  style={{
                    fontSize: "1rem",
                    transition: "transform 0.3s ease",
                    fontWeight: "bold",
                  }}
                >
                  {activeFAQ === index ? "−" : "+"}
                </span>
              </div>
              <AnimatePresence>
                {activeFAQ === index && (
                  <motion.div
                    className="faq-answer active"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          style={{
            textAlign: "center",
            marginTop: "3rem",
            padding: "2rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "15px",
            color: "white",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            Still Have Questions?
          </h3>
          <p
            style={{
              fontSize: "1.1rem",
              marginBottom: "1.5rem",
              opacity: 0.9,
            }}
          >
            Contact us with your inquiry ID and we'll get back to you within 24
            hours.
          </p>
          <button
            onClick={() => {
              document.getElementById("inquiry-form").scrollIntoView({
                behavior: "smooth",
              });
            }}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              border: "2px solid white",
              padding: "12px 30px",
              borderRadius: "25px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "white";
              e.target.style.color = "#667eea";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.color = "white";
            }}
          >
            Get Started Now
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
