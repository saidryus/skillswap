import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheck, HiX, HiEye, HiSearch } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import ConfidenceBadge from '../../components/ConfidenceBadge';
import Modal from '../../components/Modal';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-300 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function TutorApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [reviewModal, setReviewModal] = useState(null); // application object
  const [adminNotes, setAdminNotes] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [docModal, setDocModal] = useState(null); // application for document preview

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
      `${a.tutor?.firstName} ${a.tutor?.lastName} ${a.course?.courseCode}`.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [applications, statusFilter, search]);

  const counts = {
    pending:  applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const handleApprove = async (id) => {
    if (!gradeInput || Number(gradeInput) < 1.0 || Number(gradeInput) > 3.0) {
      toast.error('Please enter the student\'s grade (1.0 to 3.0)');
      return;
    }
    try {
      await api.put(`/tutor-profiles/${id}/approve`, { adminNotes, grade: Number(gradeInput) });
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

  const getDocumentUrl = (app) => {
    if (!app.gradeDocument) return null;
    // Extract relative path from the stored path (handles both forward and back slashes)
    const relativePath = app.gradeDocument.replace(/\\/g, '/').split('uploads/').pop();
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}/uploads/${relativePath}`;
  };

  return (
    <div>
      <PageHeader title="Tutor Applications" subtitle="Review and approve student tutor applications" />

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
                ${statusFilter === tab.key ? 'bg-blue-600 text-white' : 'text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:text-surface-200 hover:bg-surface-100 dark:bg-surface-800'}`}>
              {tab.label}
              {tab.key && <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${statusFilter === tab.key ? 'bg-blue-500/50 text-blue-100' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400'}`}>{counts[tab.key] || 0}</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2" placeholder="Search..." />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="table-header">Student</th>
                <th className="table-header">Course</th>
                <th className="table-header">Grade</th>
                <th className="table-header">Year</th>
                <th className="table-header">Applied</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {loading ? <tr><td colSpan={7} className="text-center py-8 text-surface-500 dark:text-surface-400">Loading...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-surface-500 dark:text-surface-400">No applications found</td></tr>
              : filtered.map(a => (
                <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-surface-50/50 dark:bg-surface-800/50 transition-colors">
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
                    {a.detectedGrade ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-sm font-bold text-surface-900 dark:text-surface-100">{a.detectedGrade.toFixed(2)}</span>
                        <ConfidenceBadge confidence={a.gradeDetectionConfidence || 'none'} />
                      </div>
                    ) : (
                      <ConfidenceBadge confidence={a.gradeDetectionConfidence || 'none'} />
                    )}
                  </td>
                  <td className="table-cell">{a.tutor?.yearLevel ? `${a.tutor.yearLevel}${['st','nd','rd','th'][a.tutor.yearLevel-1]} Year` : '—'}</td>
                  <td className="table-cell text-xs text-surface-500 dark:text-surface-400">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="table-cell"><span className={`badge border ${STATUS_STYLES[a.status]}`}>{a.status}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {a.gradeDocument && (
                        <button onClick={() => setDocModal(a)} className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="View document">
                          <HiEye className="w-4 h-4" />
                        </button>
                      )}
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => { setReviewModal(a); setAdminNotes(''); setRejectMode(false); setGradeInput(a.detectedGrade ? a.detectedGrade.toFixed(2) : ''); }} className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Approve">
                            <HiCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setReviewModal(a); setAdminNotes(''); setRejectMode(true); }} className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Reject">
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

      {/* Review modal */}
      <Modal isOpen={!!reviewModal} onClose={() => { setReviewModal(null); setRejectMode(false); setGradeInput(''); }} title={rejectMode ? 'Reject Application' : 'Approve Application'}>
        {reviewModal && (
          <div className="space-y-4">
            <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3 space-y-1">
              <p className="text-sm text-surface-900 dark:text-surface-100 font-semibold">{reviewModal.tutor?.firstName} {reviewModal.tutor?.lastName}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Applying to tutor: <span className="text-surface-800 dark:text-surface-200">{reviewModal.course?.courseCode} — {reviewModal.course?.courseName}</span></p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Document: <span className="text-surface-800 dark:text-surface-200">{reviewModal.gradeDocumentName || 'Uploaded'}</span></p>
            </div>

            {/* Auto-detected grade banner */}
            {!rejectMode && reviewModal.detectedGrade && (
              <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                <span className="text-lg">🤖</span>
                <div>
                  <p className="text-sm font-medium text-green-300">Grade Auto-Detected</p>
                  <p className="text-xs text-surface-700 dark:text-surface-300 mt-0.5">
                    The system detected a grade of <span className="font-bold text-green-200">{reviewModal.detectedGrade.toFixed(2)}</span> for {reviewModal.course?.courseCode} from the uploaded document.
                  </p>
                  <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
                    <ConfidenceBadge confidence={reviewModal.gradeDetectionConfidence || 'none'} />
                    {reviewModal.gradeDetectionMessage?.includes('ID verified') && (
                      <span className="text-green-400 ml-2">✓ Student ID matched</span>
                    )}
                    {reviewModal.gradeDetectionMessage?.includes('ID was not found') && (
                      <span className="text-yellow-400 ml-2">⚠ Student ID not found in document</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {!rejectMode && !reviewModal.detectedGrade && reviewModal.gradeDetectionMessage && (
              <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-yellow-300">Grade Not Detected</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{reviewModal.gradeDetectionMessage}</p>
                </div>
              </div>
            )}

            {!rejectMode && (
              <div>
                <label className="label">
                  {reviewModal.detectedGrade ? 'Confirm or Correct Grade (1.0 – 3.0)' : 'Student\'s Grade in This Course (1.0 – 3.0)'}
                </label>
                <input
                  type="number"
                  value={gradeInput}
                  onChange={e => setGradeInput(e.target.value)}
                  className="input-field"
                  min={1.0} max={3.0} step={0.25}
                  placeholder={reviewModal.detectedGrade ? reviewModal.detectedGrade.toFixed(2) : 'e.g. 1.5'}
                  required
                />
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">1.0 = highest, 3.0 = minimum passing. Verify against the uploaded document.</p>
              </div>
            )}

            {rejectMode && (
              <div>
                <label className="label">Reason for Rejection (required)</label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="input-field" rows={3} placeholder="Provide a reason for rejecting this application" />
              </div>
            )}

            {!rejectMode && (
              <div>
                <label className="label">Admin Notes (optional)</label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="input-field" rows={2} placeholder="Optional notes" />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setReviewModal(null); setRejectMode(false); setGradeInput(''); }} className="btn-secondary flex-1">Cancel</button>
              {rejectMode ? (
                <button onClick={() => handleReject(reviewModal._id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                  <HiX className="w-4 h-4" /> Reject
                </button>
              ) : (
                <button onClick={() => handleApprove(reviewModal._id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 transition-colors">
                  <HiCheck className="w-4 h-4" /> Approve
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Document preview modal */}
      <Modal isOpen={!!docModal} onClose={() => setDocModal(null)} title="Grade Document">
        {docModal && (
          <div className="space-y-3">
            <p className="text-sm text-surface-500 dark:text-surface-400">Document: <span className="text-surface-800 dark:text-surface-200">{docModal.gradeDocumentName}</span></p>
            <div className="bg-surface-50 dark:bg-surface-800 rounded-lg overflow-hidden" style={{ height: 480 }}>
              {docModal.gradeDocument?.endsWith('.pdf') ? (
                <iframe src={getDocumentUrl(docModal)} className="w-full h-full" title="Grade Document" />
              ) : (
                <img src={getDocumentUrl(docModal)} alt="Grade slip" className="w-full h-full object-contain" />
              )}
            </div>
            <a href={getDocumentUrl(docModal)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">Open in new tab</a>
          </div>
        )}
      </Modal>
    </div>
  );
}
