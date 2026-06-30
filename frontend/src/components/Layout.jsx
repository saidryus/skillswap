import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Ambient floating orbs in the background ── */
function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Aurora mesh — slow-moving gradient blobs */}
      <div className="absolute -top-[300px] -left-[200px] w-[700px] h-[700px] 
                      bg-gradient-to-br from-primary-500/[0.07] via-purple-500/[0.04] to-transparent
                      rounded-full blur-[100px] animate-float-slow" />
      <div className="absolute -bottom-[200px] -right-[300px] w-[800px] h-[800px] 
                      bg-gradient-to-tl from-emerald-500/[0.05] via-primary-500/[0.03] to-transparent
                      rounded-full blur-[120px] animate-float-reverse" />
      <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] 
                      bg-gradient-to-bl from-purple-500/[0.04] via-transparent to-transparent
                      rounded-full blur-[80px] animate-pulse-slow" />
      
      {/* Accent beam — diagonal light streak */}
      <div className="absolute top-0 left-[20%] w-[1px] h-full 
                      bg-gradient-to-b from-primary-500/[0.08] via-primary-500/[0.02] to-transparent
                      rotate-[15deg] origin-top" />
      <div className="absolute top-0 right-[35%] w-[1px] h-[60%] 
                      bg-gradient-to-b from-purple-500/[0.06] via-transparent to-transparent
                      rotate-[-10deg] origin-top" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial vignette from center */}
      <div className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, transparent 0%, var(--color-bg) 70%)',
        }}
      />

      {/* Top gradient fade — gives depth behind topbar */}
      <div className="absolute top-0 left-0 right-0 h-[400px] 
                      bg-gradient-to-b from-primary-500/[0.04] via-purple-500/[0.02] to-transparent
                      dark:from-primary-500/[0.06] dark:via-purple-500/[0.03]" />

      {/* Glowing orb accents — small bright spots */}
      <div className="absolute top-[15%] left-[10%] w-2 h-2 rounded-full bg-primary-400/30 dark:bg-primary-400/20 blur-[2px] animate-pulse-slow" />
      <div className="absolute top-[45%] right-[15%] w-1.5 h-1.5 rounded-full bg-emerald-400/30 dark:bg-emerald-400/20 blur-[2px] animate-float" />
      <div className="absolute bottom-[25%] left-[25%] w-2 h-2 rounded-full bg-purple-400/20 dark:bg-purple-400/15 blur-[3px] animate-float-delayed" />
      <div className="absolute top-[65%] right-[30%] w-1 h-1 rounded-full bg-primary-300/25 dark:bg-primary-300/15 blur-[1px] animate-bounce-subtle" />
      <div className="absolute top-[20%] right-[45%] w-1.5 h-1.5 rounded-full bg-amber-400/20 dark:bg-amber-400/10 blur-[2px] animate-float-slow" />
    </div>
  );
}

/* ── Mouse-following gradient spotlight ── */
function MouseSpotlight() {
  const spotRef = useRef(null);

  useEffect(() => {
    const handleMouse = (e) => {
      if (!spotRef.current) return;
      spotRef.current.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div
      ref={spotRef}
      className="fixed w-[400px] h-[400px] pointer-events-none z-0 transition-transform duration-[2000ms] ease-out
                 bg-primary-500/[0.02] dark:bg-primary-400/[0.015] rounded-full blur-3xl"
      style={{ top: 0, left: 0 }}
    />
  );
}

/* ── Page transition variants ── */
const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      {/* Ambient background effects */}
      <AmbientOrbs />
      <MouseSpotlight />

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative z-20'}
        ${isMobile && !mobileOpen ? '-translate-x-full' : 'translate-x-0'}
        transition-transform duration-300 ease-spring overflow-visible
      `}>
        <Sidebar
          open={isMobile ? true : sidebarOpen}
          setOpen={isMobile ? setMobileOpen : setSidebarOpen}
          isMobile={isMobile}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">
        <Topbar
          onMenuClick={() => isMobile ? setMobileOpen(!mobileOpen) : setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto scroll-smooth overscroll-none">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
