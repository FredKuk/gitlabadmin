// src/components/Modal.tsx

import React from "react";
import "./Modal.scss";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string; // className prop 추가
}

const LicenseModal: React.FC<ModalProps> = ({ isOpen, title, onClose, children, className = "" }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="license-modal-overlay" onClick={onClose}>
      {/* className prop을 modal-content에 적용 */}
      <div className={`modal-content ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default LicenseModal;