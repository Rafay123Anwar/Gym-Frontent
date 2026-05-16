import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

type ModalType = 'success' | 'error' | 'info' | 'warning';

interface AlertModalProps {
  title: string;
  message: string;
  type: ModalType;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  title,
  message,
  type,
  onClose,
}) => {
  const config = {
    success: {
      icon: CheckCircle2,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
    },
    error: {
      icon: XCircle,
      color: 'red',
      gradient: 'from-red-500 to-rose-500',
    },
    warning: {
      icon: AlertCircle,
      color: 'orange',
      gradient: 'from-orange-500 to-amber-500',
    },
    info: {
      icon: Info,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-500',
    },
  };

  const { icon: Icon, color, gradient } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="glass-panel w-full max-w-md p-8 shadow-2xl border border-white/10 relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`} />
      
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-textMuted hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center border border-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">{title}</h2>
          <p className={`text-[10px] text-${color}-500 font-bold uppercase tracking-widest`}>{type} Notification</p>
        </div>
      </div>

      <p className="text-textMuted text-sm leading-relaxed mb-8 font-medium">
        {message}
      </p>

      <button
        onClick={onClose}
        className={`w-full py-3 px-6 rounded-xl bg-${color}-500 text-white font-bold text-xs hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)]`}
      >
        Close
      </button>
    </motion.div>
  );
};

export default AlertModal;
