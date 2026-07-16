import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiUpload } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', code: '', description: '', isActive: true };

// Parse a single CSV line handling quoted fields (commas inside quotes)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [importText, setImportText] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data);
    } catch { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const openCreate = () => { setEditDept(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (d) => { setEditDept(d); setForm({ ...d }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editDept) {
        await api.put(`/departments/${editDept._id}`, form);
        toast.success('Department updated');
      } else {
        await api.post('/departments', form);
        toast.success('Department created');
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted');
      setDeleteConfirm(null);
      fetchDepartments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleImport = async () => {
    if (!importText.trim()) { toast.error('Paste CSV data first'); return; }
    setImportLoading(true);
    try {
      const lines = importText.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
      const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
      const rows = lines.slice(1).map(line => {
        const vals = parseCSVLine(line).map(v => v.trim());
        return headers.reduce((obj, h, i) => { obj[h] = vals[i] || ''; return obj; }, {});
      }).filter(r => r.name || r.code);

      if (rows.length === 0) { toast.error('No valid rows found. Check your CSV format.'); setImportLoading(false); return; }

      const { data } = await api.post('/departments/import', rows);
      toast.success(`Imported: ${data.created} created, ${data.skipped} skipped${data.errors.length ? `, ${data.errors.length} errors` : ''}`);
      if (data.errors.length) {
        data.errors.slice(0, 3).forEach(e => toast.error(`${e.row}: ${e.reason}`));
      }
      setImportOpen(false);
      setImportText('');
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally { setImportLoading(false); }
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Manage academic departments"
        action={
          <div className="flex gap-2">
            <button onClick={() => setImportOpen(true)} className="btn-secondary flex items-center gap-2">
              <HiUpload className="w-4 h-4" /> Bulk Import
            </button>
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <HiPlus className="w-4 h-4" /> Add Department
            </button>
          </div>
        }
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="table-header">Code</th>
                <th className="table-header">Department Name</th>
                <th className="table-header">Description</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-surface-500 dark:text-surface-400">Loading...</td></tr>
              ) : departments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-surface-500 dark:text-surface-400">No departments found. Add one to get started.</td></tr>
              ) : (
                departments.map(d => (
                  <motion.tr key={d._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="table-cell font-mono text-blue-400 font-semibold">{d.code}</td>
                    <td className="table-cell text-surface-900 dark:text-surface-100 font-medium">{d.name}</td>
                    <td className="table-cell text-surface-500 dark:text-surface-400 text-sm">{d.description || '—'}</td>
                    <td className="table-cell">
                      <span className={`badge ${d.isActive ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                        {d.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(d)} className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(d)} className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editDept ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department Code</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field font-mono uppercase" required placeholder="BSIT" />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })} className="input-field">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Department Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required placeholder="e.g. Computer Studies" />
          </div>
          <div>
            <label className="label">Description</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Optional description" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editDept ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal isOpen={importOpen} onClose={() => { setImportOpen(false); setImportText(''); }} title="Bulk Import Departments">
        <div className="space-y-4">
          <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3 text-xs text-surface-500 dark:text-surface-400 space-y-1">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-surface-700 dark:text-surface-300">Expected CSV format:</p>
              <button
                onClick={() => {
                  const header = 'code,name,description';
                  const sample = 'BSIT,Information Technology,"College of Computer Studies — BSIT Program"\nBSCS,Computer Science,"College of Computer Studies — BSCS Program"\nBSN,College of Nursing,"Bachelor of Science in Nursing"';
                  const blob = new Blob([`${header}\n${sample}`], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'departments_import_template.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <HiUpload className="w-3 h-3 rotate-180" /> Download Template
              </button>
            </div>
            <p className="font-mono text-xs break-all">code,name,description</p>
            <p className="font-mono text-xs text-surface-400 dark:text-surface-500 break-all">BSIT,Information Technology,College of Computer Studies</p>
            <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">code and name are required. Wrap descriptions with commas in quotes.</p>
          </div>
          <div>
            <label className="label">Upload CSV file or paste data</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-2"
                onClick={() => document.getElementById('csvDeptFileInput').click()}
              >
                📄 Choose CSV File
              </button>
              <input
                id="csvDeptFileInput"
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => setImportText(ev.target.result);
                  reader.readAsText(file);
                  e.target.value = '';
                }}
              />
              <span className="text-xs text-surface-400 self-center">or paste below</span>
            </div>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="input-field font-mono text-xs"
              rows={6}
              placeholder="code,name,description&#10;BSIT,Information Technology,College of Computer Studies"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setImportOpen(false); setImportText(''); }} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleImport} disabled={importLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {importLoading
                ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                : <HiUpload className="w-4 h-4" />}
              Import
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm?._id)}
        title="Delete Department"
        message={deleteConfirm ? `Delete department "${deleteConfirm.name}" (${deleteConfirm.code})? This cannot be undone.` : ''}
        confirmText="Delete Department"
      />
    </div>
  );
}