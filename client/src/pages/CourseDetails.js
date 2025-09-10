import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courses } from "../data/courses";
import { recordEvent, getOrAssignVariant, recordEnrollment } from "../utils/abtest";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDescription, setShowDescription] = useState(false);
  const [variant, setVariant] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const v = await getOrAssignVariant();
        if (!mounted) return;
        setVariant(v);
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, []);
  
  const course = courses.find(c => c.id === id);
  
  useEffect(() => {
    // no passive details_view
  }, [course, id, variant]);

  const ctaText = useMemo(() => (variant === "B" ? "Buy Course" : "Enroll Now"), [variant]);

  if (!course) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Course not found</h2>
        <button className="btn primary" onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  const courseDescriptions = {
    "1": {
      title: "Full Stack Web Developer Career Accelerator",
      shortDesc: "Master both frontend and backend development to become a complete web developer.",
      fullDesc: [
        "This comprehensive course covers everything you need to know to become a full-stack web developer:",
        "• Frontend Development: HTML5, CSS3, JavaScript (ES6+), React.js, and modern UI frameworks",
        "• Backend Development: Node.js, Express.js, Python, Django, and database management",
        "• Database Technologies: MongoDB, PostgreSQL, and Redis for data persistence",
        "• DevOps & Deployment: Git, Docker, AWS, and CI/CD pipelines",
        "• Real-world Projects: Build 10+ portfolio projects including e-commerce sites, social media apps, and more",
        "• Career Preparation: Interview prep, resume building, and networking strategies",
        "• Industry Best Practices: Code quality, testing, security, and performance optimization"
      ],
      backgroundImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
    },
    "2": {
      title: "Full Stack Web Developer Career Accelerator",
      shortDesc: "Master both frontend and backend development to become a complete web developer.",
      fullDesc: [
        "This comprehensive course covers everything you need to know to become a full-stack web developer:",
        "• Frontend Development: HTML5, CSS3, JavaScript (ES6+), React.js, and modern UI frameworks",
        "• Backend Development: Node.js, Express.js, Python, Django, and database management",
        "• Database Technologies: MongoDB, PostgreSQL, and Redis for data persistence",
        "• DevOps & Deployment: Git, Docker, AWS, and CI/CD pipelines",
        "• Real-world Projects: Build 10+ portfolio projects including e-commerce sites, social media apps, and more",
        "• Career Preparation: Interview prep, resume building, and networking strategies",
        "• Industry Best Practices: Code quality, testing, security, and performance optimization"
      ],
      backgroundImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
    }
  };

  const courseInfo = courseDescriptions[id];

  return (
    <div className="course-details">
      <div 
        className="course-hero" 
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${courseInfo.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          padding: '60px 20px',
          textAlign: 'center'
        }}
      >
        <h1>{courseInfo.title}</h1>
        <p style={{ fontSize: '18px', marginTop: '10px', opacity: 0.9 }}>
          {courseInfo.shortDesc}
        </p>
      </div>

      <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="course-info">
          <div className="course-stats" style={{ 
            display: 'flex', 
            gap: '30px', 
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>⭐ {course.rating}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Rating</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>⏱ {course.duration}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Duration</div>
            </div>
            {variant === "A" && (
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>Free</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Course</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  Certificate: ₹{course.id === "1" ? "599" : "299"}
                </div>
              </div>
            )}
            {variant === "B" && (
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                  ₹{Math.floor(course.price * 0.5).toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Course (50% OFF)</div>
                <div style={{ fontSize: '12px', color: '#28a745', marginTop: '4px', fontWeight: 'bold' }}>
                  Free Certificate
                </div>
              </div>
            )}
          </div>

          <div className="course-description">
            <button 
              className="btn primary"
              onClick={() => {
                if (!variant) return;
                recordEvent({ variant, courseId: id, type: "know_more_click" });
                setShowDescription(!showDescription);
              }}
              style={{ marginBottom: '20px' }}
            >
              {showDescription ? 'Show Less' : 'Know More'}
            </button>

            {showDescription && (
              <div className="description-content" style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                lineHeight: '1.6'
              }}>
                {courseInfo.fullDesc.map((point, index) => (
                  <p key={index} style={{ 
                    marginBottom: index === 0 ? '15px' : '8px',
                    fontWeight: index === 0 ? 'bold' : 'normal'
                  }}>
                    {point}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="course-actions" style={{ marginTop: '40px', textAlign: 'center' }}>
            <button className="btn primary" style={{ marginRight: '15px' }} onClick={async () => {
              if (!variant) return;
              try {
                // Record the enrollment
                await recordEnrollment({ variant, courseId: id });
                // Record the event for analytics
                await recordEvent({ variant, courseId: id, type: "enrollment" });
                setShowPopup(true);
              } catch (error) {
                console.error('Failed to record enrollment:', error);
                // Still show popup even if recording fails
                setShowPopup(true);
              }
            }}>
              {ctaText}
            </button>
            <button className="btn secondary" onClick={() => navigate("/")}>
              Back to Courses
            </button>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={{ marginBottom: "10px" }}>Enrolled into the Course! 🎉</h2>
            <button 
              style={styles.closeBtn} 
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0px 5px 15px rgba(0,0,0,0.3)",
    minWidth: "300px",
  },
  closeBtn: {
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  }
};
