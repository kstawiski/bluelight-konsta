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
  timeouts: new Map(), // Store timeout IDs for cleanup

  init() {
    this.container = document.getElementById('toastContainer');
    if (!this.container) {
      console.warn('ToastManager: toastContainer element not found');
      return false;
    }
    return true;
  },

  show(options) {
    if (!this.container) {
      console.warn('ToastManager not initialized');
      return null;
    }

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

    // Build toast DOM structure safely
    const iconDiv = document.createElement('div');
    iconDiv.className = 'toast-icon';
    iconDiv.textContent = toastIcon;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'toast-content';

    if (title) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'toast-title';
      titleDiv.textContent = title;
      contentDiv.appendChild(titleDiv);
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'toast-message';
    messageDiv.textContent = message;
    contentDiv.appendChild(messageDiv);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.textContent = '✕';

    toast.appendChild(iconDiv);
    toast.appendChild(contentDiv);
    toast.appendChild(closeBtn);
    closeBtn.onclick = () => {
      // Clear the auto-dismiss timeout when manually closed
      if (this.timeouts.has(toast)) {
        clearTimeout(this.timeouts.get(toast));
        this.timeouts.delete(toast);
      }
      this.remove(toast);
    };

    this.container.appendChild(toast);
    this.toasts.push(toast);

    if (duration > 0) {
      const timeoutId = setTimeout(() => this.remove(toast), duration);
      this.timeouts.set(toast, timeoutId);
    }

    return toast;
  },

  remove(toast) {
    // Clear timeout if exists
    if (this.timeouts.has(toast)) {
      clearTimeout(this.timeouts.get(toast));
      this.timeouts.delete(toast);
    }

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
    if (!this.overlay) {
      console.warn('DropOverlayManager: dropOverlay element not found');
      return false;
    }

    // Prevent default drag behaviors
    document.addEventListener('dragenter', (e) => this.handleDragEnter(e));
    document.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => this.handleDrop(e));
    return true;
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

    if (!this.overlay || !this.titleEl || !this.messageEl || !this.progressBarEl || !this.statsEl) {
      console.warn('LoadingManager: One or more required elements not found');
      return false;
    }
    return true;
  },

  show(title = 'Processing...', message = 'Please wait') {
    if (!this.overlay || !this.titleEl || !this.messageEl || !this.progressBarEl || !this.statsEl) {
      console.error('LoadingManager: Cannot show - not properly initialized');
      return;
    }
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
    'openFile': { text: 'Open DICOM files, images, or archives', shortcut: 'O' },
    'MouseOperation': { text: 'Pan image and adjust zoom level', shortcut: null },
    'b_Scroll': { text: 'Scroll through image slices', shortcut: null },
    'SplitWindow': { text: 'Change viewport layout (1-up, 2×2, 3×3, 4×4)', shortcut: '1-4' },
    'horizontal_flip': { text: 'Flip image horizontally (mirror left-right)', shortcut: null },
    'vertical_flip': { text: 'Flip image vertically (mirror top-bottom)', shortcut: null },
    'MouseRotate': { text: 'Rotate image 90° clockwise', shortcut: null },
    'WindowRevision': { text: 'Adjust window center and width for contrast', shortcut: null },
    'zoom': { text: 'Magnifying glass for detailed inspection', shortcut: null },
    'color_invert': { text: 'Invert grayscale colors (negative image)', shortcut: 'I' },
    'unlink': { text: 'Toggle synchronization across viewports', shortcut: 'L' },
    'resetImg': { text: 'Reset image to original view state', shortcut: 'R' },
    'MeasureRuler': { text: 'Measure linear distance between two points', shortcut: null },
    'AngleRuler': { text: 'Measure angle between three points', shortcut: null },
    'playvideo': { text: 'Play cine loop animation of image series', shortcut: 'Space' },
    'MarkButton': { text: 'Toggle display of ROI structures and annotations', shortcut: null },
    'downloadDcm': { text: 'Export current series as DICOM files', shortcut: null },
    'downloadImg': { text: 'Export current view as image (PNG/JPG)', shortcut: null },
    'Rotate_0': { text: 'Reset rotation to 0° (original orientation)', shortcut: null },
    'Rotate_90': { text: 'Rotate image 90° clockwise', shortcut: null },
    'Rotate_i90': { text: 'Rotate image 90° counter-clockwise', shortcut: null },
    'removeAllRuler': { text: 'Remove all measurements and annotations', shortcut: null },
    'removeRuler': { text: 'Remove selected measurement', shortcut: null },
    'eraseRuler': { text: 'Erase measurements with eraser tool', shortcut: null },
    'AngleRuler2': { text: 'Measure Cobb angle (spinal curvature)', shortcut: null },
    'RectRuler': { text: 'Draw rectangle ROI and measure area', shortcut: null },
    'CircleRuler': { text: 'Draw circular ROI and measure area', shortcut: null },
    'IrregularRuler': { text: 'Draw freehand irregular ROI shape', shortcut: null },
    'ArrowRuler': { text: 'Place directional arrow annotation', shortcut: null },
    'TextAnnotation': { text: 'Add text annotation to image', shortcut: null },
    'clearviewportImg': { text: 'Clear all images from current viewport', shortcut: null },
    'TrueSizeImg': { text: 'Display image at true physical size (1:1)', shortcut: null },
    'annotation': { text: 'Toggle DICOM metadata overlay', shortcut: null },
    'openMeasureImg': { text: 'Open measurement and annotation tools', shortcut: null },
    'openTransformationsImg': { text: 'Open image transformation tools', shortcut: null },
    'OtherImg': { text: 'Additional tools and export options', shortcut: null },
    // RTSS tooltips
    'writeRTSS': { text: 'Create RT Structure Set (RTSS) contours', shortcut: null },
    'drawRTSS': { text: 'Draw RT Structure Set contours', shortcut: null },
    'eraseRTSS': { text: 'Erase RTSS contour segments', shortcut: null },
    'exitRTSS': { text: 'Exit RTSS editing mode', shortcut: null },
    'saveRTSS': { text: 'Export as DICOM RT Structure Set', shortcut: null },
    // SEG tooltips
    'writeSEG': { text: 'Create DICOM Segmentation (SEG)', shortcut: null },
    'drawSEG': { text: 'Draw DICOM-SEG segmentation with brush', shortcut: null },
    'eraseSEG': { text: 'Erase segmentation pixels with eraser', shortcut: null },
    'fillSEG': { text: 'Fill enclosed region with segmentation', shortcut: null },
    'UndoSEG': { text: 'Undo last segmentation action', shortcut: null },
    'RedoSEG': { text: 'Redo segmentation action', shortcut: null },
    'exitSEG': { text: 'Exit DICOM-SEG editing mode', shortcut: null },
    'saveSEG': { text: 'Export as DICOM Segmentation object', shortcut: null },
    // GSPS tooltips
    'writeGSPS': { text: 'Create DICOM Grayscale Presentation State (GSPS)', shortcut: null },
    'drawGSPS': { text: 'Draw GSPS graphic annotations', shortcut: null },
    'eraseGSPS': { text: 'Erase GSPS annotation graphics', shortcut: null },
    'exitGSPS': { text: 'Exit GSPS annotation mode', shortcut: null },
    'saveGSPS': { text: 'Export as DICOM Grayscale Softcopy Presentation State', shortcut: null },
    // XML tooltips
    'writeXML': { text: 'Create XML-based custom annotations', shortcut: null },
    'drawXML': { text: 'Draw XML-based custom annotations', shortcut: null },
    'eraseXML': { text: 'Erase XML annotation graphics', shortcut: null },
    'exitXML': { text: 'Exit XML annotation mode', shortcut: null },
    'saveXML': { text: 'Export annotations as XML format', shortcut: null },
    'MarkupDrawerImg': { text: 'Open annotation and segmentation tools (RTSS/SEG/GSPS/XML)', shortcut: null }
  },

  init() {
    this.tooltip = document.getElementById('modernTooltip');
    if (!this.tooltip) {
      console.warn('TooltipManager: modernTooltip element not found');
      return false;
    }

    // Add hover listeners to all icons
    Object.keys(this.tooltips).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('mouseenter', (e) => this.show(e, id));
        element.addEventListener('mouseleave', () => this.hide());
      }
    });
    return true;
  },

  show(event, elementId) {
    const tooltipData = this.tooltips[elementId];
    if (!tooltipData) return;

    clearTimeout(this.hideTimeout);

    const rect = event.target.getBoundingClientRect();
    
    // Clear previous tooltip content
    this.tooltip.textContent = tooltipData.text;

    if (tooltipData.shortcut) {
      const shortcutSpan = document.createElement('span');
      shortcutSpan.className = 'tooltip-shortcut';
      shortcutSpan.textContent = tooltipData.shortcut;
      this.tooltip.appendChild(document.createTextNode(' '));
      this.tooltip.appendChild(shortcutSpan);
    }

    // Position tooltip above element
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

    if (!this.overlayEl || !this.closeBtn) {
      console.warn('KeyboardShortcuts: Required elements not found');
      return false;
    }

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
    
    // Keyboard navigation for close button
    this.closeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.hideHelp();
      }
    });

    // Click outside to close
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.hideHelp();
      }
    });

    return true;
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
    // Try to find and click the appropriate split screen layout button
    // Assume buttons have IDs like 'SplitWindow-1', 'SplitWindow-4', 'SplitWindow-9', 'SplitWindow-16'
    const validCounts = [1, 4, 9, 16];
    if (!validCounts.includes(count)) {
      console.warn(`Split screen layout for count=${count} not supported.`);
      return;
    }
    const layoutBtn = document.getElementById(`SplitWindow-${count}`);
    if (layoutBtn) {
      layoutBtn.click();
    } else {
      // Fallback: click the main split button if specific layout button not found
      const splitBtn = document.getElementById('SplitWindow');
      if (splitBtn) {
        splitBtn.click();
        console.warn(`Specific split layout button 'SplitWindow-${count}' not found. Default split button clicked.`);
      } else {
        console.warn('Split screen button not found.');
      }
    }
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
