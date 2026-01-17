// Error Handler - Centralized error handling
(function() {
    'use strict';
    
    const ErrorHandler = {
        // Handle errors consistently
        handle: function(error, context = '', showToUser = true) {
            const errorMessage = error?.message || String(error);
            const errorDetails = {
                message: errorMessage,
                context: context,
                stack: error?.stack,
                timestamp: new Date().toISOString()
            };
            
            // Log error
            window.Logger?.error('Error:', errorDetails);
            
            // Show to user if needed
            if (showToUser && typeof showNotification === 'function') {
                const userMessage = this.getUserFriendlyMessage(error, context);
                showNotification(userMessage, 'error');
            }
            
            // Report to error tracking service (if available)
            if (window.errorTracker) {
                window.errorTracker.report(errorDetails);
            }
            
            return errorDetails;
        },
        
        // Get user-friendly error message
        getUserFriendlyMessage: function(error, context) {
            const message = error?.message || String(error);
            
            // Network errors
            if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
                return 'Connection error. Please check your internet connection.';
            }
            
            // Supabase errors
            if (message.includes('supabase') || message.includes('database')) {
                return 'Database error. Please try again later.';
            }
            
            // Validation errors
            if (message.includes('required') || message.includes('invalid')) {
                return message; // Show validation message as-is
            }
            
            // Generic error
            if (context) {
                return `Error in ${context}. Please try again.`;
            }
            
            return 'An error occurred. Please try again.';
        },
        
        // Wrap async function with error handling
        wrapAsync: function(fn, context = '') {
            return async function(...args) {
                try {
                    return await fn.apply(this, args);
                } catch (error) {
                    ErrorHandler.handle(error, context);
                    throw error; // Re-throw for caller to handle if needed
                }
            };
        },
        
        // Wrap sync function with error handling
        wrapSync: function(fn, context = '') {
            return function(...args) {
                try {
                    return fn.apply(this, args);
                } catch (error) {
                    ErrorHandler.handle(error, context);
                    throw error;
                }
            };
        },
        
        // Safe JSON parse
        safeParse: function(json, defaultValue = null) {
            try {
                return JSON.parse(json);
            } catch (error) {
                window.Logger?.warn('Failed to parse JSON:', error);
                return defaultValue;
            }
        },
        
        // Safe JSON stringify
        safeStringify: function(obj, defaultValue = '{}') {
            try {
                return JSON.stringify(obj);
            } catch (error) {
                window.Logger?.warn('Failed to stringify JSON:', error);
                return defaultValue;
            }
        }
    };
    
    // Global error handlers
    window.addEventListener('error', function(event) {
        ErrorHandler.handle(event.error, 'Global Error Handler', false);
    });
    
    window.addEventListener('unhandledrejection', function(event) {
        ErrorHandler.handle(event.reason, 'Unhandled Promise Rejection', false);
    });
    
    // Make globally available
    window.ErrorHandler = ErrorHandler;
    
    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ErrorHandler;
    }
})();

