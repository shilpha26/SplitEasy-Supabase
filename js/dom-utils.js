// DOM Utilities - Safe DOM manipulation and event handling
(function() {
    'use strict';
    
    const DOMUtils = {
        // Cache for DOM elements
        cache: new Map(),
        
        // Get element with caching
        get: function(id) {
            if (!id) return null;
            
            if (this.cache.has(id)) {
                const el = this.cache.get(id);
                // Verify element still exists
                if (document.body.contains(el)) {
                    return el;
                } else {
                    this.cache.delete(id);
                }
            }
            
            const el = document.getElementById(id);
            if (el) {
                this.cache.set(id, el);
            }
            return el;
        },
        
        // Clear cache
        clearCache: function() {
            this.cache.clear();
        },
        
        // Safe text content setter
        setText: function(id, text) {
            const el = this.get(id);
            if (el) {
                el.textContent = text;
            }
        },
        
        // Safe HTML setter (with sanitization warning)
        setHTML: function(id, html) {
            const el = this.get(id);
            if (el) {
                // WARNING: Only use for trusted content
                // For user input, use createElement and textContent
                el.innerHTML = html;
            }
        },
        
        // Create element safely
        create: function(tag, attributes = {}, text = '') {
            const el = document.createElement(tag);
            
            // Set attributes
            Object.keys(attributes).forEach(key => {
                if (key === 'className') {
                    el.className = attributes[key];
                } else if (key === 'dataset') {
                    Object.keys(attributes[key]).forEach(dataKey => {
                        el.dataset[dataKey] = attributes[key][dataKey];
                    });
                } else if (key.startsWith('on')) {
                    // Don't set inline event handlers - use addEventListener
                    window.Logger?.warn('Avoid inline event handlers. Use addEventListener instead.');
                } else {
                    el.setAttribute(key, attributes[key]);
                }
            });
            
            // Set text content (safe)
            if (text) {
                el.textContent = text;
            }
            
            return el;
        },
        
        // Create element with children
        createWithChildren: function(tag, attributes = {}, children = []) {
            const el = this.create(tag, attributes);
            children.forEach(child => {
                if (typeof child === 'string') {
                    el.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    el.appendChild(child);
                }
            });
            return el;
        },
        
        // Show element
        show: function(id) {
            const el = this.get(id);
            if (el) {
                el.style.display = 'block';
            }
        },
        
        // Hide element
        hide: function(id) {
            const el = this.get(id);
            if (el) {
                el.style.display = 'none';
            }
        },
        
        // Toggle element visibility
        toggle: function(id, show) {
            if (show === undefined) {
                const el = this.get(id);
                if (el) {
                    show = el.style.display === 'none';
                }
            }
            if (show) {
                this.show(id);
            } else {
                this.hide(id);
            }
        },
        
        // Event delegation helper
        delegate: function(container, selector, event, handler) {
            const containerEl = typeof container === 'string' ? this.get(container) : container;
            if (!containerEl) return;
            
            containerEl.addEventListener(event, function(e) {
                const target = e.target.closest(selector);
                if (target) {
                    handler.call(target, e);
                }
            });
        },
        
        // Remove all inline onclick handlers and use delegation
        removeInlineHandlers: function() {
            const elements = document.querySelectorAll('[onclick]');
            elements.forEach(el => {
                const onclick = el.getAttribute('onclick');
                if (onclick) {
                    el.removeAttribute('onclick');
                    window.Logger?.warn('Removed inline onclick handler. Use event delegation instead.');
                }
            });
        },
        
        // Focus management for accessibility
        focus: function(id) {
            const el = this.get(id);
            if (el && typeof el.focus === 'function') {
                el.focus();
            }
        },
        
        // Focus trap for modals
        trapFocus: function(container) {
            const containerEl = typeof container === 'string' ? this.get(container) : container;
            if (!containerEl) return;
            
            const focusableElements = containerEl.querySelectorAll(
                'a[href], button:not([disabled]), textarea:not([disabled]), ' +
                'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            containerEl.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
                
                if (e.key === 'Escape') {
                    const modal = containerEl.closest('.modal');
                    if (modal) {
                        modal.style.display = 'none';
                    }
                }
            });
        }
    };
    
    // Make globally available
    window.DOMUtils = DOMUtils;
    
    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DOMUtils;
    }
})();

