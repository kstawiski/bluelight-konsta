/**
 * UI Enhancements for BlueLight DICOM Viewer
 * Modern user interface improvements including toast notifications,
 * drag & drop feedback, loading overlays, tooltips, and keyboard shortcuts
 */

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

const ToastManager = {
  container: null,
  toasts: [],

  init() {
    this.container = document.getElementById('toastContainer');
  },

  show(options) {
    const {
      title = '',
      message = '',
      type = 'info', // info, success, warning, error
      duration = 5000,
      icon = null
    } = options;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const defaultIcons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    const toastIcon = icon || defaultIcons[type];

    toast.innerHTML = `
      <div class="toast-icon">${toastIcon}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">✕</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => this.remove(toast);

    this.container.appendChild(toast);
    this.toasts.push(toast);

    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  },

  remove(toast) {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
        this.toasts = this.toasts.filter(t => t !== toast);
      }
    }, 300);
  },

  success(message, title = 'Success') {
    return this.show({ title, message, type: 'success' });
  },

  error(message, title = 'Error') {
    return this.show({ title, message, type: 'error', duration: 7000 });
  },

  warning(message, title = 'Warning') {
    return this.show({ title, message, type: 'warning' });
  },

  info(message, title = 'Info') {
    return this.show({ title, message, type: 'info' });
  }
};

// ============================================
// DRAG & DROP OVERLAY
// ============================================

const DropOverlayManager = {
  overlay: null,
  dragCounter: 0,

  init() {
    this.overlay = document.getElementById('dropOverlay');

    // Prevent default drag behaviors
    document.addEventListener('dragenter', (e) => this.handleDragEnter(e));
    document.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => this.handleDrop(e));
  },

  handleDragEnter(e) {
    e.preventDefault();
    this.dragCounter++;
    if (this.dragCounter === 1) {
      this.show();
    }
  },

  handleDragLeave(e) {
    e.preventDefault();
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.hide();
    }
  },

  handleDrop(e) {
    this.dragCounter = 0;
    this.hide();
  },

  show() {
    this.overlay.classList.add('active');
  },

  hide() {
    this.overlay.classList.remove('active');
  }
};

// ============================================
// LOADING OVERLAY
// ============================================

const LoadingManager = {
  overlay: null,
  titleEl: null,
  messageEl: null,
  progressBarEl: null,
  statsEl: null,

  init() {
    this.overlay = document.getElementById('loadingOverlay');
    this.titleEl = document.getElementById('loadingTitle');
    this.messageEl = document.getElementById('loadingMessage');
    this.progressBarEl = document.getElementById('loadingProgressBar');
    this.statsEl = document.getElementById('loadingStats');
  },

  show(title = 'Processing...', message = 'Please wait') {
    this.titleEl.textContent = title;
    this.messageEl.textContent = message;
    this.progressBarEl.style.width = '0%';
    this.statsEl.textContent = '';
    this.overlay.classList.add('active');
  },

  hide() {
    this.overlay.classList.remove('active');
  },

  updateProgress(percent, stats = '') {
    this.progressBarEl.style.width = `${percent}%`;
    this.statsEl.textContent = stats;
  },

  updateMessage(message) {
    this.messageEl.textContent = message;
  }
};

// ============================================
// MODERN TOOLTIP SYSTEM
// ============================================

const TooltipManager = {
  tooltip: null,
  currentElement: null,
  hideTimeout: null,

  tooltips: {
    'openFile': { text: 'Open File', shortcut: 'O' },
    'MouseOperation': { text: 'Pan & Zoom', shortcut: null },
    'b_Scroll': { text: 'Scroll Images', shortcut: null },
    'SplitWindow': { text: 'Split Screen Layout', shortcut: '1-4' },
    'horizontal_flip': { text: 'Flip Horizontally', shortcut: null },
    'vertical_flip': { text: 'Flip Vertically', shortcut: null },
    'MouseRotate': { text: 'Rotate Image', shortcut: null },
    'WindowRevision': { text: 'Window Level', shortcut: null },
    'zoom': { text: 'Magnifying Glass', shortcut: null },
    'color_invert': { text: 'Invert Colors', shortcut: 'I' },
    'unlink': { text: 'Toggle Synchronization', shortcut: 'L' },
    'resetImg': { text: 'Reset View', shortcut: 'R' },
    'MeasureRuler': { text: 'Measure Distance', shortcut: null },
    'AngleRuler': { text: 'Measure Angle', shortcut: null },
    'playvideo': { text: 'Cine Playback', shortcut: 'Space' },
    'MarkButton': { text: 'Toggle Annotations', shortcut: null },
    'downloadDcm': { text: 'Download DICOM', shortcut: null },
    'downloadImg': { text: 'Download Image', shortcut: null }
  },

  init() {
    this.tooltip = document.getElementById('modernTooltip');

    // Add hover listeners to all icons
    Object.keys(this.tooltips).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('mouseenter', (e) => this.show(e, id));
        element.addEventListener('mouseleave', () => this.hide());
      }
    });
  },

  show(event, elementId) {
    const tooltipData = this.tooltips[elementId];
    if (!tooltipData) return;

    clearTimeout(this.hideTimeout);

    const rect = event.target.getBoundingClientRect();
    let content = tooltipData.text;

    if (tooltipData.shortcut) {
      content += ` <span class="tooltip-shortcut">${tooltipData.shortcut}</span>`;
    }

    this.tooltip.innerHTML = content;

    // Position tooltip above element
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const left = rect.left + (rect.width / 2);
    const top = rect.top - 10;

    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.transform = 'translate(-50%, -100%)';

    this.tooltip.classList.add('show');
  },

  hide() {
    this.hideTimeout = setTimeout(() => {
      this.tooltip.classList.remove('show');
    }, 100);
  }
};

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

const KeyboardShortcuts = {
  shortcuts: {},
  overlayEl: null,
  closeBtn: null,

  init() {
    this.overlayEl = document.getElementById('shortcutsOverlay');
    this.closeBtn = document.getElementById('shortcutsClose');

    // Define shortcuts
    this.shortcuts = {
      'o': () => this.openFile(),
      'r': () => this.resetView(),
      'i': () => this.invertColors(),
      'l': () => this.toggleSync(),
      '1': () => this.setSplitScreen(1),
      '2': () => this.setSplitScreen(4),
      '3': () => this.setSplitScreen(9),
      '4': () => this.setSplitScreen(16),
      ' ': (e) => this.toggleCine(e),
      '?': () => this.showHelp(),
      'Escape': () => this.hideHelp()
    };

    // Listen for keydown events
    document.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Close button
    this.closeBtn.addEventListener('click', () => this.hideHelp());

    // Click outside to close
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.hideHelp();
      }
    });
  },

  handleKeydown(e) {
    // Ignore if typing in input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = e.key;
    const handler = this.shortcuts[key];

    if (handler) {
      e.preventDefault();
      handler(e);
    }
  },

  openFile() {
    const openFileBtn = document.getElementById('openFile');
    if (openFileBtn) openFileBtn.click();
  },

  resetView() {
    const resetBtn = document.getElementById('resetImg');
    if (resetBtn) resetBtn.click();
  },

  invertColors() {
    const invertBtn = document.getElementById('color_invert');
    if (invertBtn) invertBtn.click();
  },

  toggleSync() {
    const syncBtn = document.getElementById('unlink');
    if (syncBtn) syncBtn.click();
  },

  setSplitScreen(count) {
    // Try to find and click the appropriate split screen button
    const splitBtn = document.getElementById('SplitWindow');
    if (!splitBtn) return;

    // This would need to be integrated with the actual split screen functionality
    // For now, we'll just click the split button
    splitBtn.click();

    // You would need to add logic here to select the specific layout
    // based on the count parameter
  },

  toggleCine(e) {
    const cineBtn = document.getElementById('playvideo');
    if (cineBtn) {
      e.preventDefault();
      cineBtn.click();
    }
  },

  showHelp() {
    this.overlayEl.classList.add('active');
  },

  hideHelp() {
    this.overlayEl.classList.remove('active');
  }
};

// ============================================
// INITIALIZATION
// ============================================

// Initialize all UI enhancements when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUIEnhancements);
} else {
  initUIEnhancements();
}

function initUIEnhancements() {
  ToastManager.init();
  DropOverlayManager.init();
  LoadingManager.init();
  TooltipManager.init();
  KeyboardShortcuts.init();

  // Make managers available globally
  window.ToastManager = ToastManager;
  window.LoadingManager = LoadingManager;
  window.DropOverlayManager = DropOverlayManager;
  window.TooltipManager = TooltipManager;
  window.KeyboardShortcuts = KeyboardShortcuts;

  console.log('✨ UI Enhancements initialized');
}
