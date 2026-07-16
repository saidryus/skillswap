import { motion } from 'framer-motion';
import Modal from './Modal';
import { HiExclamation } from 'react-icons/hi';

/**
 * Reusable confirmation modal to replace browser confirm() dialogs.
 */
export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmStyle = 'btn-danger', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Action'}>
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
            <HiExclamation className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm text-surface-600 dark:text-surface-300 pt-2">
            {message || 'Are you sure you want to proceed?'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            disabled={loading}
            className={`${confirmStyle} flex-1 flex items-center justify-center gap-2`}
          >
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {confirmText}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
