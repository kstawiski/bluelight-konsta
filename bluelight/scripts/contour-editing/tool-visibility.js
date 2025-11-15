/**
 * Tool Visibility Manager
 * Context-aware toolbar management for contour editing modes
 * Hides irrelevant tools to reduce clutter and improve focus
 */

const ToolVisibilityManager = {
  // Tool visibility rules for each mode
  visibilityRules: {
    VIEW: {
      show: [
        'openFile', 'MouseOperation', 'b_Scroll', 'SplitWindow',
        'TransformationsImgParent', 'WindowRevisionParent', 'zoom',
        'color_invert', 'unlink', 'reset', 'MeasureImgParent',
        'playvideoParent', 'MarkButton', 'AnnotationParent',
        'OtherImgParent', 'MarkupImgParent'
      ],
      hide: []
    },
    RTSS: {
      show: [
        'MouseOperation', 'b_Scroll', 'resetImg', 'MarkButton',
        'drawRTSS', 'eraseRTSS', 'exitRTSS', 'saveRTSS'
      ],
      hide: [
        'playvideo', 'SplitWindow', 'TransformationsImgParent',
        'WindowRevisionParent', 'zoom', 'color_invert',
        'MeasureImgParent', 'AnnotationParent', 'OtherImgParent',
        'openFile'
      ]
    },
    SEG: {
      show: [
        'MouseOperation', 'b_Scroll', 'resetImg', 'MarkButton',
        'drawSEG', 'eraseSEG', 'fillSEG', 'UndoSEG', 'RedoSEG',
        'exitSEG', 'saveSEG'
      ],
      hide: [
        'playvideo', 'SplitWindow', 'TransformationsImgParent',
        'WindowRevisionParent', 'zoom', 'color_invert',
        'MeasureImgParent', 'AnnotationParent', 'OtherImgParent',
        'openFile'
      ]
    },
    GSPS: {
      show: [
        'MouseOperation', 'b_Scroll', 'resetImg', 'AnnotationParent',
        'drawGSPS', 'eraseGSPS', 'exitGSPS', 'saveGSPS'
      ],
      hide: [
        'playvideo', 'SplitWindow', 'TransformationsImgParent',
        'WindowRevisionParent', 'zoom', 'color_invert',
        'MeasureImgParent', 'MarkButton', 'OtherImgParent',
        'openFile'
      ]
    },
    XML: {
      show: [
        'MouseOperation', 'b_Scroll', 'resetImg',
        'drawXML', 'eraseXML', 'exitXML', 'saveXML'
      ],
      hide: [
        'playvideo', 'SplitWindow', 'TransformationsImgParent',
        'WindowRevisionParent', 'zoom', 'color_invert',
        'MeasureImgParent', 'AnnotationParent', 'MarkButton',
        'OtherImgParent', 'openFile'
      ]
    }
  },

  // Track original display states for restoration
  originalStates: new Map(),

  /**
   * Initialize the tool visibility manager
   */
  init() {
    if (!window.ContourEditingManager) {
      console.warn('ContourEditingManager not found. Tool visibility management disabled.');
      return false;
    }

    // Listen for mode changes
    ContourEditingManager.addEventListener('modeChange', (data) => {
      this.updateToolVisibility(data.currentMode);
    });

    console.log('🔧 Tool Visibility Manager initialized');
    return true;
  },

  /**
   * Update tool visibility based on current mode
   * @param {string} mode - Current editing mode
   */
  updateToolVisibility(mode) {
    const rules = this.visibilityRules[mode];
    if (!rules) {
      console.warn(`No visibility rules for mode: ${mode}`);
      return;
    }

    console.log(`🔧 Updating tool visibility for mode: ${mode}`);

    // Get all toolbar items
    const toolbarItems = this.getAllToolbarItems();

    // Apply visibility rules
    if (mode === 'VIEW') {
      // In VIEW mode, restore all original states
      this.restoreAllToolStates();
    } else {
      // In editing modes, selectively show/hide
      toolbarItems.forEach(item => {
        const itemId = this.getItemId(item);

        if (rules.hide.includes(itemId)) {
          this.hideToolItem(item);
        } else if (rules.show.includes(itemId)) {
          this.showToolItem(item);
        }
      });
    }

    // Update toolbar layout
    this.updateToolbarLayout(mode);
  },

  /**
   * Get all toolbar items
   * @returns {Array} Array of toolbar elements
   */
  getAllToolbarItems() {
    const items = [];

    // Get all span elements with IDs ending in _span or Parent
    const spans = document.querySelectorAll('span[id$="_span"], span[id$="Parent"]');
    spans.forEach(span => {
      if (span.id && this.isToolbarItem(span)) {
        items.push(span);
      }
    });

    return items;
  },

  /**
   * Check if element is a toolbar item
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  isToolbarItem(element) {
    // Check if element or its children have img.img class
    return element.querySelector('img.img') !== null ||
           element.classList.contains('img') ||
           element.id.includes('Parent');
  },

  /**
   * Get standardized ID for toolbar item
   * @param {HTMLElement} element
   * @returns {string}
   */
  getItemId(element) {
    let id = element.id;

    // Remove _span suffix if present
    if (id.endsWith('_span')) {
      id = id.replace('_span', '');
    }

    return id;
  },

  /**
   * Hide a toolbar item
   * @param {HTMLElement} element
   */
  hideToolItem(element) {
    if (!this.originalStates.has(element)) {
      // Store original display state
      this.originalStates.set(element, {
        display: element.style.display || '',
        visibility: element.style.visibility || '',
        opacity: element.style.opacity || '1'
      });
    }

    // Smooth fade out
    element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    element.style.opacity = '0';
    element.style.transform = 'scale(0.9)';

    setTimeout(() => {
      element.style.display = 'none';
    }, 200);
  },

  /**
   * Show a toolbar item
   * @param {HTMLElement} element
   */
  showToolItem(element) {
    const originalState = this.originalStates.get(element);

    if (originalState) {
      element.style.display = originalState.display || '';
    } else {
      element.style.display = '';
    }

    // Smooth fade in
    element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    element.style.opacity = '0';
    element.style.transform = 'scale(0.9)';

    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
    }, 10);
  },

  /**
   * Restore all tool states to original
   */
  restoreAllToolStates() {
    this.originalStates.forEach((state, element) => {
      element.style.display = state.display;
      element.style.visibility = state.visibility;
      element.style.opacity = state.opacity;
      element.style.transform = '';
      element.style.transition = '';
    });
  },

  /**
   * Update toolbar layout for mode
   * @param {string} mode
   */
  updateToolbarLayout(mode) {
    const iconList = document.getElementById('icon-list');
    if (!iconList) return;

    if (mode !== 'VIEW') {
      // In editing mode, make toolbar more compact
      iconList.classList.add('editing-mode');
    } else {
      iconList.classList.remove('editing-mode');
    }
  },

  /**
   * Get hidden tool count for current mode
   * @param {string} mode
   * @returns {number}
   */
  getHiddenToolCount(mode) {
    const rules = this.visibilityRules[mode];
    return rules ? rules.hide.length : 0;
  },

  /**
   * Get visible tool count for current mode
   * @param {string} mode
   * @returns {number}
   */
  getVisibleToolCount(mode) {
    const rules = this.visibilityRules[mode];
    return rules ? rules.show.length : 0;
  },

  /**
   * Check if tool is visible in current mode
   * @param {string} toolId
   * @param {string} mode
   * @returns {boolean}
   */
  isToolVisible(toolId, mode) {
    const rules = this.visibilityRules[mode];
    if (!rules) return true;

    return !rules.hide.includes(toolId);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ToolVisibilityManager.init();
  });
} else {
  ToolVisibilityManager.init();
}

// Make globally available
window.ToolVisibilityManager = ToolVisibilityManager;
