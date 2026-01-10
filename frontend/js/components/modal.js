/**
 * Modal Component - Application Starter Kit
 * Dialog/popup management
 * Version: 2.0
 */

const Modal = {
  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      focusable[0].focus();
    }
    
    modal.dispatchEvent(new CustomEvent('modal:open'));
  },
  
  close(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    modal.dispatchEvent(new CustomEvent('modal:close'));
  },
  
  closeAll() {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  },
  
  confirm(options = {}) {
    const {
      title = 'Confirm',
      message = 'Are you sure?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      confirmClass = 'btn-danger',
      onConfirm = () => {},
      onCancel = () => {}
    } = options;
    
    let modal = document.getElementById('modal-confirm');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = 'modal-confirm';
      modal.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title" id="confirm-title"></h2>
            <button class="modal-close" onclick="Modal.close('modal-confirm')">&times;</button>
          </div>
          <div class="modal-body">
            <p id="confirm-message"></p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
            <button class="btn" id="confirm-action">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    
    modal.querySelector('#confirm-title').textContent = title;
    modal.querySelector('#confirm-message').textContent = message;
    modal.querySelector('#confirm-cancel').textContent = cancelText;
    modal.querySelector('#confirm-action').textContent = confirmText;
    modal.querySelector('#confirm-action').className = `btn ${confirmClass}`;
    
    const confirmBtn = modal.querySelector('#confirm-action');
    const cancelBtn = modal.querySelector('#confirm-cancel');
    
    const cleanup = () => {
      confirmBtn.replaceWith(confirmBtn.cloneNode(true));
      cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    };
    
    modal.querySelector('#confirm-action').onclick = () => {
      this.close('modal-confirm');
      cleanup();
      onConfirm();
    };
    
    modal.querySelector('#confirm-cancel').onclick = () => {
      this.close('modal-confirm');
      cleanup();
      onCancel();
    };
    
    this.open('modal-confirm');
  }
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    Modal.closeAll();
  }
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

window.Modal = Modal;
