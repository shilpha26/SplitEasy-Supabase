// App State Management - Centralized state
(function() {
    'use strict';
    
    const AppState = {
        // Application state
        groups: [],
        currentUser: null,
        
        // UI state
        dynamicMemberCounter: 0,
        editingGroupId: null,
        editDynamicMemberCounter: 0,
        
        // Auth state
        userIdCheckTimeout: null,
        isUserIdAvailable: false,
        
        // Event listeners for state changes
        listeners: new Map(),
        
        // Initialize state from localStorage
        init: function() {
            try {
                const userData = localStorage.getItem('spliteasy_current_user');
                if (userData) {
                    this.currentUser = JSON.parse(userData);
                }
            } catch (error) {
                window.Logger?.error('Failed to initialize state:', error);
            }
        },
        
        // Get groups
        getGroups: function() {
            return [...this.groups]; // Return copy
        },
        
        // Set groups
        setGroups: function(groups) {
            this.groups = Array.isArray(groups) ? [...groups] : [];
            this.notify('groupsChanged', this.groups);
        },
        
        // Add group
        addGroup: function(group) {
            this.groups.push(group);
            this.notify('groupAdded', group);
        },
        
        // Update group
        updateGroup: function(groupId, updates) {
            const index = this.groups.findIndex(g => 
                (g.id === groupId) || (g.supabaseId === groupId)
            );
            if (index >= 0) {
                this.groups[index] = { ...this.groups[index], ...updates };
                this.notify('groupUpdated', this.groups[index]);
            }
        },
        
        // Remove group
        removeGroup: function(groupId) {
            const index = this.groups.findIndex(g => 
                (g.id === groupId) || (g.supabaseId === groupId)
            );
            if (index >= 0) {
                const group = this.groups[index];
                this.groups.splice(index, 1);
                this.notify('groupRemoved', group);
            }
        },
        
        // Set current user
        setCurrentUser: function(user) {
            this.currentUser = user ? { ...user } : null;
            if (user) {
                try {
                    localStorage.setItem('spliteasy_current_user', JSON.stringify(user));
                } catch (error) {
                    window.Logger?.error('Failed to save user to localStorage:', error);
                }
            }
            this.notify('userChanged', this.currentUser);
        },
        
        // Subscribe to state changes
        subscribe: function(event, callback) {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
            
            // Return unsubscribe function
            return () => {
                const callbacks = this.listeners.get(event);
                if (callbacks) {
                    const index = callbacks.indexOf(callback);
                    if (index >= 0) {
                        callbacks.splice(index, 1);
                    }
                }
            };
        },
        
        // Notify listeners
        notify: function(event, data) {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                callbacks.forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        window.Logger?.error('Error in state listener:', error);
                    }
                });
            }
        },
        
        // Clear all state
        clear: function() {
            this.groups = [];
            this.currentUser = null;
            this.dynamicMemberCounter = 0;
            this.editingGroupId = null;
            this.editDynamicMemberCounter = 0;
            this.listeners.clear();
        }
    };
    
    // Initialize on load
    AppState.init();
    
    // Make globally available
    window.AppState = AppState;
    
    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AppState;
    }
})();

