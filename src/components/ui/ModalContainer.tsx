import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useModalStore } from '../../store/modalStore';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';

const ModalContainer: React.FC = () => {
  const { 
    isOpen, 
    type, 
    title, 
    message, 
    alertType, 
    confirmText, 
    cancelText, 
    onConfirm, 
    onCancel,
    closeModal 
  } = useModalStore();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <div className="relative z-10 w-full max-w-md">
            {type === 'confirm' ? (
              <ConfirmModal
                title={title}
                message={message}
                confirmText={confirmText!}
                cancelText={cancelText!}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            ) : (
              <AlertModal
                title={title}
                message={message}
                type={alertType!}
                onClose={closeModal}
              />
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalContainer;
