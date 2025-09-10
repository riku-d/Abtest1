import React, { useEffect, useMemo, useState } from "react";
import { readEvents, readEnrollments } from "../utils/abtest";
import { courses } from "../data/courses";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

function calculateMetrics(events, enrollments) {
  // Group events by variant and course
  const eventsByVariant = { A: [], B: [] };
  const eventsByCourse = { "1": [], "2": [] };
  
  events.forEach(event => {
    const variant = event.variant || "unknown";
    const courseId = event.courseId || "unknown";
    
    if (eventsByVariant[variant]) {
      eventsByVariant[variant].push(event);
    }
    if (eventsByCourse[courseId]) {
      eventsByCourse[courseId].push(event);
    }
  });

  // Group enrollments by variant and course
  const enrollmentsByVariant = { A: [], B: [] };
  const enrollmentsByCourse = { "1": [], "2": [] };
  
  enrollments.forEach(enrollment => {
    const variant = enrollment.variant || "unknown";
    const courseId = enrollment.courseId || "unknown";
    
    if (enrollmentsByVariant[variant]) {
      enrollmentsByVariant[variant].push(enrollment);
    }
    if (enrollmentsByCourse[courseId]) {
      enrollmentsByCourse[courseId].push(enrollment);
    }
  });

  // Calculate metrics for each variant
  const calculateVariantMetrics = (variantEvents, variantEnrollments) => {
    const exposures = variantEvents.filter(e => e.type === 'exposure').length;
    const viewDetailsClicks = variantEvents.filter(e => e.type === 'view_details_click').length;
    const knowMoreClicks = variantEvents.filter(e => e.type === 'know_more_click').length;
    const enrollments = variantEnrollments.length;
    
    const conversionRate = exposures > 0 ? (enrollments / exposures * 100).toFixed(2) : 0;
    const clickThroughRate = exposures > 0 ? (viewDetailsClicks / exposures * 100).toFixed(2) : 0;
    
    return {
      exposures,
      viewDetailsClicks,
      knowMoreClicks,
      enrollments,
      conversionRate: parseFloat(conversionRate),
      clickThroughRate: parseFloat(clickThroughRate)
    };
  };

  // Calculate course-specific metrics
  const calculateCourseMetrics = (courseId) => {
    const courseEvents = eventsByCourse[courseId] || [];
    const courseEnrollments = enrollmentsByCourse[courseId] || [];
    const course = courses.find(c => c.id === courseId);
    
    const exposures = courseEvents.filter(e => e.type === 'exposure').length;
    const enrollments = courseEnrollments.length;
    const conversionRate = exposures > 0 ? (enrollments / exposures * 100).toFixed(2) : 0;
    
    // Group by variant for this course
    const enrollmentsByVariantForCourse = { A: [], B: [] };
    courseEnrollments.forEach(enrollment => {
      const variant = enrollment.variant || "unknown";
      if (enrollmentsByVariantForCourse[variant]) {
        enrollmentsByVariantForCourse[variant].push(enrollment);
      }
    });
    
    return {
      courseId,
      courseTitle: course?.title || `Course ${courseId}`,
      rating: course?.rating || 0,
      price: course?.price || 0,
      exposures,
      enrollments,
      conversionRate: parseFloat(conversionRate),
      enrollmentsByVariant: {
        A: enrollmentsByVariantForCourse.A.length,
        B: enrollmentsByVariantForCourse.B.length
      }
    };
  };

  return {
    A: calculateVariantMetrics(eventsByVariant.A, enrollmentsByVariant.A),
    B: calculateVariantMetrics(eventsByVariant.B, enrollmentsByVariant.B),
    courses: {
      "1": calculateCourseMetrics("1"),
      "2": calculateCourseMetrics("2")
    }
  };
}

export default function Analytics() {
  const [events, setEvents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [eventsData, enrollmentsData] = await Promise.all([
          readEvents(),
          readEnrollments()
        ]);
        setEvents(eventsData);
        setEnrollments(enrollmentsData);
      } catch (e) {
        console.error('Failed to load analytics data:', e);
        setEvents([]);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const metrics = useMemo(() => calculateMetrics(events, enrollments), [events, enrollments]);

  if (loading) {
    return (
      <div style={{ padding: 18, textAlign: 'center' }}>
        <h3>Loading Analytics...</h3>
      </div>
    );
  }

  const totalEnrollments = metrics.A.enrollments + metrics.B.enrollments;
  const totalExposures = metrics.A.exposures + metrics.B.exposures;
  const course1Data = metrics.courses["1"];
  const course2Data = metrics.courses["2"];

  // Calculate insights
  const highRatingCourseEnrollments = course1Data.enrollments;
  const lowRatingCourseEnrollments = course2Data.enrollments;
  const ratingPreference = highRatingCourseEnrollments > lowRatingCourseEnrollments ? 'High Rating' : 'Low Rating';
  const pricePreference = course1Data.enrollments > course2Data.enrollments ? 'Higher Price' : 'Lower Price';

  return (
    <div style={{ padding: 18 }}>
      <div className="analytics">
        <h2 style={{ marginBottom: '30px', color: '#333' }}>Advanced A/B Test Analytics Dashboard</h2>
        
        {/* Key Metrics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Total Enrollments</h3>
            <div style={{ fontSize: '2.5em', fontWeight: 'bold' }}>{totalEnrollments}</div>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Total Exposures</h3>
            <div style={{ fontSize: '2.5em', fontWeight: 'bold' }}>{totalExposures}</div>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Overall Conversion Rate</h3>
            <div style={{ fontSize: '2.5em', fontWeight: 'bold' }}>
              {totalExposures > 0 ? (totalEnrollments / totalExposures * 100).toFixed(2) : 0}%
            </div>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Course Preference</h3>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{ratingPreference}</div>
            <div style={{ fontSize: '0.9em', opacity: 0.9 }}>Wins by {Math.abs(highRatingCourseEnrollments - lowRatingCourseEnrollments)} enrollments</div>
          </div>
        </div>

        {/* Course-Specific Analytics */}
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '25px', color: '#333', textAlign: 'center' }}>Course Performance Analysis</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '25px' 
          }}>
            {/* High Rating Course (Course 1) */}
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white', 
              padding: '20px', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h4 style={{ marginBottom: '15px', fontSize: '18px' }}>⭐ High Rating Course (4.8⭐)</h4>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <div><strong>Course:</strong> {course1Data.courseTitle}</div>
                <div><strong>Original Price:</strong> ₹{course1Data.price}</div>
                <div><strong>Total Enrollments:</strong> {course1Data.enrollments}</div>
                <div><strong>Conversion Rate:</strong> {course1Data.conversionRate}%</div>
                <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px' }}>
                  <div><strong>Variant A:</strong> {course1Data.enrollmentsByVariant.A} enrollments</div>
                  <div><strong>Variant B:</strong> {course1Data.enrollmentsByVariant.B} enrollments</div>
                </div>
              </div>
            </div>

            {/* Low Rating Course (Course 2) */}
            <div style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
              color: 'white', 
              padding: '20px', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h4 style={{ marginBottom: '15px', fontSize: '18px' }}>⭐ Low Rating Course (3.2⭐)</h4>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <div><strong>Course:</strong> {course2Data.courseTitle}</div>
                <div><strong>Original Price:</strong> ₹{course2Data.price}</div>
                <div><strong>Total Enrollments:</strong> {course2Data.enrollments}</div>
                <div><strong>Conversion Rate:</strong> {course2Data.conversionRate}%</div>
                <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px' }}>
                  <div><strong>Variant A:</strong> {course2Data.enrollmentsByVariant.A} enrollments</div>
                  <div><strong>Variant B:</strong> {course2Data.enrollmentsByVariant.B} enrollments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variant Comparison */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '10px',
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>Variant A (Free + Certificate Fee)</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div><strong>Exposures:</strong> {metrics.A.exposures}</div>
              <div><strong>View Details Clicks:</strong> {metrics.A.viewDetailsClicks}</div>
              <div><strong>Know More Clicks:</strong> {metrics.A.knowMoreClicks}</div>
              <div><strong>Enrollments:</strong> {metrics.A.enrollments}</div>
              <div><strong>Conversion Rate:</strong> {metrics.A.conversionRate}%</div>
              <div><strong>Click Through Rate:</strong> {metrics.A.clickThroughRate}%</div>
            </div>
          </div>

          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '10px',
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>Variant B (50% OFF + Free Certificate)</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div><strong>Exposures:</strong> {metrics.B.exposures}</div>
              <div><strong>View Details Clicks:</strong> {metrics.B.viewDetailsClicks}</div>
              <div><strong>Know More Clicks:</strong> {metrics.B.knowMoreClicks}</div>
              <div><strong>Enrollments:</strong> {metrics.B.enrollments}</div>
              <div><strong>Conversion Rate:</strong> {metrics.B.conversionRate}%</div>
              <div><strong>Click Through Rate:</strong> {metrics.B.clickThroughRate}%</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '30px', 
          marginBottom: '30px' 
        }}>
          {/* Course Enrollment Comparison */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>Course Enrollment Comparison</h4>
            <div style={{ height: '300px' }}>
              <Bar
                data={{
                  labels: ['High Rating (4.8⭐)', 'Low Rating (3.2⭐)'],
                  datasets: [{
                    label: 'Enrollments',
                    data: [course1Data.enrollments, course2Data.enrollments],
                    backgroundColor: ['#667eea', '#f093fb'],
                    borderColor: ['#5a6fd8', '#e084f0'],
                    borderWidth: 2,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>

          {/* Variant Performance by Course */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>Variant Performance by Course</h4>
            <div style={{ height: '300px' }}>
              <Bar
                data={{
                  labels: ['Course 1 (High Rating)', 'Course 2 (Low Rating)'],
                  datasets: [
                    {
                      label: 'Variant A (Free + Cert)',
                      data: [course1Data.enrollmentsByVariant.A, course2Data.enrollmentsByVariant.A],
                      backgroundColor: 'rgba(0, 123, 255, 0.8)',
                      borderColor: 'rgba(0, 123, 255, 1)',
                      borderWidth: 2,
                    },
                    {
                      label: 'Variant B (50% OFF + Free Cert)',
                      data: [course1Data.enrollmentsByVariant.B, course2Data.enrollmentsByVariant.B],
                      backgroundColor: 'rgba(220, 53, 69, 0.8)',
                      borderColor: 'rgba(220, 53, 69, 1)',
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Additional Insights Charts */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '30px', 
          marginBottom: '30px' 
        }}>
          {/* Conversion Rate Comparison */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>Conversion Rate by Course</h4>
            <div style={{ height: '300px' }}>
              <Doughnut
                data={{
                  labels: ['High Rating Course', 'Low Rating Course'],
                  datasets: [{
                    data: [course1Data.conversionRate, course2Data.conversionRate],
                    backgroundColor: ['#667eea', '#f093fb'],
                    borderColor: ['#5a6fd8', '#e084f0'],
                    borderWidth: 2,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' },
                  },
                }}
              />
            </div>
          </div>

          {/* Rating vs Enrollment Analysis */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>Rating vs Enrollment Correlation</h4>
            <div style={{ height: '300px' }}>
              <Line
                data={{
                  labels: ['Low Rating (3.2⭐)', 'High Rating (4.8⭐)'],
                  datasets: [{
                    label: 'Enrollments',
                    data: [course2Data.enrollments, course1Data.enrollments],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                    x: {
                      title: {
                        display: true,
                        text: 'Course Rating'
                      }
                    }
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Detailed Metrics Chart */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>Detailed Performance Comparison</h4>
          <div style={{ height: '400px' }}>
            <Bar
              data={{
                labels: ['Exposures', 'View Details Clicks', 'Know More Clicks', 'Enrollments'],
                datasets: [
                  {
                    label: 'Variant A',
                    data: [metrics.A.exposures, metrics.A.viewDetailsClicks, metrics.A.knowMoreClicks, metrics.A.enrollments],
                    backgroundColor: 'rgba(0, 123, 255, 0.8)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 2,
                  },
                  {
                    label: 'Variant B',
                    data: [metrics.B.exposures, metrics.B.viewDetailsClicks, metrics.B.knowMoreClicks, metrics.B.enrollments],
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>

        {/* A/B Testing Focused Charts */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '30px', 
          marginBottom: '30px' 
        }}>
          {/* Conversion Rate: Variant A vs B */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>Variant Conversion Rate (A vs B)</h4>
            <div style={{ height: '300px' }}>
              <Bar
                data={{
                  labels: ['Variant A', 'Variant B'],
                  datasets: [
                    {
                      label: 'Conversion Rate %',
                      data: [metrics.A.conversionRate, metrics.B.conversionRate],
                      backgroundColor: ['rgba(0, 123, 255, 0.8)', 'rgba(220, 53, 69, 0.8)'],
                      borderColor: ['rgba(0, 123, 255, 1)', 'rgba(220, 53, 69, 1)'],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { callback: (v) => v + '%' } } },
                }}
              />
            </div>
          </div>

          {/* Click Through Rate: Variant A vs B */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>Variant Click-Through Rate (A vs B)</h4>
            <div style={{ height: '300px' }}>
              <Bar
                data={{
                  labels: ['Variant A', 'Variant B'],
                  datasets: [
                    {
                      label: 'CTR %',
                      data: [metrics.A.clickThroughRate, metrics.B.clickThroughRate],
                      backgroundColor: ['rgba(40, 167, 69, 0.8)', 'rgba(255, 193, 7, 0.8)'],
                      borderColor: ['rgba(40, 167, 69, 1)', 'rgba(255, 193, 7, 1)'],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { callback: (v) => v + '%' } } },
                }}
              />
            </div>
          </div>

          {/* Enrollment Share by Variant */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>Enrollment Share by Variant</h4>
            <div style={{ height: '300px' }}>
              <Doughnut
                data={{
                  labels: ['Variant A', 'Variant B'],
                  datasets: [
                    {
                      data: [metrics.A.enrollments, metrics.B.enrollments],
                      backgroundColor: ['#007bff', '#dc3545'],
                      borderColor: ['#0069d9', '#c82333'],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            </div>
          </div>
        </div>

        {/* Data-Driven Insights */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '25px', 
          borderRadius: '15px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>📊 Data-Driven Insights & Recommendations</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '15px', 
              borderRadius: '10px' 
            }}>
              <h4 style={{ marginBottom: '10px' }}>🎯 A/B Test Winner</h4>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <div><strong>Variant Winner:</strong> {metrics.A.conversionRate > metrics.B.conversionRate ? 'Variant A (Free + Certificate Fee)' : 'Variant B (50% OFF + Free Certificate)'}</div>
                <div><strong>Performance Difference:</strong> {Math.abs(metrics.A.conversionRate - metrics.B.conversionRate).toFixed(2)}%</div>
                <div><strong>Statistical Significance:</strong> {
                  Math.abs(metrics.A.conversionRate - metrics.B.conversionRate) > 2 
                    ? 'High - Implement winning variant' 
                    : 'Low - Continue testing'
                }</div>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '15px', 
              borderRadius: '10px' 
            }}>
              <h4 style={{ marginBottom: '10px' }}>⭐ Course Preference Analysis</h4>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <div><strong>Rating Impact:</strong> {ratingPreference} courses preferred</div>
                <div><strong>High Rating Course:</strong> {course1Data.enrollments} enrollments ({course1Data.conversionRate}% conversion)</div>
                <div><strong>Low Rating Course:</strong> {course2Data.enrollments} enrollments ({course2Data.conversionRate}% conversion)</div>
                <div><strong>Insight:</strong> {highRatingCourseEnrollments > lowRatingCourseEnrollments ? 'Quality over price sensitivity' : 'Price sensitivity over quality'}</div>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '15px', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <h4 style={{ marginBottom: '15px' }}>💡 Strategic Recommendations</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'left' }}>
              <div>• <strong>Pricing Strategy:</strong> {
                course1Data.enrollments > course2Data.enrollments 
                  ? 'Higher-priced, high-quality courses perform better - consider premium positioning'
                  : 'Lower-priced courses attract more enrollments - consider competitive pricing'
              }</div>
              <div>• <strong>Certificate Strategy:</strong> {
                metrics.A.conversionRate > metrics.B.conversionRate
                  ? 'Free courses with paid certificates work better - implement freemium model'
                  : 'Discounted courses with free certificates perform better - focus on value proposition'
              }</div>
              <div>• <strong>Course Development:</strong> {
                highRatingCourseEnrollments > lowRatingCourseEnrollments
                  ? 'Invest in course quality and instructor reputation - ratings drive enrollment'
                  : 'Focus on course accessibility and beginner-friendly content'
              }</div>
              <div>• <strong>Marketing Focus:</strong> {
                course1Data.enrollments > course2Data.enrollments
                  ? 'Target quality-conscious learners with premium course offerings'
                  : 'Target price-sensitive learners with affordable course options'
              }</div>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>📈 Key Performance Indicators</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px' 
          }}>
            <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{totalEnrollments}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Enrollments</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{totalExposures > 0 ? (totalEnrollments / totalExposures * 100).toFixed(1) : 0}%</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Overall Conversion</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{Math.max(course1Data.enrollments, course2Data.enrollments)}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Best Performing Course</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1' }}>{Math.max(metrics.A.conversionRate, metrics.B.conversionRate).toFixed(1)}%</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Best Conversion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
