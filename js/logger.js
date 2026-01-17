// Logger utility - Environment-aware logging
(function() {
    'use strict';
    
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('localhost');
    
    const LogLevel = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        NONE: 4
    };
    
    let currentLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
    
    const Logger = {
        debug: function(...args) {
            if (currentLevel <= LogLevel.DEBUG) {
                console.log('[DEBUG]', ...args);
            }
        },
        
        info: function(...args) {
            if (currentLevel <= LogLevel.INFO) {
                console.info('[INFO]', ...args);
            }
        },
        
        warn: function(...args) {
            if (currentLevel <= LogLevel.WARN) {
                console.warn('[WARN]', ...args);
            }
        },
        
        error: function(...args) {
            if (currentLevel <= LogLevel.ERROR) {
                console.error('[ERROR]', ...args);
            }
        },
        
        setLevel: function(level) {
            currentLevel = level;
        },
        
        getLevel: function() {
            return currentLevel;
        }
    };
    
    // Make logger globally available
    window.Logger = Logger;
    
    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Logger;
    }
})();

