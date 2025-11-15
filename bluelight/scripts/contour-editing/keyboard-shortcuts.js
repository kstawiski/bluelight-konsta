/**
 * Contour Editing Keyboard Shortcuts
 * Enhanced shortcuts for RTSS/SEG/GSPS/XML editing workflows
 */

const ContourKeyboardShortcuts = {
  shortcuts: {},

  init() {
    if (!window.ContourEditingManager) {
      console.warn('ContourEditingManager not found. Contour keyboard shortcuts disabled.');
      return false;
    }

    // Define contour-specific shortcuts
    this.shortcuts = {
      'e': {
        description: 'Enter edit mode (brush)',
        action: () => this.enterEditMode(),
        modifiers: []
      },
      'v': {
        description: 'Return to view mode',
        action: () => this.enterViewMode(),
        modifiers: []
      },
      'r': {
        description: 'Switch to eraser tool',
        action: () => this.switchToEraser(),
        modifiers: []
      },
      'f': {
        description: 'Switch to fill tool (SEG only)',
        action: () => this.switchToFill(),
        modifiers: []
      },
      '[': {
        description: 'Decrease brush size',
        action: () => ContourEditingManager.adjustBrushSize(-1),
        modifiers: []
      },
      ']': {
        description: 'Increase brush size',
        action: () => ContourEditingManager.adjustBrushSize(1),
        modifiers: []
      },
      't': {
        description: 'Toggle other ROIs visibility',
        action: () => this.toggleOtherROIs(),
        modifiers: []
      },
      'Escape': {
        description: 'Exit editing mode (safety)',
        action: () => this.safetyExitEditingMode(),
        modifiers: []
      }
    };

    // Register keyboard event listener
    document.addEventListener('keydown', (e) => this.handleKeydown(e));

    console.log('⌨️ Contour Editing Keyboard Shortcuts initialized');
    return true;
  },

  handleKeydown(e) {
    // Ignore if typing in input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = e.key;
    const shortcut = this.shortcuts[key];

    if (!shortcut) return;

    // Check modifiers
    const hasCtrl = e.ctrlKey || e.metaKey;
    const hasShift = e.shiftKey;
    const hasAlt = e.altKey;

    // Check if modifiers match
    if (shortcut.modifiers) {
      const needsCtrl = shortcut.modifiers.includes('ctrl');
      const needsShift = shortcut.modifiers.includes('shift');
      const needsAlt = shortcut.modifiers.includes('alt');

      if (needsCtrl !== hasCtrl || needsShift !== hasShift || needsAlt !== hasAlt) {
        return;
      }
    }

    // Execute shortcut
    e.preventDefault();
    try {
      shortcut.action();
    } catch (error) {
      console.error(`Error executing shortcut '${key}':`, error);
    }
  },

  /**
   * Enter edit mode - activates last used editing mode or prompts user
   */
  enterEditMode() {
    const currentMode = ContourEditingManager.getMode();

    // If already in an editing mode, just activate brush tool
    if (ContourEditingManager.isEditingMode()) {
      ContourEditingManager.setTool('brush');
      console.log('🖌️ Brush tool activated');

      // Click the draw button for current mode
      const drawButtons = {
        'RTSS': 'drawRTSS',
        'SEG': 'drawSEG',
        'GSPS': 'drawGSPS',
        'XML': 'drawXML'
      };

      const drawButtonId = drawButtons[currentMode];
      if (drawButtonId) {
        const btn = document.getElementById(drawButtonId);
        if (btn && btn.style.display !== 'none') {
          btn.click();
        }
      }

      return;
    }

    // If in VIEW mode, activate the last used editing mode (or default to SEG)
    const lastEditingMode = localStorage.getItem('bluelight_last_editing_mode') || 'SEG';

    // Try to activate the mode by clicking the appropriate button
    const modeButtons = {
      'RTSS': 'writeRTSS',
      'SEG': 'writeSEG',
      'GSPS': 'writeGSPS',
      'XML': 'writeXML'
    };

    const buttonId = modeButtons[lastEditingMode];
    if (buttonId) {
      const btn = document.getElementById(buttonId);
      if (btn && btn.style.display !== 'none') {
        btn.click();
        console.log(`✏️ Entered ${lastEditingMode} editing mode`);
      }
    }
  },

  /**
   * Return to view mode
   */
  enterViewMode() {
    const currentMode = ContourEditingManager.getMode();

    if (currentMode === 'VIEW') {
      console.log('👁️ Already in view mode');
      return;
    }

    // Save last editing mode
    localStorage.setItem('bluelight_last_editing_mode', currentMode);

    // Click the exit button for current mode
    const exitButtons = {
      'RTSS': 'exitRTSS',
      'SEG': 'exitSEG',
      'GSPS': 'exitGSPS',
      'XML': 'exitXML'
    };

    const exitButtonId = exitButtons[currentMode];
    if (exitButtonId) {
      const btn = document.getElementById(exitButtonId);
      if (btn && btn.style.display !== 'none') {
        btn.click();
        console.log('👁️ Returned to view mode');
      }
    }
  },

  /**
   * Switch to eraser tool
   */
  switchToEraser() {
    const currentMode = ContourEditingManager.getMode();

    if (!ContourEditingManager.isEditingMode()) {
      console.log('⚠️ Not in editing mode. Press E to enter edit mode first.');
      return;
    }

    ContourEditingManager.setTool('eraser');

    // Click the erase button for current mode
    const eraseButtons = {
      'RTSS': 'eraseRTSS',
      'SEG': 'eraseSEG',
      'GSPS': 'eraseGSPS',
      'XML': 'eraseXML'
    };

    const eraseButtonId = eraseButtons[currentMode];
    if (eraseButtonId) {
      const btn = document.getElementById(eraseButtonId);
      if (btn && btn.style.display !== 'none') {
        btn.click();
        console.log('🧹 Eraser tool activated');
      }
    }
  },

  /**
   * Switch to fill tool (SEG only)
   */
  switchToFill() {
    const currentMode = ContourEditingManager.getMode();

    if (currentMode !== 'SEG') {
      console.log('⚠️ Fill tool only available in SEG mode');
      return;
    }

    ContourEditingManager.setTool('fill');

    const fillBtn = document.getElementById('fillSEG');
    if (fillBtn && fillBtn.style.display !== 'none') {
      fillBtn.click();
      console.log('🪣 Fill tool activated');
    }
  },

  /**
   * Toggle other ROIs visibility
   */
  toggleOtherROIs() {
    // This would integrate with the existing ROI visibility system
    // For now, we'll just log the intention
    console.log('👁️ Toggle other ROIs visibility (to be implemented with ROI manager)');

    // Future implementation would:
    // 1. Get list of all ROIs
    // 2. Hide/show all except active ROI
    // 3. Update UI to reflect visibility state
  },

  /**
   * Safety exit editing mode (Escape key)
   */
  safetyExitEditingMode() {
    if (!ContourEditingManager.isEditingMode()) {
      return;
    }

    // Show confirmation if there are unsaved changes
    // (This would integrate with undo stack detection)
    const hasUnsavedChanges = false; // TODO: Detect from undo stack

    if (hasUnsavedChanges) {
      const confirmed = confirm('You have unsaved changes. Exit editing mode anyway?');
      if (!confirmed) {
        return;
      }
    }

    this.enterViewMode();
    console.log('🛡️ Safety exit activated');
  },

  /**
   * Show keyboard shortcuts help overlay
   */
  showHelp() {
    // This integrates with the existing keyboard shortcuts overlay
    if (window.KeyboardShortcuts && window.KeyboardShortcuts.showHelp) {
      window.KeyboardShortcuts.showHelp();
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ContourKeyboardShortcuts.init();
  });
} else {
  ContourKeyboardShortcuts.init();
}

// Make globally available
window.ContourKeyboardShortcuts = ContourKeyboardShortcuts;
