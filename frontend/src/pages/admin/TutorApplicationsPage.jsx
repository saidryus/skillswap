import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiCheck, HiX, HiEye, HiSearch, HiClipboardList, HiLockClosed, HiDocumentText, HiPencil } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import ConfidenceBadge from '../../components/ConfidenceBadge';
import Modal from '../../components/Modal';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLES = {
  pending:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-300 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  resubmit: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

export default function TutorApplicationsPage() {
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch]             = useState('');

  // Action modals
  const [reviewModal, setReviewModal] = useState(null);
  const [adminNotes, setAdminNotes]   = useState('');
  const [gradeInput, setGradeInput]   = useState('');
  const [rejectMode, setRejectMode]   = useState(false);
  const [docModal, setDocModal]       = useState(null);
  const [analysisModal, setAnalysisModal] = useState(null);
  const [pdfUrl, setPdfUrl]           = useState(null);
  const [pdfLoading, setPdfLoading]   = useState(false);

  // ── ML Correction state ──────────────────────────────────────
  const [correctionModal, setCorrectionModal]   = useState(null); // the profile being corrected
  const [corrStrength, setCorrStrength]         = useState('');
  const [corrSubjects, setCorrSubjects]         = useState('');
  const [corrSoftSkills, setCorrSoftSkills]     = useState('');
  const [corrNotes, setCorrNotes]               = useState('');
  const [corrLoading, setCorrLoading]           = useState(false);

  // ── Page-level session gate ──────────────────────────────────
  // One password unlock gates every action on this page.
  const [sessionToken, setSessionToken]         = useState(null);
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(0);
  const [sessionPassword, setSessionPassword]   = useState('');
  const [sessionAuthLoading, setSessionAuthLoading] = useState(false);
  const [sessionAuthError, setSessionAuthError] = useState('');
  // What triggered the auth prompt — run it after unlock
  const [pendingAction, setPendingAction]       = useState(null);
  const sessionTimerRef  = useRef(null);
  const countdownRef     = useRef(null);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/tutor-profiles');
      setApplications(data);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApplications(); }, []);

  useEffect(() => {
    let result = applications;
    if (statusFilter) result = result.filter(a => a.status === statusFilter);
    if (search) result = result.filter(a =>
      `${a.tutor?.firstName} ${a.tutor?.lastName} ${a.course?.courseCode}`
        .toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [applications, statusFilter, search]);

  const counts = {
    pending:  applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  // ── Session helpers ──────────────────────────────────────────

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startCountdown = (expiresAt) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSessionSecondsLeft(left);
      if (left === 0) clearInterval(countdownRef.current);
    }, 1000);
  };

  const expireSession = () => {
    setSessionToken(null);
    setSessionSecondsLeft(0);
    if (pdfUrl?.url) URL.revokeObjectURL(pdfUrl.url);
    setPdfUrl(null);
    setDocModal(null);
    setAnalysisModal(null);
    setReviewModal(null);
    toast('Session expired. Re-authenticate to continue.', { icon: '🔒' });
  };

  // Authenticate and then run the pending action
  const handleSessionAuth = async (e) => {
    e.preventDefault();
    setSessionAuthLoading(true);
    setSessionAuthError('');
    try {
      const { data } = await api.post('/tutor-profiles/doc-access', { password: sessionPassword });
      const expiry = Date.now() + data.expiresIn * 1000;
      setSessionToken(data.docToken);
      setSessionSecondsLeft(data.expiresIn);
      setSessionPassword('');

      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = setTimeout(expireSession, data.expiresIn * 1000);
      startCountdown(expiry);

      // Run whatever action was waiting
      if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        action(data.docToken);
      }
    } catch (err) {
      const data = err.response?.data || {};
      if (data.forceLogout) {
        // 3 failed attempts — locked for 3 hours, force logout immediately
        toast.error('Document access locked for 3 hours due to too many failed attempts. You have been logged out.', { duration: 6000 });
        setPendingAction(null);
        setSessionPassword('');
        setTimeout(() => logout(), 1500);
        return;
      }
      if (data.locked) {
        const hrs = data.secondsLeft ? (data.secondsLeft / 3600).toFixed(1) : '3';
        setSessionAuthError(`Account locked. Try again in ${hrs} hour(s).`);
        return;
      }
      const msg = data.attemptsRemaining != null
        ? `${data.message}`
        : (data.message || 'Authentication failed');
      setSessionAuthError(msg);
    } finally {
      setSessionAuthLoading(false);
    }
  };

  // Gate any action behind the session. If session active, run immediately.
  // Otherwise, save the action and show the auth prompt.
  const requireSession = (action) => {
    if (sessionToken) {
      action(sessionToken);
    } else {
      setSessionAuthError('');
      setSessionPassword('');
      setPendingAction(() => action);
    }
  };

  // ── Actions ─────────────────────────────────────────────────

  const handleApprove = async (id) => {
    try {
      await api.put(`/tutor-profiles/${id}/approve`, { adminNotes, grade: gradeInput ? Number(gradeInput) : null });
      toast.success('Application approved');
      setReviewModal(null);
      setAdminNotes('');
      setGradeInput('');
      fetchApplications();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to approve'); }
  };

  const handleReject = async (id) => {
    if (!adminNotes.trim()) { toast.error('Please provide a reason for rejection'); return; }
    try {
      await api.put(`/tutor-profiles/${id}/reject`, { adminNotes });
      toast.success('Application rejected');
      setReviewModal(null);
      setAdminNotes('');
      fetchApplications();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reject'); }
  };

  const loadPdf = async (app, token) => {
    setPdfLoading(true);
    setPdfUrl(null);
    try {
      const stored = JSON.parse(localStorage.getItem('Acadia_user') || '{}');
      const authToken = stored.token || '';
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
      const url = `${baseUrl}/api/tutor-profiles/${app._id}/document?docToken=${token}&token=${authToken}`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to load document');
      }
      const contentType = response.headers.get('Content-Type') || '';
      const blob = await response.blob();
      if (contentType.startsWith('text/plain')) {
        setPdfUrl({ type: 'text', content: await blob.text() });
      } else {
        setPdfUrl({ type: 'pdf', url: URL.createObjectURL(blob) });
      }
    } catch (err) {
      toast.error(err.message || 'Could not load document');
    } finally {
      setPdfLoading(false);
    }
  };

  const openDocModal = (app) => requireSession((token) => {
    setPdfUrl(null);
    setDocModal(app);
    loadPdf(app, token);
  });

  const openAnalysisModal = (app) => requireSession(() => {
    setAnalysisModal(app);
  });

  const openReviewModal = (app, reject = false) => requireSession(() => {
    setReviewModal(app);
    setAdminNotes('');
    setRejectMode(reject);
    setGradeInput(app.grade ? app.grade.toFixed(2) : '');
  });

  const closeDocModal = () => {
    setDocModal(null);
    if (pdfUrl?.url) URL.revokeObjectURL(pdfUrl.url);
    setPdfUrl(null);
  };

  const openCorrectionModal = (app) => {
    const existing = app.mlCorrection;
    setCorrStrength(existing?.correctedStrength || app.aiAnalysis?.recommendationStrength || '');
    setCorrSubjects((existing?.correctedSubjects ?? app.aiAnalysis?.subjectsMentioned ?? []).join(', '));
    setCorrSoftSkills((existing?.correctedSoftSkills ?? app.aiAnalysis?.softSkills ?? []).join(', '));
    setCorrNotes(existing?.correctionNotes || '');
    setCorrectionModal(app);
  };

  const handleSubmitCorrection = async () => {
    if (!correctionModal) return;
    setCorrLoading(true);
    try {
      const payload = {
        correctedStrength: corrStrength || undefined,
        correctedSubjects: corrSubjects ? corrSubjects.split(',').map(s => s.trim()).filter(Boolean) : [],
        correctedSoftSkills: corrSoftSkills ? corrSoftSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        correctionNotes: corrNotes,
      };
      await api.post(`/tutor-profiles/${correctionModal._id}/ml-correction`, payload);
      toast.success('Correction saved — thanks for improving the model!');
      setCorrectionModal(null);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save correction');
    } finally {
      setCorrLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────

  const sessionActive = !!sessionToken;

  return (
    <div>
      <PageHeader title="Tutor Applications" subtitle="Review and approve student tutor applications" />

      {/* ── Session status bar ── */}
      <div className={`mb-4 flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 border text-sm transition-all ${
        sessionActive
          ? sessionSecondsLeft > 60
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          : 'bg-surface-50 dark:bg-surface-800/60 border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400'
      }`}>
        <div className="flex items-center gap-2">
          <HiLockClosed className="w-4 h-4 shrink-0" />
          {sessionActive
            ? <span>Session active — all actions unlocked</span>
            : <span>Actions are locked. Click any action button to authenticate.</span>}
        </div>
        {sessionActive && (
          <span className="font-mono text-xs font-semibold">
            {formatTime(sessionSecondsLeft)}
          </span>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-1">
          {[
            { key: 'pending',  label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
            { key: '',         label: 'All' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${statusFilter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>
              {tab.label}
              {tab.key && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  statusFilter === tab.key
                    ? 'bg-blue-500/50 text-blue-100'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400'
                }`}>{counts[tab.key] || 0}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2" placeholder="Search..." />
        </div>
      </div>

      {/* ── Table ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="table-header">Student</th>
                <th className="table-header">Course</th>
                <th className="table-header">Confidence</th>
                <th className="table-header">Year</th>
                <th className="table-header">Applied</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {loading
                ? <tr><td colSpan={7} className="text-center py-8 text-surface-500 dark:text-surface-400">Loading...</td></tr>
                : filtered.length === 0
                  ? <tr><td colSpan={7} className="text-center py-8 text-surface-500 dark:text-surface-400">No applications found</td></tr>
                  : filtered.map(a => (
                <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-surface-50/50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-semibold">{a.tutor?.firstName?.[0]}{a.tutor?.lastName?.[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{a.tutor?.firstName} {a.tutor?.lastName}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">{a.tutor?.studentIdNumber || a.tutor?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="text-surface-900 dark:text-surface-100 font-mono text-sm">{a.course?.courseCode}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">{a.course?.courseName}</p>
                  </td>
                  <td className="table-cell">
                    {a.confidenceScore ? (
                      <div className="flex flex-col gap-1">
                        <span className={`font-mono text-sm font-bold ${
                          a.confidenceLevel === 'high' ? 'text-emerald-500' :
                          a.confidenceLevel === 'medium' ? 'text-amber-500' : 'text-red-500'
                        }`}>{a.confidenceScore}%</span>
                        <ConfidenceBadge confidence={a.confidenceLevel || 'none'} />
                        <span className={`text-[9px] ${
                          a.aiAnalysis?.analysisMethod === 'ml' ? 'text-blue-400' :
                          a.aiAnalysis?.analysisMethod === 'llm' ? 'text-purple-400' : 'text-surface-400'
                        }`}>
                          {a.aiAnalysis?.analysisMethod === 'ml' ? '🧠 ML' :
                           a.aiAnalysis?.analysisMethod === 'llm' ? '🤖 LLM' : '📋 Rules'}
                        </span>
                      </div>
                    ) : (
                      <ConfidenceBadge confidence={a.gradeDetectionConfidence || a.confidenceLevel || 'none'} />
                    )}
                  </td>
                  <td className="table-cell">{a.tutor?.yearLevel ? `${a.tutor.yearLevel}${['st','nd','rd','th'][a.tutor.yearLevel-1]} Year` : '—'}</td>
                  <td className="table-cell text-xs text-surface-500 dark:text-surface-400">
                    <div>{new Date(a.createdAt).toLocaleDateString()}</div>
                    {a.documentExpiresAt && a.status === 'pending' && !a.documentExpired && (() => {
                      const daysLeft = Math.ceil((new Date(a.documentExpiresAt) - Date.now()) / 86400000);
                      return (
                        <div className={`text-[10px] mt-0.5 font-medium ${
                          daysLeft <= 3 ? 'text-red-400' :
                          daysLeft <= 7 ? 'text-amber-400' :
                          'text-surface-400 dark:text-surface-500'
                        }`}>
                          ⏳ File expires in {daysLeft}d
                        </div>
                      );
                    })()}
                    {a.documentExpired && (
                      <div className="text-[10px] mt-0.5 text-surface-400">📄 File auto-deleted</div>
                    )}
                  </td>
                  <td className="table-cell"><span className={`badge border ${STATUS_STYLES[a.status] || ''}`}>{a.status}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      {/* All buttons show a lock icon when session is inactive */}
                      {(a.recommendationDocument || a.gradeDocument || a.extractedText) && (
                        <button onClick={() => openDocModal(a)}
                          className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View document">
                          <HiEye className="w-4 h-4" />
                        </button>
                      )}
                      {a.confidenceScore != null && (
                        <button onClick={() => openAnalysisModal(a)}
                          className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                          title="View AI Analysis">
                          <HiClipboardList className="w-4 h-4" />
                        </button>
                      )}
                      {a.aiAnalysis?.analysisMethod === 'ml' && (
                        <button onClick={() => openCorrectionModal(a)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            a.mlCorrection?.correctedAt
                              ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                              : 'text-surface-500 dark:text-surface-400 hover:text-amber-400 hover:bg-amber-500/10'
                          }`}
                          title={a.mlCorrection?.correctedAt ? 'Edit ML correction' : 'Correct ML prediction'}>
                          <HiPencil className="w-4 h-4" />
                        </button>
                      )}
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => openReviewModal(a, false)}
                            className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Approve">
                            <HiCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => openReviewModal(a, true)}
                            className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Reject">
                            <HiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>


      {/* ── Session auth modal — shown when any action is triggered without a session ── */}
      <Modal isOpen={!!pendingAction} onClose={() => setPendingAction(null)} title="Authentication Required">
        <form onSubmit={handleSessionAuth} className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <HiLockClosed className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              Re-enter your admin password to unlock this page for 5 minutes.
              All actions — view documents, view analysis, approve, reject — will be available until the session expires.
            </p>
          </div>
          <input
            type="password"
            value={sessionPassword}
            onChange={e => setSessionPassword(e.target.value)}
            className="input-field"
            placeholder="Your password"
            autoComplete="current-password"
            autoFocus
            required
          />
          {sessionAuthError && <p className="text-xs text-red-400">{sessionAuthError}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setPendingAction(null)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={sessionAuthLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {sessionAuthLoading ? 'Verifying…' : 'Unlock Session'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Review / Approve / Reject modal ── */}
      <Modal isOpen={!!reviewModal} onClose={() => { setReviewModal(null); setRejectMode(false); setGradeInput(''); }}
        title={rejectMode ? 'Reject Application' : 'Review Application'}>
        {reviewModal && (
          <div className="space-y-4">
            <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3 space-y-1">
              <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{reviewModal.tutor?.firstName} {reviewModal.tutor?.lastName}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Applying to tutor: <span className="text-surface-800 dark:text-surface-200">{reviewModal.course?.courseCode} — {reviewModal.course?.courseName}</span></p>
            </div>

            {/* Session timer inside modal */}
            {sessionActive && (
              <div className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg border font-mono ${
                sessionSecondsLeft > 60
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                <span>🔓 Session active</span>
                <span>{formatTime(sessionSecondsLeft)}</span>
              </div>
            )}

            {!rejectMode && reviewModal.confidenceScore != null && (
              <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                reviewModal.confidenceLevel === 'high' ? 'bg-emerald-500/10 border-emerald-500/30' :
                reviewModal.confidenceLevel === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-red-500/10 border-red-500/30'
              }`}>
                <span className={`font-mono text-lg font-bold ${
                  reviewModal.confidenceLevel === 'high' ? 'text-emerald-400' :
                  reviewModal.confidenceLevel === 'medium' ? 'text-amber-400' : 'text-red-400'
                }`}>{reviewModal.confidenceScore}%</span>
                <div>
                  <ConfidenceBadge confidence={reviewModal.confidenceLevel || 'none'} />
                  <p className="text-[10px] text-surface-400 mt-0.5">Click the 📋 button in the table to view full analysis</p>
                </div>
              </div>
            )}

            {!rejectMode && (
              <div>
                <label className="label">Student's Grade (optional, for competency ranking)</label>
                <input type="number" value={gradeInput} onChange={e => setGradeInput(e.target.value)}
                  className="input-field" min={1.0} max={3.0} step={0.25}
                  placeholder="e.g. 1.5 (1.0 = highest, 3.0 = passing)" />
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">Used for tutor ranking. Leave blank if not applicable.</p>
              </div>
            )}
            {rejectMode && (
              <div>
                <label className="label">Reason for Rejection (required)</label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                  className="input-field" rows={3} placeholder="Provide a reason for rejecting this application" />
              </div>
            )}
            {!rejectMode && (
              <div>
                <label className="label">Admin Notes (optional)</label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                  className="input-field" rows={2} placeholder="Optional notes" />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setReviewModal(null); setRejectMode(false); setGradeInput(''); }} className="btn-secondary flex-1">Cancel</button>
              {rejectMode ? (
                <button onClick={() => handleReject(reviewModal._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                  <HiX className="w-4 h-4" /> Reject
                </button>
              ) : (
                <button onClick={() => handleApprove(reviewModal._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 transition-colors">
                  <HiCheck className="w-4 h-4" /> Approve
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>


      {/* ── Document viewer modal ── */}
      <Modal isOpen={!!docModal} onClose={closeDocModal} title="Recommendation Letter">
        {docModal && (
          <div className="space-y-3">
            <div className="flex items-center justify-end flex-wrap gap-2">
              {sessionActive && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-mono ${
                  sessionSecondsLeft > 60
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>🔓 {formatTime(sessionSecondsLeft)}</span>
              )}
            </div>

            {pdfLoading && (
              <div className="flex items-center justify-center py-16 text-surface-400 text-sm">Loading document…</div>
            )}
            {!pdfLoading && pdfUrl?.type === 'pdf' && (
              <div className="rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700">
                <iframe src={pdfUrl.url} title="Recommendation Letter" className="w-full" style={{ height: 560, border: 'none' }} />
              </div>
            )}
            {!pdfLoading && pdfUrl?.type === 'text' && (
              <div>
                <div className="flex items-center gap-1.5 mb-2 text-amber-400 text-xs">
                  <HiDocumentText className="w-4 h-4" />
                  Original file was deleted after decision — showing extracted text
                  {docModal?.ocrResult?.redactionCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {docModal.ocrResult.redactionCount} PII item{docModal.ocrResult.redactionCount !== 1 ? 's' : ''} redacted
                    </span>
                  )}
                </div>
                <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-4 overflow-y-auto font-mono text-xs text-surface-700 dark:text-surface-300 whitespace-pre-wrap leading-relaxed" style={{ maxHeight: 480 }}>
                  {pdfUrl.content}
                </div>
              </div>
            )}
            {!pdfLoading && !pdfUrl && (
              <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-8 text-center">
                <p className="text-surface-400 text-sm">Document could not be loaded.</p>
              </div>
            )}

            {/* Audit log */}
            {docModal?.documentAuditLog?.length > 0 && (
              <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-3">
                <p className="text-xs font-bold text-surface-600 dark:text-surface-400 mb-2">Access Log</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {[...docModal.documentAuditLog].reverse().map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] text-surface-500 dark:text-surface-400">
                      <span className={`font-medium ${
                        entry.action === 'viewed' ? 'text-blue-400' :
                        entry.action === 'auto_expired' ? 'text-amber-400' : 'text-surface-400'
                      }`}>
                        {entry.action === 'viewed' ? '👁 Viewed' :
                         entry.action === 'auto_expired' ? '⏳ Auto-expired' : '🗑 Deleted on decision'}
                      </span>
                      <span>{entry.adminName}</span>
                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>


      {/* ── AI Analysis modal ── */}
      <Modal isOpen={!!analysisModal} onClose={() => setAnalysisModal(null)} title="AI Analysis Report">
        {analysisModal && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3 space-y-1">
              <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{analysisModal.tutor?.firstName} {analysisModal.tutor?.lastName}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Course: {analysisModal.course?.courseCode} — {analysisModal.course?.courseName}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`font-mono text-lg font-bold ${
                  analysisModal.confidenceLevel === 'high' ? 'text-emerald-500' :
                  analysisModal.confidenceLevel === 'medium' ? 'text-amber-500' : 'text-red-500'
                }`}>{analysisModal.confidenceScore}%</span>
                <ConfidenceBadge confidence={analysisModal.confidenceLevel || 'none'} />
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  analysisModal.aiAnalysis?.analysisMethod === 'ml' ? 'bg-blue-500/20 text-blue-300' :
                  analysisModal.aiAnalysis?.analysisMethod === 'llm' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-surface-500/20 text-surface-300'
                }`}>
                  {analysisModal.aiAnalysis?.analysisMethod === 'ml' ? '🧠 ML Model' :
                   analysisModal.aiAnalysis?.analysisMethod === 'llm' ? '🤖 LLM' : '📋 Rule-based'}
                </span>
                {sessionActive && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ml-auto ${
                    sessionSecondsLeft > 60
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>🔓 {formatTime(sessionSecondsLeft)}</span>
                )}
              </div>
            </div>

            {analysisModal.confidenceBreakdown && (
              <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                <p className="text-xs font-bold text-surface-700 dark:text-surface-300 mb-3">Why this score?</p>
                <div className="space-y-2">
                  {analysisModal.confidenceBreakdown.recommendationLanguage >= 14 && <p className="text-xs text-emerald-500">✓ Strong recommendation language detected</p>}
                  {analysisModal.confidenceBreakdown.recommendationLanguage > 0 && analysisModal.confidenceBreakdown.recommendationLanguage < 14 && <p className="text-xs text-amber-500">◐ Weak/moderate recommendation language</p>}
                  {analysisModal.confidenceBreakdown.recommendationLanguage === 0 && <p className="text-xs text-red-500">✗ No recommendation language found</p>}
                  {analysisModal.aiAnalysis?.signatureDetected ? <p className="text-xs text-emerald-500">✓ Signature detected in document</p> : <p className="text-xs text-red-500">✗ No signature found</p>}
                  {analysisModal.aiAnalysis?.letterheadDetected ? <p className="text-xs text-emerald-500">✓ Institutional letterhead present</p> : <p className="text-xs text-red-500">✗ No letterhead detected</p>}
                  {analysisModal.aiAnalysis?.studentMentioned ? <p className="text-xs text-emerald-500">✓ Student's name found in letter</p> : <p className="text-xs text-red-500">✗ Student's name not mentioned</p>}
                  {analysisModal.confidenceBreakdown.subjectAlignment >= 12 ? <p className="text-xs text-emerald-500">✓ Subjects align with application</p>
                    : analysisModal.confidenceBreakdown.subjectAlignment > 0 ? <p className="text-xs text-amber-500">◐ Partial subject alignment</p>
                    : <p className="text-xs text-red-500">✗ Subjects don't match application</p>}
                  {analysisModal.confidenceBreakdown.requiredSections > 0 && <p className="text-xs text-emerald-500">✓ Required sections present ({analysisModal.confidenceBreakdown.requiredSections}/10)</p>}
                  {analysisModal.confidenceBreakdown.facultyInformation >= 14 ? <p className="text-xs text-emerald-500">✓ Complete faculty information</p>
                    : analysisModal.confidenceBreakdown.facultyInformation > 0 ? <p className="text-xs text-amber-500">◐ Partial faculty information</p>
                    : <p className="text-xs text-red-500">✗ No faculty information detected</p>}
                  {analysisModal.aiAnalysis?.date ? <p className="text-xs text-emerald-500">✓ Date present in document</p> : <p className="text-xs text-amber-500">◐ No date found in document</p>}
                  {analysisModal.confidenceBreakdown.anomalyPenalty < 0 && <p className="text-xs text-red-500">⚠ {Math.abs(analysisModal.confidenceBreakdown.anomalyPenalty / 5)} anomaly issue{Math.abs(analysisModal.confidenceBreakdown.anomalyPenalty / 5) > 1 ? 's' : ''} detected</p>}
                </div>
              </div>
            )}

            {analysisModal.subjectAlignment?.alignments?.length > 0 && (
              <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-surface-700 dark:text-surface-300">Subject Alignment</p>
                  <span className={`text-sm font-bold font-mono ${
                    analysisModal.subjectAlignment.alignmentPercentage >= 75 ? 'text-emerald-500' :
                    analysisModal.subjectAlignment.alignmentPercentage >= 50 ? 'text-amber-500' : 'text-red-500'
                  }`}>{analysisModal.subjectAlignment.alignmentPercentage}%</span>
                </div>
                <div className="space-y-1.5">
                  {analysisModal.subjectAlignment.alignments.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <span className="text-surface-700 dark:text-surface-300">{a.subject}</span>
                      <span className={a.status === 'matched' ? 'text-emerald-500 font-medium' : a.status === 'uncertain' ? 'text-amber-500' : 'text-red-500'}>
                        {a.status === 'matched' ? '✓ Mentioned' : a.status === 'uncertain' ? '⚠ Uncertain' : '✗ Not Found'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisModal.aiAnalysis?.softSkills?.length > 0 && (
              <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                <p className="text-xs font-bold text-surface-700 dark:text-surface-300 mb-2">Detected Soft Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysisModal.aiAnalysis.softSkills.map(skill => (
                    <span key={skill} className="text-[11px] px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 capitalize">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {analysisModal.aiAnalysis?.anomalies?.length > 0 && (
              <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/10 p-4">
                <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-2">⚠ Anomalies Detected</p>
                <div className="space-y-1">
                  {analysisModal.aiAnalysis.anomalies.map((anomaly, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400">• {anomaly}</p>
                  ))}
                </div>
              </div>
            )}

            {analysisModal.aiAnalysis?.summary && (
              <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                <p className="text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">AI Summary</p>
                <p className="text-xs text-surface-600 dark:text-surface-400">{analysisModal.aiAnalysis.summary}</p>
              </div>
            )}

            <button onClick={() => setAnalysisModal(null)} className="w-full btn-secondary">Close</button>
          </div>
        )}
      </Modal>

      {/* ── ML Correction modal ── */}
      <Modal isOpen={!!correctionModal} onClose={() => setCorrectionModal(null)} title="Correct ML Prediction">
        {correctionModal && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <HiPencil className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                If the ML prediction was wrong, correct it here. Your correction will be exported
                as labelled training data and used to retrain the model — improving future predictions.
              </p>
            </div>

            <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3 space-y-1 text-xs">
              <p className="font-semibold text-surface-900 dark:text-surface-100">
                {correctionModal.tutor?.firstName} {correctionModal.tutor?.lastName}
              </p>
              <p className="text-surface-500 dark:text-surface-400">
                ML predicted: <span className="font-mono text-blue-400 capitalize">
                  {correctionModal.aiAnalysis?.recommendationStrength || 'none'}
                </span>
              </p>
              {correctionModal.mlCorrection?.correctedAt && (
                <p className="text-amber-400">
                  ✓ Previously corrected on {new Date(correctionModal.mlCorrection.correctedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <div>
              <label className="label">Correct Recommendation Strength</label>
              <select value={corrStrength} onChange={e => setCorrStrength(e.target.value)} className="input-field">
                <option value="">— No change —</option>
                <option value="strong">Strong</option>
                <option value="moderate">Moderate</option>
                <option value="weak">Weak</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label className="label">Correct Subjects Mentioned
                <span className="text-surface-400 font-normal ml-1">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={corrSubjects}
                onChange={e => setCorrSubjects(e.target.value)}
                className="input-field"
                placeholder="e.g. Database Systems, Web Development"
              />
            </div>

            <div>
              <label className="label">Correct Soft Skills
                <span className="text-surface-400 font-normal ml-1">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={corrSoftSkills}
                onChange={e => setCorrSoftSkills(e.target.value)}
                className="input-field"
                placeholder="e.g. Communication, Patience"
              />
            </div>

            <div>
              <label className="label">Notes <span className="text-surface-400 font-normal">(optional)</span></label>
              <textarea
                value={corrNotes}
                onChange={e => setCorrNotes(e.target.value)}
                className="input-field"
                rows={2}
                placeholder="e.g. Letter clearly mentions Web Development but ML missed it"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCorrectionModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleSubmitCorrection}
                disabled={corrLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50 transition-colors text-sm font-medium">
                {corrLoading ? 'Saving…' : '💾 Save Correction'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
