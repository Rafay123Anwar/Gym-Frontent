import { create } from 'zustand';

type ModalType = 'success' | 'error' | 'info' | 'warning';

interface ModalState {
  isOpen: boolean;
  type: 'confirm' | 'alert';
  title: string;
  message: string;
  alertType?: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  
  showConfirm: (params: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  
  showAlert: (params: {
    title: string;
    message: string;
    type?: ModalType;
  }) => void;
  
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  alertType: 'info',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  
  showConfirm: (params) => set({
    isOpen: true,
    type: 'confirm',
    title: params.title,
    message: params.message,
    confirmText: params.confirmText || 'Confirm',
    cancelText: params.cancelText || 'Cancel',
    onConfirm: params.onConfirm,
    onCancel: params.onCancel,
  }),
  
  showAlert: (params) => set({
    isOpen: true,
    type: 'alert',
    title: params.title,
    message: params.message,
    alertType: params.type || 'info',
  }),
  
  closeModal: () => set({ isOpen: false }),
}));
