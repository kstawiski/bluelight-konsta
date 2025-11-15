/**
 * Contour Editing Mode Manager
 * Centralized state management for RTSS/SEG/GSPS/XML editing modes
 */

const ContourEditingManager = {
  // Current state
  currentMode: 'VIEW',
  activeROI: null,
  toolSettings: {
    brushSize: 5,
    color: '#00FF00',
    alpha: 0.5,
    activeTool: 'brush' // 'brush' | 'eraser' | 'fill'
  },

  // Mode configuration
  modeConfig: {
    VIEW: {
      borderColor: '#00FF00',
      cursor: 'default',
      name: 'View Mode',
      icon: '👁️'
    },
    RTSS: {
      borderColor: '#FF8C00',
      cursor: 'crosshair',
      name: 'RTSS Editing Mode',
      icon: '📐'
    },
    SEG: {
      borderColor: '#4169E1',
      cursor: 'crosshair',
      name: 'SEG Editing Mode',
      icon: '🖌️'
    },
    GSPS: {
      borderColor: '#9370DB',
      cursor: 'crosshair',
      name: 'GSPS Editing Mode',
      icon: '📝'
    },
    XML: {
      borderColor: '#FFD700',
      cursor: 'crosshair',
      name: 'XML Editing Mode',
      icon: '📄'
    }
  },

  // Event listeners
  listeners: {
    modeChange: [],
    roiChange: [],
    toolChange: []
  },

  /**
   * Initialize the mode manager
   */
  init() {
    console.log('🎯 Contour Editing Mode Manager initialized');

    // Set up viewport container if not exists
    this.setupViewportContainer();

    // Create mode watermark overlay
    this.createModeWatermark();

    // Set initial mode
    this.setMode('VIEW');

    return true;
  },

  /**
   * Set up viewport container for border highlighting
   */
  setupViewportContainer() {
    const dicomPage = document.getElementById('DicomPage');
    if (!dicomPage) {
      console.warn('DicomPage element not found');
      return;
    }

    // Add viewport-container class if not exists
    if (!dicomPage.classList.contains('viewport-container')) {
      dicomPage.classList.add('viewport-container');
    }
  },

  /**
   * Create mode watermark overlay element
   */
  createModeWatermark() {
    if (document.getElementById('modeWatermark')) {
      return; // Already exists
    }

    const watermark = document.createElement('div');
    watermark.id = 'modeWatermark';
    watermark.className = 'mode-watermark';
    watermark.setAttribute('role', 'status');
    watermark.setAttribute('aria-live', 'polite');
    watermark.style.display = 'none';

    watermark.innerHTML = `
      <div class="mode-icon"></div>
      <div class="mode-info">
        <div class="mode-name"></div>
        <div class="roi-name"></div>
      </div>
    `;

    const dicomPage = document.getElementById('DicomPage');
    if (dicomPage) {
      dicomPage.appendChild(watermark);
    }
  },

  /**
   * Set the current editing mode
   * @param {string} mode - 'VIEW' | 'RTSS' | 'SEG' | 'GSPS' | 'XML'
   * @param {Object} options - Optional settings
   */
  setMode(mode, options = {}) {
    if (!this.modeConfig[mode]) {
      console.error(`Invalid mode: ${mode}`);
      return;
    }

    const previousMode = this.currentMode;
    this.currentMode = mode;

    console.log(`🔄 Mode changed: ${previousMode} → ${mode}`);

    // Update viewport border
    this.updateViewportBorder(mode);

    // Update mode watermark
    this.updateModeWatermark(mode);

    // Update cursor
    this.updateCursor(mode);

    // Update active mode button highlighting
    this.updateModeButtonHighlight(mode);

    // Trigger mode change event
    this.triggerEvent('modeChange', { previousMode, currentMode: mode, options });

    return this;
  },

  /**
   * Update viewport border color
   */
  updateViewportBorder(mode) {
    const viewport = document.getElementById('DicomPage');
    if (!viewport) return;

    const config = this.modeConfig[mode];

    // Remove all mode classes
    Object.keys(this.modeConfig).forEach(m => {
      viewport.classList.remove(`mode-${m.toLowerCase()}`);
    });

    // Add current mode class
    viewport.classList.add(`mode-${mode.toLowerCase()}`);

    // Set border color directly
    viewport.style.borderColor = config.borderColor;
  },

  /**
   * Update mode watermark overlay
   */
  updateModeWatermark(mode) {
    const watermark = document.getElementById('modeWatermark');
    if (!watermark) return;

    const config = this.modeConfig[mode];

    // Hide watermark in VIEW mode
    if (mode === 'VIEW') {
      watermark.style.display = 'none';
      return;
    }

    // Update watermark content
    const modeIcon = watermark.querySelector('.mode-icon');
    const modeName = watermark.querySelector('.mode-name');
    const roiName = watermark.querySelector('.roi-name');

    if (modeIcon) modeIcon.textContent = config.icon;
    if (modeName) modeName.textContent = config.name.toUpperCase();

    if (roiName) {
      if (this.activeROI) {
        roiName.textContent = `ROI: ${this.activeROI.name || 'Unknown'}`;
        roiName.style.display = '';
      } else {
        roiName.style.display = 'none';
      }
    }

    // Set mode color
    watermark.style.setProperty('--mode-color', config.borderColor);

    // Show watermark
    watermark.style.display = 'flex';
  },

  /**
   * Update cursor style
   */
  updateCursor(mode) {
    const viewport = document.getElementById('DicomPage');
    if (!viewport) return;

    const config = this.modeConfig[mode];
    viewport.style.cursor = config.cursor;
  },

  /**
   * Update active mode button highlighting
   */
  updateModeButtonHighlight(mode) {
    // Remove active class from all mode buttons
    const modeButtons = ['writeRTSS', 'writeSEG', 'writeGSPS', 'writeXML'];
    modeButtons.forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.classList.remove('mode-button-active');
      }
    });

    // Add active class to current mode button
    const modeButtonMap = {
      'RTSS': 'writeRTSS',
      'SEG': 'writeSEG',
      'GSPS': 'writeGSPS',
      'XML': 'writeXML'
    };

    const activeButtonId = modeButtonMap[mode];
    if (activeButtonId) {
      const activeBtn = document.getElementById(activeButtonId);
      if (activeBtn) {
        activeBtn.classList.add('mode-button-active');
      }
    }
  },

  /**
   * Get current mode
   * @returns {string} Current mode
   */
  getMode() {
    return this.currentMode;
  },

  /**
   * Check if in editing mode
   * @returns {boolean} True if in any editing mode
   */
  isEditingMode() {
    return this.currentMode !== 'VIEW';
  },

  /**
   * Set active ROI
   * @param {Object} roi - ROI object with name, color, type
   */
  setActiveROI(roi) {
    this.activeROI = roi;

    // Update watermark to show new ROI
    this.updateModeWatermark(this.currentMode);

    // Trigger ROI change event
    this.triggerEvent('roiChange', { roi });

    return this;
  },

  /**
   * Get active ROI
   * @returns {Object|null} Active ROI or null
   */
  getActiveROI() {
    return this.activeROI;
  },

  /**
   * Set tool (brush, eraser, fill)
   * @param {string} tool - Tool name
   */
  setTool(tool) {
    if (!['brush', 'eraser', 'fill'].includes(tool)) {
      console.error(`Invalid tool: ${tool}`);
      return;
    }

    const previousTool = this.toolSettings.activeTool;
    this.toolSettings.activeTool = tool;

    console.log(`🛠️ Tool changed: ${previousTool} → ${tool}`);

    // Trigger tool change event
    this.triggerEvent('toolChange', { previousTool, currentTool: tool });

    return this;
  },

  /**
   * Adjust brush size
   * @param {number} delta - Change amount (positive or negative)
   */
  adjustBrushSize(delta) {
    const newSize = Math.max(1, Math.min(50, this.toolSettings.brushSize + delta));
    this.toolSettings.brushSize = newSize;

    console.log(`🖌️ Brush size: ${newSize}px`);

    // Update any UI elements showing brush size
    const sizeInput = document.getElementById('SegBrushSizeText');
    const sizeRange = document.getElementById('SegBrushSizeRange');
    if (sizeInput) sizeInput.value = newSize;
    if (sizeRange) sizeRange.value = newSize;

    return this;
  },

  /**
   * Get tool settings
   * @returns {Object} Current tool settings
   */
  getToolSettings() {
    return { ...this.toolSettings };
  },

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      console.warn(`Unknown event: ${event}`);
      return;
    }

    this.listeners[event].push(callback);
  },

  /**
   * Trigger event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  triggerEvent(event, data) {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ContourEditingManager.init();
  });
} else {
  ContourEditingManager.init();
}

// Make globally available
window.ContourEditingManager = ContourEditingManager;
