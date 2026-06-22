import { useEffect } from 'react';
import { gsap } from 'gsap';

// Hook to trigger page-level entrance animations
export function usePageTransition() {
  useEffect(() => {
    // Animate all .card elements in view
    const cards = document.querySelectorAll('.card');
    if (cards.length > 0) {
      gsap.fromTo(cards, 
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', delay: 0.1 }
      );
    }
  }, []);
}
