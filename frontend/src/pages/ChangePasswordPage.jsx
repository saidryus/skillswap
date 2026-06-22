import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLockClosed, HiShieldCheck } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../utils/sounds';
import Logo from '../components/Logo';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      playSound('error');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      playSound('error');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
      playSound('success');
      toast.success('Password changed successfully!');
      login({ ...user, mustChangePassword: false, token: data.token || user.token });
      if (user.role === 'admin') navigate('/admin');
      else navigate('/student/my-schedule');
    } catch (err) {
      playSound('error');
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 
                    bg-surface-50 dark:bg-surface-950 transition-colors">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/50 
                            flex items-center justify-center">
              <HiShieldCheck className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Change Password</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm">
            {user?.mustChangePassword
              ? 'You must change your default password before continuing.'
              : 'Update your account password'}
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Current Password</label>
              <div className="relative group">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 
                                        group-focus-within:text-primary-500 w-5 h-5 transition-colors" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative group">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 
                                        group-focus-within:text-primary-500 w-5 h-5 transition-colors" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-surface-400 mt-1.5">Minimum 6 characters</p>
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative group">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 
                                        group-focus-within:text-primary-500 w-5 h-5 transition-colors" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : 'Update Password'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
