import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Intersection Observer based scroll reveal with GSAP
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      y = 40,
      x = 0,
      duration = 0.8,
      delay = 0,
      ease = 'power3.out',
      stagger = 0.1,
      children = false,
    } = options;

    const targets = children ? el.children : [el];

    gsap.set(targets, { y, x, opacity: 0 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(targets, {
              y: 0,
              x: 0,
              opacity: 1,
              duration,
              delay,
              ease,
              stagger: children ? stagger : 0,
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

// Staggered children reveal
export function useStaggerReveal(options = {}) {
  return useScrollReveal({ ...options, children: true });
}

// Counter animation
export function useCountUp(targetValue, duration = 1.5) {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const obj = { val: 0 };
            gsap.to(obj, {
              val: targetValue,
              duration,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = Math.round(obj.val);
              },
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetValue, duration]);

  return ref;
}

// Parallax scroll effect
export function useParallax(speed = 0.5) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const scrolled = window.innerHeight - rect.top;
      if (scrolled > 0) {
        gsap.set(el, { y: scrolled * speed * -0.1 });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return ref;
}
