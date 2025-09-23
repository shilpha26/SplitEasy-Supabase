// shared-supabase.js - Centralized Supabase Management
console.log('🔄 Loading SplitEasy Supabase integration...');

// Supabase configuration
const SUPABASE_CONFIG = {
    url: 'https://oujoaievpfptzplsvgwm.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91am9haWV2cGZwdHpwbHN2Z3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MTQ1NTMsImV4cCI6MjA3NDA5MDU1M30.XkYmjksI5fPrw33oBRACWbisnTagpAjvZCq-xPujSb0'
};

// Global Supabase variables
let supabase = null;
let isOffline = false;

// Initialize Supabase connection
window.initializeSupabase = function() {
    if (window.supabase && !window.supabaseClient) {
        try {
            window.supabaseClient = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
            supabase = window.supabaseClient; // Backward compatibility
            console.log('✅ Supabase initialized successfully');
            return true;
        } catch (error) {
            console.warn('⚠️ Supabase initialization failed:', error);
            isOffline = true;
            return false;
        }
    } else if (!window.supabase) {
        console.warn('⚠️ Supabase library not loaded');
        setTimeout(window.initializeSupabase, 500); // Retry
        return false;
    }
    return !!window.supabaseClient;
};

// Database helper functions
async function checkUserIdExists(userId) {
    if (isOffline || !supabase) return false;

    try {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

        return !!data && !error;
    } catch (error) {
        console.warn('DB check failed:', error);
        return false;
    }
}

async function createUserInDatabase(userId, username) {
    if (isOffline || !supabase) {
        return { id: userId, name: username };
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .insert({ id: userId, name: username })
            .select()
            .single();

        if (error) throw error;
        console.log('User created in database');
        return data;
    } catch (error) {
        console.warn('DB create failed, using local:', error);
        return { id: userId, name: username };
    }
}

// Connection keeper - auto-restore lost connections
setInterval(() => {
    if (!window.supabaseClient && window.initializeSupabase) {
        console.log('🔄 Auto-restoring Supabase connection...');
        window.initializeSupabase();
    }
}, 30000);

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    if (!window.initializeSupabase()) {
        setTimeout(window.initializeSupabase, 500);
    }
});

// Also try immediate initialization
window.initializeSupabase();

console.log('✅ Supabase integration loaded');
