import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { recordEvent } from "../utils/abtest";

export default function CourseCard({ course, isDiscounted, variant }) {
  const navigate = useNavigate();
  const original = course.price;
  const listPrice = 1199;

  const ctaText = useMemo(
    () => (variant === "B" ? "Buy Course" : "Enroll Now"),
    [variant]
  );

  useEffect(() => {
    if (!variant) return;
    // Exposure once per user per course handled server-side
    recordEvent({ variant, courseId: course.id, type: "exposure" }).catch(
      () => {}
    );
  }, [variant, course.id]);

  function handleCTA() {
    if (!variant) return;
    // Counted by assigned variant; isDiscounted only affects UI/analytics determination elsewhere
    recordEvent({
      variant,
      courseId: course.id,
      type: "view_details_click",
    }).finally(() => {
      navigate(`/course/${course.id}`);
    });
  }

  return (
    <div className="course-card">
      {course.image && (
        <div
          style={{
            width: "100%",
            height: 150,
            backgroundImage: `url(${course.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 10,
            marginBottom: 12,
          }}
        />
      )}

      {isDiscounted && variant === "B" && <div className="badge">50% OFF</div>}

      <h3>{course.title}</h3>
      <div className="muted">
        ⭐ {course.rating} &nbsp; • &nbsp; ⏱ {course.duration}
      </div>

      {/* Variant A: Free course with certificate charge */}
      {variant === "A" && (
        <div className="price">
          <div style={{ color: '#28a745', fontWeight: 'bold', marginBottom: '4px' }}>
            Free Course
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Certificate: ₹{course.id === "1" ? "599" : "299"}
          </div>
        </div>
      )}

      {/* Variant B: 50% discount with free certificate */}
      {variant === "B" && (
        <div className="price">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span
              className="striked"
              style={{
                textDecoration: "line-through",
                color: "#888",
                marginRight: 8,
                fontSize: '14px'
              }}
            >
              ₹{original.toLocaleString()}
            </span>
            <span className="current" style={{ color: '#dc3545', fontWeight: 'bold' }}>
              ₹{Math.floor(original * 0.5).toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>
            Free Certificate
          </div>
        </div>
      )}

      <div className="actions">
        <button className="btn primary" onClick={handleCTA}>
          {ctaText}
        </button>
        <button
          className="btn secondary"
          style={{ marginLeft: 8 }}
          onClick={() => {
            if (!variant) return;
            recordEvent({
              variant,
              courseId: course.id,
              type: "know_more_click",
            }).catch(() => {});
            navigate(`/course/${course.id}`);
          }}
        >
          Know More
        </button>
      </div>
    </div>
  );
}
