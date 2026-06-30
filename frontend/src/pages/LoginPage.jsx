import { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiIdentification, HiLockClosed, HiEye, HiEyeOff, HiAcademicCap, HiUserGroup, HiClock, HiLightningBolt } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { playSound } from '../utils/sounds';
import Logo from '../components/Logo';
import api from '../utils/api';
import toast from 'react-hot-toast';
import CinematicBackground from '../components/CinematicBackground';

const FEATURES = [
  { icon: HiUserGroup, title: 'Peer Matching', desc: 'Find verified tutors ranked by expertise' },
  { icon: HiClock, title: 'Smart Scheduling', desc: 'Auto-find conflict-free time slots' },
  { icon: HiAcademicCap, title: 'Grade Verified', desc: 'Tutors verified through academic records' },
  { icon: HiLightningBolt, title: 'Instant Booking', desc: 'Book sessions in seconds, not hours' },
];

const TAGLINES = [
  'Verified Tutors, Automated Scheduling',
  'Swap Knowledge, Excel Together',
  'Smart Matching, Smarter Learning',
];

/* ── Animated counter ─────────────────── */
function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}+</span>;
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [taglineIndex, setTaglineIndex] = useState(0);
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Rotating tagline
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    playSound('click');
    try {
      const { data } = await api.post('/auth/login', { identifier, password });
      login(data);
      playSound('success');
      toast.success(`Welcome back, ${data.firstName}!`);
      if (data.mustChangePassword) { navigate('/change-password'); return; }
      if (data.role === 'admin') navigate('/admin');
      else navigate('/student');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid ID number or password';
      setError(msg);
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-surface-950 dark:bg-surface-950 transition-colors duration-500">
      {/* 3D Cinematic Background */}
      <Suspense fallback={
        <div className="absolute inset-0 bg-surface-950" />
      }>
        <CinematicBackground isDark={isDark} />
      </Suspense>

      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 z-10">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md relative z-10"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            <Logo size={72} showText textSize="text-4xl" />
          </motion.div>

          {/* Animated tagline */}
          <div className="mt-6 h-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIndex}
                initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-lg text-white/80 leading-relaxed font-medium"
              >
                {TAGLINES[taglineIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-white/50 mt-3 leading-relaxed"
          >
            Connect with peer tutors, swap knowledge, and excel together. Smart scheduling meets verified expertise.
          </motion.p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                className="flex items-start gap-3 p-3 rounded-xl 
                           bg-white/5 dark:bg-white/5 backdrop-blur-md
                           border border-white/10 dark:border-white/10
                           cursor-default group transition-shadow hover:shadow-glow-sm
                           hover:bg-white/10 hover:border-white/20"
              >
                <motion.div
                  className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <feat.icon className="w-4 h-4 text-primary-300 group-hover:text-primary-200 transition-colors" />
                </motion.div>
                <div>
                  <p className="text-xs font-bold text-white/90">{feat.title}</p>
                  <p className="text-[11px] text-white/50 mt-0.5">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Animated stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="mt-8 flex items-center gap-6"
          >
            {[
              { value: 200, label: 'Students' },
              { value: 50, label: 'Active Tutors' },
              { value: 500, label: 'Sessions' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 + i * 0.15, type: 'spring', stiffness: 200 }}
              >
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter target={stat.value} duration={2000 + i * 500} />
                </p>
                <p className="text-[11px] text-white/40">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <motion.div
            className="flex justify-center mb-8 lg:hidden"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Logo size={56} showText textSize="text-2xl" />
          </motion.div>

          <div className="text-center lg:text-left mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl font-bold text-white"
            >
              Welcome back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-white/50 mt-2"
            >
              Sign in to start swapping skills
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/5 dark:bg-white/5 backdrop-blur-xl
                       border border-white/10 dark:border-white/10
                       rounded-2xl p-6 sm:p-8 shadow-elevated relative overflow-hidden"
          >
            {/* Glassmorphic glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <form onSubmit={handleSubmit} className="space-y-5 relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <label className="block text-sm font-semibold mb-2 text-white/70">Student ID / Admin Email</label>
                <div className="relative group">
                  <HiIdentification className="absolute left-3.5 top-1/2 -translate-y-1/2 
                                              text-white/30 group-focus-within:text-primary-400 
                                              w-5 h-5 transition-colors" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => { setIdentifier(e.target.value); setError(''); }}
                    className="w-full rounded-xl px-4 py-3 pl-11 transition-all duration-200
                               bg-white/5 border-2 border-white/10
                               text-white placeholder-white/30
                               focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10
                               hover:border-white/20"
                    placeholder="e.g. 202400001"
                    required
                    autoComplete="username"
                  />
                </div>
                <p className="text-xs text-white/30 mt-1.5">
                  Students use ID number · Admins use email
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <label className="block text-sm font-semibold mb-2 text-white/70">Password</label>
                <div className="relative group">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 
                                          text-white/30 group-focus-within:text-primary-400 
                                          w-5 h-5 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className="w-full rounded-xl px-4 py-3 pl-11 pr-11 transition-all duration-200
                               bg-white/5 border-2 border-white/10
                               text-white placeholder-white/30
                               focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10
                               hover:border-white/20"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 
                               hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-white/30 mt-1.5">
                  Default: last 3 digits of your Student ID
                </p>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="flex items-center gap-2 
                               bg-red-500/10 border border-red-500/20
                               text-red-300 text-sm rounded-xl px-4 py-3"
                  >
                    <motion.span
                      className="shrink-0"
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      ⚠️
                    </motion.span>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 40px -5px rgba(99, 102, 241, 0.6)' }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-base font-semibold rounded-xl relative overflow-hidden
                           bg-gradient-to-r from-primary-500 to-purple-600
                           text-white shadow-glow
                           hover:from-primary-400 hover:to-purple-500
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="relative z-10">Sign In</span>
                )}
                {/* Button shine sweep */}
                {!loading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  />
                )}
              </motion.button>
            </form>

            {/* Demo credentials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="mt-6 pt-6 border-t border-white/10"
            >
              <p className="text-xs font-medium text-white/40 text-center mb-3">
                Demo Credentials
              </p>
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [id, pw] = e.target.value.split('|');
                  setIdentifier(id);
                  setPassword(pw);
                  playSound('pop');
                  e.target.value = '';
                }}
                defaultValue=""
                className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200
                           bg-surface-800 border-2 border-white/10
                           text-white/70
                           focus:outline-none focus:border-primary-500/50
                           hover:border-white/20
                           [&>option]:bg-surface-800 [&>option]:text-white
                           [&>optgroup]:bg-surface-800 [&>optgroup]:text-white/50"
              >
                <option value="">Select an account to auto-fill...</option>
                <optgroup label="Admin">
                  <option value="admin@skillswap.edu|admin123">Admin — admin@skillswap.edu</option>
                </optgroup>
                <optgroup label="Students (with schedule)">
                  <option value="23063670|670">Simone Makinano — 23063670 (Year 3)</option>
                </optgroup>
                <optgroup label="1st Year Students">
                  <option value="202401001|001">Juan Dela Cruz — 202401001</option>
                  <option value="202401002|002">Maria Santos — 202401002</option>
                  <option value="202401003|003">Carlos Reyes — 202401003</option>
                  <option value="202401004|004">Andrea Cruz — 202401004</option>
                </optgroup>
                <optgroup label="2nd Year Students">
                  <option value="202302001|001">Miguel Dela Cruz — 202302001</option>
                  <option value="202302002|002">Sofia Santos — 202302002</option>
                  <option value="202302003|003">Diego Reyes — 202302003</option>
                  <option value="202302004|004">Isabella Cruz — 202302004</option>
                </optgroup>
                <optgroup label="3rd Year Students">
                  <option value="202203001|001">Rafael Dela Cruz — 202203001</option>
                  <option value="202203002|002">Camille Santos — 202203002</option>
                  <option value="202203003|003">Gabriel Reyes — 202203003</option>
                  <option value="202203004|004">Nicole Cruz — 202203004</option>
                </optgroup>
                <optgroup label="4th Year Students">
                  <option value="202104001|001">Antonio Dela Cruz — 202104001</option>
                  <option value="202104002|002">Patricia Santos — 202104002</option>
                  <option value="202104003|003">Marco Reyes — 202104003</option>
                  <option value="202104004|004">Jasmine Cruz — 202104004</option>
                </optgroup>
              </select>
            </motion.div>
          </motion.div>

          {/* Bottom branding */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center text-xs text-white/20 mt-6"
          >
            SkillSwap · College of Computer Studies · UC South Campus
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
