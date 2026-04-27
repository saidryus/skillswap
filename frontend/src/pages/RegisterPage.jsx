import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: 'student', department: '', studentId: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      toast.success('Account created!');
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'faculty') navigate('/faculty');
      else navigate('/student');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={64} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>ΤΡΟΦΗ</h1>
          <p className="text-blue-400 text-sm tracking-widest uppercase mb-1" style={{ letterSpacing: '0.2em' }}>Trophe</p>
          <p className="text-slate-400 text-sm">Join Trophe Campus System</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} className="input-field" placeholder="Juan" required />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} className="input-field" placeholder="Dela Cruz" required />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="email@trophe.edu" required />
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="input-field" placeholder="••••••••" required minLength={6} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="input-field">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              <div>
                <label className="label">Department</label>
                <input name="department" value={form.department} onChange={handleChange} className="input-field" placeholder="Computer Science" />
              </div>
            </div>

            {form.role === 'student' && (
              <div>
                <label className="label">Student ID</label>
                <input name="studentId" value={form.studentId} onChange={handleChange} className="input-field" placeholder="STU-2024-001" />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
