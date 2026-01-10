/**
 * Dropdown Component - Application Starter Kit
 * Toggle dropdown menus
 * Version: 2.0
 */

const Dropdown = {
  init() {
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('.dropdown-toggle');
      
      if (toggle) {
        e.preventDefault();
        const dropdown = toggle.closest('.dropdown');
        const isActive = dropdown.classList.contains('active');
        
        this.closeAll();
        
        if (!isActive) {
          dropdown.classList.add('active');
        }
      } else if (!e.target.closest('.dropdown-menu')) {
        this.closeAll();
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAll();
      }
    });
  },
  
  closeAll() {
    document.querySelectorAll('.dropdown.active').forEach(d => {
      d.classList.remove('active');
    });
  },
  
  open(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
      this.closeAll();
      dropdown.classList.add('active');
    }
  },
  
  close(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
      dropdown.classList.remove('active');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Dropdown.init();
});

window.Dropdown = Dropdown;
