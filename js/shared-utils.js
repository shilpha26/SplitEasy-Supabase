// shared-utils.js - Complete utilities needed for SplitEasy
console.log('🔧 Loading SplitEasy shared utilities...');

// ========================================
// STORAGE UTILITIES
// ========================================

// Check if localStorage is available
function isLocalStorageAvailable() {
    try {
        const test = 'localStorageTest';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.warn('localStorage not available:', e);
        return false;
    }
}

// Load groups from localStorage
function loadFromLocalStorage() {
    if (isLocalStorageAvailable()) {
        try {
            const data = localStorage.getItem('spliteasy_groups');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error parsing groups from localStorage:', error);
            localStorage.removeItem('spliteasy_groups'); // Clear corrupted data
            return [];
        }
    }
    return [];
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================

// Enhanced notification system
function showNotification(message, type = 'success') {
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Try to show in DOM if notification element exists
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.style.display = 'block';

        // Style based on type
        if (type === 'error') {
            notification.style.background = '#f8d7da';
            notification.style.color = '#721c24';
            notification.style.borderColor = '#f5c6cb';
        } else if (type === 'info') {
            notification.style.background = '#d1ecf1';
            notification.style.color = '#0c5460';
            notification.style.borderColor = '#bee5eb';
        } else {
            notification.style.background = '#d4edda';
            notification.style.color = '#155724';
            notification.style.borderColor = '#c3e6cb';
        }

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    } else {
        // Fallback to console
        if (type === 'error') {
            console.error('❌', message);
        } else {
            console.log('✅', message);
        }
    }
}

// ========================================
// DATE & CURRENCY FORMATTING
// ========================================

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Format currency for display
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

// ========================================
// USER ID GENERATION
// ========================================

// Generate unique user ID
function generateUserId(username) {
    const clean = username.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 8);

    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');

    return (clean || 'user') + timestamp + random;
}

// ========================================
// VALIDATION UTILITIES
// ========================================

// Validate user ID format
function isValidUserId(userId) {
    return /^[a-zA-Z0-9]+$/.test(userId) && userId.length >= 4;
}

// Validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ========================================
// DOM UTILITIES
// ========================================

// Safe element selector
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

// Safe event listener addition
function safeAddEventListener(elementId, event, handler) {
    const element = safeGetElement(elementId);
    if (element && typeof handler === 'function') {
        element.addEventListener(event, handler);
        return true;
    }
    return false;
}

// ========================================
// DEBUGGING UTILITIES
// ========================================

// Debug app state
window.debugApp = function() {
    return {
        user: window.currentUser?.name || 'Not logged in',
        groups: window.groups?.length || 0,
        localStorage: isLocalStorageAvailable(),
        supabase: !!window.supabaseClient,
        online: navigator.onLine
    };
};

console.log('✅ Shared utilities loaded successfully');
