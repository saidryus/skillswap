import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiUpload, HiDownload, HiExternalLink, HiTrash, HiDocumentText, HiPhotograph, HiLink, HiVideoCamera, HiPlus, HiFilter } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { playSound } from '../../utils/sounds';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  pdf: HiDocumentText,
  powerpoint: HiDocumentText,
  word: HiDocumentText,
  image: HiPhotograph,
  zip: HiDocumentText,
  link: HiLink,
  recording: HiVideoCamera,
};

const TYPE_COLORS = {
  pdf: 'text-red-500',
  powerpoint: 'text-orange-500',
  word: 'text-blue-500',
  image: 'text-emerald-500',
  zip: 'text-purple-500',
  link: 'text-primary-500',
  recording: 'text-pink-500',
};

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [showUpload, setShowUpload] = useState(false);
  const [approvedCourses, setApprovedCourses] = useState([]);
  const fileRef = useRef();

  // Upload form
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', courseId: '', resourceType: 'pdf', externalUrl: '', visibility: 'public' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchResources = async () => {
    try {
      const params = new URLSearchParams();
      if (courseFilter) params.set('courseId', courseFilter);
      if (typeFilter) params.set('type', typeFilter);
      if (sort) params.set('sort', sort);
      const { data } = await api.get(`/materials?${params}`);
      setResources(data);
    } catch { toast.error('Failed to load resources'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchResources(); }, [courseFilter, typeFilter, sort]);

  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourses(data.filter(c => c.isActive)));
    // Get tutor's approved courses (for upload permission)
    if (user.isTutor || user.role === 'admin') {
      api.get('/tutor-profiles/my-applications').then(({ data }) => {
        setApprovedCourses(data.filter(a => a.status === 'approved'));
      }).catch(() => {});
    }
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.courseId || !uploadForm.resourceType) {
      toast.error('Fill in all required fields'); return;
    }
    const isExternal = uploadForm.resourceType === 'link' || uploadForm.resourceType === 'recording';
    if (!isExternal && !uploadFile) { toast.error('Select a file to upload'); return; }
    if (isExternal && !uploadForm.externalUrl) { toast.error('Enter a URL'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('courseId', uploadForm.courseId);
      formData.append('resourceType', uploadForm.resourceType);
      formData.append('visibility', uploadForm.visibility);
      if (isExternal) {
        formData.append('externalUrl', uploadForm.externalUrl);
      } else {
        formData.append('file', uploadFile);
      }

      await api.post('/materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      playSound('success');
      toast.success('Resource uploaded!');
      setShowUpload(false);
      setUploadForm({ title: '', description: '', courseId: '', resourceType: 'pdf', externalUrl: '', visibility: 'public' });
      setUploadFile(null);
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDownload = async (resource) => {
    try {
      if (resource.isExternal) {
        const { data } = await api.get(`/materials/${resource._id}/download`);
        window.open(data.url, '_blank');
      } else {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = JSON.parse(localStorage.getItem('Acadia_user') || '{}').token;
        window.open(`${baseUrl}/materials/${resource._id}/download?token=${token}`, '_blank');
      }
      playSound('pop');
    } catch { toast.error('Download failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success('Resource deleted');
      fetchResources();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = resources.filter(r =>
    `${r.title} ${r.description} ${r.course?.courseCode} ${r.uploader?.firstName}`.toLowerCase().includes(search.toLowerCase())
  );

  const canUpload = user.isTutor || user.role === 'admin';

  return (
    <div>
      <PageHeader title="Resources" subtitle="Learning materials shared by verified tutors" />

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2.5 w-full" placeholder="Search resources..." />
        </div>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="input-field py-2.5 w-44">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.courseCode}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field py-2.5 w-36">
          <option value="">All Types</option>
          <option value="pdf">PDF</option>
          <option value="powerpoint">PowerPoint</option>
          <option value="word">Word</option>
          <option value="image">Image</option>
          <option value="link">Link</option>
          <option value="recording">Recording</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="input-field py-2.5 w-32">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="downloads">Popular</option>
        </select>
        {canUpload && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2 py-2.5">
            <HiPlus className="w-4 h-4" /> Upload
          </motion.button>
        )}
      </div>

      {/* Resources grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <HiDocumentText className="w-12 h-12 text-surface-300 dark:text-surface-600 mb-3" />
          <p className="text-surface-500 dark:text-surface-400">No resources found</p>
          {canUpload && <p className="text-sm text-surface-400 mt-1">Be the first to share materials!</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, idx) => {
            const Icon = TYPE_ICONS[r.resourceType] || HiDocumentText;
            const color = TYPE_COLORS[r.resourceType] || 'text-surface-500';
            const isOwner = r.uploader?._id === user._id;

            return (
              <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                className="card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{r.title}</p>
                    <p className="text-[11px] text-primary-500 font-medium">{r.course?.courseCode}</p>
                  </div>
                </div>

                {r.description && (
                  <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-2">{r.description}</p>
                )}

                <div className="flex items-center justify-between text-[10px] text-surface-400 mt-auto pt-2 border-t border-surface-100 dark:border-surface-800">
                  <span>{r.uploader?.firstName} {r.uploader?.lastName}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-surface-400">
                    {r.fileSize ? formatFileSize(r.fileSize) : r.resourceType}
                    {r.downloadCount > 0 && ` · ${r.downloadCount} downloads`}
                  </span>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleDownload(r)} className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors" title={r.isExternal ? 'Open' : 'Download'}>
                      {r.isExternal ? <HiExternalLink className="w-4 h-4" /> : <HiDownload className="w-4 h-4" />}
                    </button>
                    {(isOwner || user.role === 'admin') && (
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Delete">
                        <HiTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Resource">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} className="input-field" placeholder="e.g. SQL Cheat Sheet" required />
          </div>
          <div>
            <label className="label">Course *</label>
            <select value={uploadForm.courseId} onChange={e => setUploadForm({ ...uploadForm, courseId: e.target.value })} className="input-field" required>
              <option value="">Select course</option>
              {(user.role === 'admin' ? courses : approvedCourses.map(a => a.course)).filter(Boolean).map(c => (
                <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type *</label>
              <select value={uploadForm.resourceType} onChange={e => setUploadForm({ ...uploadForm, resourceType: e.target.value })} className="input-field">
                <option value="pdf">PDF</option>
                <option value="powerpoint">PowerPoint</option>
                <option value="word">Word Document</option>
                <option value="image">Image</option>
                <option value="zip">ZIP Archive</option>
                <option value="link">External Link</option>
                <option value="recording">Recording</option>
              </select>
            </div>
            <div>
              <label className="label">Visibility</label>
              <select value={uploadForm.visibility} onChange={e => setUploadForm({ ...uploadForm, visibility: e.target.value })} className="input-field">
                <option value="public">Public</option>
                <option value="enrolled">Enrolled Only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea value={uploadForm.description} onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })} className="input-field" rows={2} placeholder="Brief description of the resource" />
          </div>

          {(uploadForm.resourceType === 'link' || uploadForm.resourceType === 'recording') ? (
            <div>
              <label className="label">URL *</label>
              <input value={uploadForm.externalUrl} onChange={e => setUploadForm({ ...uploadForm, externalUrl: e.target.value })} className="input-field" placeholder="https://..." required />
            </div>
          ) : (
            <div>
              <label className="label">File *</label>
              <div onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${uploadFile ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' : 'border-surface-300 dark:border-surface-600 hover:border-primary-400'}`}>
                {uploadFile ? (
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">{uploadFile.name} ({formatFileSize(uploadFile.size)})</p>
                ) : (
                  <p className="text-sm text-surface-500">Click to select file · Max 10MB</p>
                )}
              </div>
              <input ref={fileRef} type="file" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="hidden" accept=".pdf,.pptx,.ppt,.docx,.doc,.jpg,.jpeg,.png,.zip" />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowUpload(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={uploading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {uploading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiUpload className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Upload'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

