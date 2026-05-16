import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="glass-panel w-full max-w-md p-8 shadow-2xl border border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
      
      <button 
        onClick={onCancel}
        className="absolute top-4 right-4 text-textMuted hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">{title}</h2>
          <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Confirmation Required</p>
        </div>
      </div>

      <p className="text-textMuted text-sm leading-relaxed mb-8 font-medium">
        {message}
      </p>

      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-6 rounded-xl bg-white/5 text-white font-bold text-xs hover:bg-white/10 transition-all border border-white/10"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 px-6 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]"
        >
          {confirmText}
        </button>
      </div>
    </motion.div>
  );
};

export default ConfirmModal;
