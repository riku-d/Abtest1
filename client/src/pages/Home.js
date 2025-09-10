import React, { useEffect, useMemo, useRef, useState } from "react";
import { courses } from "../data/courses";
import CourseCard from "../components/CourseCard";
import { getOrAssignVariant, recordEvent } from "../utils/abtest";

export default function Home() {
  const [variant, setVariant] = useState(null);
  const startTimeRef = useRef(null);
  const maxScrollRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const v = await getOrAssignVariant();
        if (!mounted) return;
        setVariant(v);
        // record a home page view once per visit
        await recordEvent({ variant: v, courseId: "home", type: "view" });
        startTimeRef.current = Date.now();
        const onScroll = () => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
          const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const depth = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
          if (depth > maxScrollRef.current) maxScrollRef.current = depth;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('beforeunload', handleUnload);
        function handleUnload() {
          const ms = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
          navigator.sendBeacon && navigator.sendBeacon('/api/events', new Blob([JSON.stringify({ variant: v, courseId: 'home', type: 'home_time_spent', extra: { ms, maxScroll: maxScrollRef.current } })], { type: 'application/json' }));
        }
        return () => {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('beforeunload', handleUnload);
          // also record on React unmount
          const ms = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
          recordEvent({ variant: v, courseId: 'home', type: 'home_time_spent', extra: { ms, maxScroll: maxScrollRef.current } }).catch(() => {});
        };
      } catch (e) {
        // swallow
      }
    })();
    return () => { mounted = false; };
  }, []);

  // For new experiment: Variant B shows discount badges for all courses, price unchanged
  const showDiscountBadges = useMemo(() => variant === 'B', [variant]);

  return (
    <main>
      <section className="hero" aria-label="hero">
        <div className="hero-left">
          <h1>Full Stack Web Developer Career Accelerator</h1>
          <p>
            Your career in full stack web development starts here. Fast-track learning and interview prep.
            Grow skills at your own pace.
          </p>

          <div className="hero-cta">
            <button className="primary-cta" onClick={() => document.querySelector('.courses-grid').scrollIntoView({ behavior: 'smooth' })}>Get started</button>
            
          </div>
        </div>

        <div className="hero-right" aria-hidden="true" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
      </section>

      {variant && (
        <section className="courses-grid" aria-label="courses">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              isDiscounted={showDiscountBadges}
              variant={variant}
            />
          ))}
        </section>
      )}
    </main>
  );
}
