import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./StudentProfiles.css";

const StudentProfiles = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const studentProfiles = [
    {
      id: 1,
      name: "Becca",
      title: "Frazzled Single Mom",
      type: "Adult Student",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      story:
        "See how a busy single mom pursuing a psychology degree had the weight taken off her shoulders when she started working with us.",
      subject: "Psychology",
    },
    {
      id: 2,
      name: "Mike",
      title: "Firefighter Earning His MBA",
      type: "Adult Student",
      image:
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      story:
        "Discover how a dedicated firefighter found the balance between saving lives and pursuing his MBA with the help of our services.",
      subject: "MBA",
    },
    {
      id: 3,
      name: "Mohamed",
      title: "Help With Gen Eds",
      type: "Traditional Student",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      story:
        "How a passionate art major found the balance between excelling in his art classes and an internship while managing his gen ed classes with our help.",
      subject: "General Education",
    },
    {
      id: 4,
      name: "Alexis",
      title: "Test Anxiety",
      type: "Traditional Student",
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      story:
        "Learn how a biology student overcame her test anxiety and excelled in her studies with our exam support services.",
      subject: "Biology",
    },
    {
      id: 5,
      name: "Reggie",
      title: "A Busy Military Student",
      type: "Adult Student",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      story:
        "How an active duty soldier pursuing a mechanical engineering degree manages his coursework while balancing military duties with our assistance.",
      subject: "Mechanical Engineering",
    },
    {
      id: 6,
      name: "Rhonda",
      title: "Widow Pursues a Degree",
      type: "Adult Student",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      story:
        "See how a determined widow found joy in pursuing her lifelong interest in political science while we took care of her math courses.",
      subject: "Political Science",
    },
  ];

  return (
    <section className="student-profiles" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="profiles-header"
        >
          <h2>Whatever your situation, we can help</h2>
          <p>
            Whether you're busy with work, family life, sports, or other
            academic responsibilities, we're happy to complete your courses or
            assignments and give you a little more time for the things you want
            to do. We serve all kinds of traditional and adult students.
          </p>
        </motion.div>

        <div className="profiles-grid">
          {studentProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              className="profile-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="profile-image-container">
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="profile-image"
                />
                <div className="profile-type-badge">{profile.type}</div>
              </div>

              <div className="profile-content">
                <h3 className="profile-name">{profile.name}</h3>
                <h4 className="profile-title">{profile.title}</h4>
                <p className="profile-story">{profile.story}</p>
                <div className="profile-actions">
                  <button className="how-we-helped-btn">How We Helped</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StudentProfiles;
