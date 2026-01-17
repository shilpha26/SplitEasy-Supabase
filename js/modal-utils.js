// Modal Utilities - Replace prompt/confirm with accessible modals
(function() {
    'use strict';
    
    const ModalUtils = {
        // Create a simple prompt modal
        prompt: function(message, defaultValue = '', options = {}) {
            return new Promise((resolve) => {
                const modal = DOMUtils.create('div', {
                    className: 'modal',
                    style: 'display: flex; align-items: center; justify-content: center; z-index: 10000;'
                });
                
                const modalContent = DOMUtils.create('div', {
                    className: 'modal-content',
                    style: 'max-width: 400px; width: 90%;'
                });
                
                const modalBody = DOMUtils.create('div', { className: 'modal-body' });
                
                // Message
                const messageEl = DOMUtils.create('p', {}, message);
                modalBody.appendChild(messageEl);
                
                // Input
                const input = DOMUtils.create('input', {
                    type: 'text',
                    className: 'form-control',
                    style: 'width: 100%; margin-top: 1rem;',
                    value: defaultValue
                });
                input.setAttribute('aria-label', 'Input value');
                modalBody.appendChild(input);
                
                // Buttons
                const modalFooter = DOMUtils.create('div', {
                    className: 'modal-footer',
                    style: 'display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;'
                });
                
                const cancelBtn = DOMUtils.create('button', {
                    type: 'button',
                    className: 'btn-secondary'
                }, 'Cancel');
                cancelBtn.setAttribute('aria-label', 'Cancel');
                
                const confirmBtn = DOMUtils.create('button', {
                    type: 'button',
                    className: 'btn-success'
                }, options.confirmText || 'OK');
                confirmBtn.setAttribute('aria-label', 'Confirm');
                
                modalFooter.appendChild(cancelBtn);
                modalFooter.appendChild(confirmBtn);
                
                modalContent.appendChild(modalBody);
                modalContent.appendChild(modalFooter);
                modal.appendChild(modalContent);
                
                document.body.appendChild(modal);
                
                // Focus management
                setTimeout(() => input.focus(), 100);
                DOMUtils.trapFocus(modal);
                
                // Event handlers
                const cleanup = () => {
                    document.body.removeChild(modal);
                };
                
                const handleConfirm = () => {
                    const value = input.value.trim();
                    cleanup();
                    resolve(value || null);
                };
                
                const handleCancel = () => {
                    cleanup();
                    resolve(null);
                };
                
                confirmBtn.addEventListener('click', handleConfirm);
                cancelBtn.addEventListener('click', handleCancel);
                
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirm();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancel();
                    }
                });
                
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        handleCancel();
                    }
                });
            });
        },
        
        // Create a simple confirm modal
        confirm: function(message, options = {}) {
            return new Promise((resolve) => {
                const modal = DOMUtils.create('div', {
                    className: 'modal',
                    style: 'display: flex; align-items: center; justify-content: center; z-index: 10000;'
                });
                
                const modalContent = DOMUtils.create('div', {
                    className: 'modal-content',
                    style: 'max-width: 400px; width: 90%;'
                });
                
                const modalBody = DOMUtils.create('div', { className: 'modal-body' });
                
                // Message
                const messageEl = DOMUtils.create('p', {}, message);
                modalBody.appendChild(messageEl);
                
                // Buttons
                const modalFooter = DOMUtils.create('div', {
                    className: 'modal-footer',
                    style: 'display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;'
                });
                
                const cancelBtn = DOMUtils.create('button', {
                    type: 'button',
                    className: 'btn-secondary'
                }, options.cancelText || 'Cancel');
                cancelBtn.setAttribute('aria-label', 'Cancel');
                
                const confirmBtn = DOMUtils.create('button', {
                    type: 'button',
                    className: options.danger ? 'btn-danger' : 'btn-success'
                }, options.confirmText || 'Confirm');
                confirmBtn.setAttribute('aria-label', 'Confirm');
                
                modalFooter.appendChild(cancelBtn);
                modalFooter.appendChild(confirmBtn);
                
                modalContent.appendChild(modalBody);
                modalContent.appendChild(modalFooter);
                modal.appendChild(modalContent);
                
                document.body.appendChild(modal);
                
                // Focus management
                setTimeout(() => confirmBtn.focus(), 100);
                DOMUtils.trapFocus(modal);
                
                // Event handlers
                const cleanup = () => {
                    document.body.removeChild(modal);
                };
                
                const handleConfirm = () => {
                    cleanup();
                    resolve(true);
                };
                
                const handleCancel = () => {
                    cleanup();
                    resolve(false);
                };
                
                confirmBtn.addEventListener('click', handleConfirm);
                cancelBtn.addEventListener('click', handleCancel);
                
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        handleCancel();
                    }
                });
            });
        }
    };
    
    // Make globally available
    window.ModalUtils = ModalUtils;
    
    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ModalUtils;
    }
})();

