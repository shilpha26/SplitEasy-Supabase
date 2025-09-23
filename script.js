// script.js - Complete SplitEasy Application Logic
console.log('🚀 SplitEasy main script loading...');

// Global variables
window.groups = [];
window.currentUser = null;

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateUserIdFromName(name) {
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return (clean || 'user') + timestamp + random;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount || 0);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Storage functions
function loadFromLocalStorage() {
    try {
        const data = localStorage.getItem('spliteasy_groups');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return [];
    }
}

function saveToLocalStorage() {
    try {
        // Calculate totals for each group
        window.groups.forEach(group => {
            if (group.expenses && group.expenses.length > 0) {
                group.totalExpenses = group.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
                group.expenses.forEach(exp => {
                    if (exp.splitBetween && exp.splitBetween.length > 0) {
                        exp.perPersonAmount = parseFloat(exp.amount || 0) / exp.splitBetween.length;
                    }
                });
            } else {
                group.totalExpenses = 0;
            }
        });

        localStorage.setItem('spliteasy_groups', JSON.stringify(window.groups));
        console.log('💾 Data saved to localStorage');

        // Trigger sync if available
        if (typeof syncAllDataToDatabase === 'function' && window.supabaseClient && window.currentUser) {
            syncAllDataToDatabase();
        }
    } catch (error) {
        console.error('❌ Failed to save to localStorage:', error);
    }
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 SplitEasy app initialized successfully!');

    // Initialize groups array
    window.groups = loadFromLocalStorage();
    console.log('📊 Loaded', window.groups.length, 'groups');

    // Check if user is logged in
    const userData = localStorage.getItem('spliteasy_current_user');
    if (userData) {
        window.currentUser = JSON.parse(userData);
        console.log('👤 User logged in:', window.currentUser.name);
    }

    // Show success message
    showNotification('SplitEasy loaded successfully!');
});

console.log('✅ SplitEasy script loaded');