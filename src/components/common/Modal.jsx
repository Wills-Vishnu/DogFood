import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-lg shadow-xl ${sizes[size]} w-full mx-4 max-h-[90vh] overflow-y-auto ${className}`}
      >
        <div className="flex items-center justify-between px-lg py-lg border-b border-brand-200">
          <h2 className="text-xl font-semibold text-brand-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-brand-500 hover:text-brand-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-lg py-lg">{children}</div>

        {actions && (
          <div className="px-lg py-lg border-t border-brand-200 bg-brand-50 rounded-b-lg flex items-center justify-end gap-md">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    actions={
      <>
        <Button variant="secondary" onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          variant={isDangerous ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </Button>
      </>
    }
  >
    <p className="text-brand-700">{message}</p>
  </Modal>
);
