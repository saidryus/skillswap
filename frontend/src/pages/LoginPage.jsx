import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiIdentification, HiLockClosed, HiEye, HiEyeOff, HiAcademicCap, HiUserGroup, HiClock, HiLightningBolt } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { playSound } from '../utils/sounds';
import Logo from '../components/Logo';
import api from '../utils/api';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: HiUserGroup, title: 'Peer Matching', desc: 'Find verified tutors ranked by expertise' },
  { icon: HiClock, title: 'Smart Scheduling', desc: 'Auto-find conflict-free time slots' },
  { icon: HiAcademicCap, title: 'Grade Verified', desc: 'Tutors verified through academic records' },
  { icon: HiLightningBolt, title: 'Instant Booking', desc: 'Book sessions in seconds, not hours' },
];

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

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
    <div className="min-h-screen flex relative overflow-hidden bg-surface-50 dark:bg-surface-950 transition-colors duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-500/8 dark:bg-primary-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-emerald-500/8 dark:bg-emerald-500/4 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-3xl animate-pulse-slow" />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md relative z-10"
        >
          <Logo size={72} showText textSize="text-4xl" />

          <p className="text-lg text-surface-600 dark:text-surface-300 mt-6 leading-relaxed">
            Connect with peer tutors, swap knowledge, and excel together. Smart scheduling meets verified expertise.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-surface-900/50 
                           border border-surface-200/50 dark:border-surface-800/50 backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center shrink-0">
                  <feat.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-surface-800 dark:text-surface-200">{feat.title}</p>
                  <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-0.5">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 flex items-center gap-6"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-surface-900 dark:text-white">200+</p>
              <p className="text-[11px] text-surface-500 dark:text-surface-400">Students</p>
            </div>
            <div className="w-px h-8 bg-surface-200 dark:bg-surface-800" />
            <div className="text-center">
              <p className="text-2xl font-bold text-surface-900 dark:text-white">50+</p>
              <p className="text-[11px] text-surface-500 dark:text-surface-400">Active Tutors</p>
            </div>
            <div className="w-px h-8 bg-surface-200 dark:bg-surface-800" />
            <div className="text-center">
              <p className="text-2xl font-bold text-surface-900 dark:text-white">500+</p>
              <p className="text-[11px] text-surface-500 dark:text-surface-400">Sessions</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size={56} showText textSize="text-2xl" />
          </div>

          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2">
              Sign in to start swapping skills
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 
                       rounded-2xl p-6 sm:p-8 shadow-elevated"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Student ID / Admin Email</label>
                <div className="relative group">
                  <HiIdentification className="absolute left-3.5 top-1/2 -translate-y-1/2 
                                              text-surface-400 group-focus-within:text-primary-500 
                                              w-5 h-5 transition-colors" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => { setIdentifier(e.target.value); setError(''); }}
                    className="input-field pl-11"
                    placeholder="e.g. 202400001"
                    required
                    autoComplete="username"
                  />
                </div>
                <p className="text-xs text-surface-400 mt-1.5">
                  Students use ID number · Admins use email
                </p>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative group">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 
                                          text-surface-400 group-focus-within:text-primary-500 
                                          w-5 h-5 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className="input-field pl-11 pr-11"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 
                               hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-surface-400 mt-1.5">
                  Default: last 3 digits of your Student ID
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 
                             border border-red-200 dark:border-red-800/50 
                             text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3"
                >
                  <span className="shrink-0">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </motion.button>
            </form>

            {/* Demo credentials dropdown */}
            <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-800">
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400 text-center mb-3">
                Demo Credentials
              </p>
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [id, pw] = e.target.value.split('|');
                  setIdentifier(id);
                  setPassword(pw);
                  e.target.value = '';
                }}
                defaultValue=""
                className="input-field text-sm"
              >
                <option value="">Select an account to auto-fill...</option>
                <optgroup label="Admin">
                  <option value="admin@skillswap.edu|admin123">Admin — admin@skillswap.edu</option>
                </optgroup>
                <optgroup label="Students (with schedule)">
                  <option value="23063670|670">Simone Makinano — 23063670</option>
                  <option value="23063671|671">Marco Villanueva — 23063671</option>
                  <option value="23063672|672">Angela Tan — 23063672</option>
                  <option value="23063673|673">Kyle Reyes — 23063673</option>
                </optgroup>
                <optgroup label="Students (seeded)">
                  <option value="202400001|001">Juan Dela Cruz — 202400001</option>
                  <option value="202300001|001">Carlos Mendoza — 202300001</option>
                  <option value="202200001|001">Luisa Torres — 202200001 (Tutor)</option>
                  <option value="202100001|001">Diego Flores — 202100001 (Tutor)</option>
                </optgroup>
              </select>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
