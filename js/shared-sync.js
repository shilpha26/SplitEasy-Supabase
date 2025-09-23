// shared-sync-database-fixed.js - Schema-Aware Sync System
console.log('🔧 Loading database schema-aware SplitEasy sync system...');

// ========================================
// GLOBAL VARIABLES & CONFIGURATION
// ========================================
if (!window.splitEasySync) {
    window.splitEasySync = {
        isSyncing: false,
        syncQueue: [],
        isOffline: !navigator.onLine,
        syncTimeout: null,
        realtimeSubscription: null,
        lastSyncTime: null,
        syncRetryCount: 0,
        maxRetries: 3,
        schemaChecked: false
    };
}

// ========================================
// DATABASE SCHEMA DETECTION & MAPPING
// ========================================

// FIXED: Detect and map column names based on actual database schema
let SCHEMA_MAPPING = {
    users: {
        id: 'id',
        name: 'name',
        createdAt: 'created_at',    // Try created_at first
        updatedAt: 'updated_at'     // Try updated_at first
    },
    groups: {
        id: 'id',
        name: 'name',
        createdBy: 'created_by',
        updatedBy: 'updated_by',
        members: 'members',
        participants: 'participants',
        totalExpenses: 'total_expenses',
        expenseCount: 'expense_count',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    expenses: {
        id: 'id',
        groupId: 'group_id',
        description: 'description',
        amount: 'amount',
        paidBy: 'paid_by',
        splitBetween: 'split_between',
        createdBy: 'created_by',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        perPersonAmount: 'per_person_amount'
    }
};

// Auto-detect database schema
async function detectDatabaseSchema() {
    if (window.splitEasySync.schemaChecked || !window.supabaseClient) {
        return;
    }

    console.log('🔍 Detecting database schema...');

    try {
        // Try different column name variations for users table
        const testQueries = [
            // Test createdat vs created_at
            { table: 'users', column: 'createdat', mapping: 'createdAt' },
            { table: 'users', column: 'created_at', mapping: 'createdAt' },
            { table: 'users', column: 'updatedat', mapping: 'updatedAt' },
            { table: 'users', column: 'updated_at', mapping: 'updatedAt' },

            // Test groups table
            { table: 'groups', column: 'createdby', mapping: 'createdBy' },
            { table: 'groups', column: 'created_by', mapping: 'createdBy' },
            { table: 'groups', column: 'createdat', mapping: 'createdAt' },
            { table: 'groups', column: 'created_at', mapping: 'createdAt' },

            // Test expenses table  
            { table: 'expenses', column: 'groupid', mapping: 'groupId' },
            { table: 'expenses', column: 'group_id', mapping: 'groupId' },
            { table: 'expenses', column: 'paidby', mapping: 'paidBy' },
            { table: 'expenses', column: 'paid_by', mapping: 'paidBy' }
        ];

        for (const test of testQueries) {
            try {
                const { error } = await window.supabaseClient
                    .from(test.table)
                    .select(test.column)
                    .limit(1);

                if (!error) {
                    SCHEMA_MAPPING[test.table][test.mapping] = test.column;
                    console.log(`✅ Schema: ${test.table}.${test.mapping} = ${test.column}`);
                }
            } catch (e) {
                // Column doesn't exist, try next variation
            }
        }

        window.splitEasySync.schemaChecked = true;
        console.log('✅ Database schema detection complete');
        console.log('📋 Final schema mapping:', SCHEMA_MAPPING);

    } catch (error) {
        console.warn('⚠️ Schema detection failed:', error);
    }
}

// ========================================
// ENHANCED DATABASE FUNCTIONS WITH SCHEMA HANDLING
// ========================================

// FIXED: Schema-aware user sync
async function syncUserToDatabase(userData) {
    if (window.splitEasySync.isOffline || !window.supabaseClient) {
        console.log('📴 Skipping user sync - offline or no client');
        return null;
    }

    // Ensure schema is detected
    await detectDatabaseSchema();

    try {
        console.log('👤 Syncing user to database:', userData.name);

        const userSchema = SCHEMA_MAPPING.users;
        const userRecord = {
            [userSchema.id]: userData.id,
            [userSchema.name]: userData.name,
            [userSchema.createdAt]: userData.createdAt || new Date().toISOString(),
            [userSchema.updatedAt]: new Date().toISOString()
        };

        console.log('📊 User record structure:', userRecord);

        const { data, error } = await window.supabaseClient
            .from('users')
            .upsert(userRecord)
            .select()
            .single();

        if (error) {
            console.error('❌ User sync error details:', error);
            throw error;
        }

        console.log('✅ User synced successfully:', data);
        return data;
    } catch (error) {
        console.error('❌ Failed to sync user:', error);
        console.error('🔍 Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        return null;
    }
}

// FIXED: Schema-aware group sync
async function syncGroupToDatabase(group) {
    if (window.splitEasySync.isOffline || !window.supabaseClient || !window.currentUser) {
        console.log('📴 Skipping group sync - offline, no client, or no user');
        return null;
    }

    // Ensure schema is detected
    await detectDatabaseSchema();

    try {
        console.log('👥 Syncing group to database:', group.name);

        const groupSchema = SCHEMA_MAPPING.groups;
        const groupRecord = {
            [groupSchema.id]: group.id,
            [groupSchema.name]: group.name,
            [groupSchema.createdBy]: group.createdBy || window.currentUser.id,
            [groupSchema.updatedBy]: window.currentUser.id,
            [groupSchema.members]: Array.isArray(group.members) ? group.members : [window.currentUser.id],
            [groupSchema.participants]: Array.isArray(group.members) ? group.members : [window.currentUser.id],
            [groupSchema.totalExpenses]: group.totalExpenses || 0,
            [groupSchema.expenseCount]: group.expenses?.length || 0,
            [groupSchema.createdAt]: group.createdAt || new Date().toISOString(),
            [groupSchema.updatedAt]: new Date().toISOString()
        };

        console.log('📊 Group record structure:', groupRecord);

        const { data, error } = await window.supabaseClient
            .from('groups')
            .upsert(groupRecord)
            .select()
            .single();

        if (error) {
            console.error('❌ Group sync error details:', error);
            throw error;
        }

        console.log('✅ Group synced successfully:', data);
        return data;
    } catch (error) {
        console.error('❌ Failed to sync group:', error);
        console.error('🔍 Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        return null;
    }
}

// FIXED: Schema-aware expense sync
async function syncExpenseToDatabase(expense, groupId) {
    if (window.splitEasySync.isOffline || !window.supabaseClient || !window.currentUser) {
        console.log('📴 Skipping expense sync - offline, no client, or no user');
        return null;
    }

    // Ensure schema is detected
    await detectDatabaseSchema();

    try {
        console.log('💰 Syncing expense to database:', expense.name);

        const expenseSchema = SCHEMA_MAPPING.expenses;
        const expenseRecord = {
            [expenseSchema.id]: expense.id,
            [expenseSchema.groupId]: groupId,
            [expenseSchema.description]: expense.name,
            [expenseSchema.amount]: parseFloat(expense.amount),
            [expenseSchema.paidBy]: expense.paidBy || 'unknown',
            [expenseSchema.splitBetween]: expense.splitBetween || [],
            [expenseSchema.createdBy]: window.currentUser.id,
            [expenseSchema.createdAt]: expense.date || new Date().toISOString(),
            [expenseSchema.updatedAt]: new Date().toISOString(),
            [expenseSchema.perPersonAmount]: expense.perPersonAmount || (parseFloat(expense.amount) / (expense.splitBetween?.length || 1))
        };

        console.log('📊 Expense record structure:', expenseRecord);

        const { data, error } = await window.supabaseClient
            .from('expenses')
            .upsert(expenseRecord)
            .select()
            .single();

        if (error) {
            console.error('❌ Expense sync error details:', error);
            throw error;
        }

        console.log('✅ Expense synced successfully:', data);
        return data;
    } catch (error) {
        console.error('❌ Failed to sync expense:', error);
        console.error('🔍 Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        return null;
    }
}

// FIXED: Schema-aware group fetching
async function fetchGroupFromDatabase(groupId) {
    console.log('🔍 fetchGroupFromDatabase called with ID:', groupId);

    if (!groupId) {
        throw new Error('Group ID is required');
    }

    if (!window.supabaseClient) {
        throw new Error('Supabase client not available');
    }

    // Ensure schema is detected
    await detectDatabaseSchema();

    try {
        console.log('🔄 Fetching group from database:', groupId);

        const groupSchema = SCHEMA_MAPPING.groups;

        // Fetch group with schema-aware column names
        const { data: group, error: groupError } = await window.supabaseClient
            .from('groups')
            .select('*')
            .eq(groupSchema.id, groupId)
            .single();

        if (groupError) {
            console.error('❌ Group fetch error:', groupError);
            throw groupError;
        }

        if (!group) {
            console.warn('⚠️ Group not found in database:', groupId);
            return null;
        }

        console.log('📋 Group found:', group[groupSchema.name] || group.name);

        // Fetch expenses for this group
        const expenseSchema = SCHEMA_MAPPING.expenses;
        const { data: expenses, error: expensesError } = await window.supabaseClient
            .from('expenses')
            .select('*')
            .eq(expenseSchema.groupId, groupId)
            .order(expenseSchema.createdAt, { ascending: false });

        if (expensesError) {
            console.warn('⚠️ Failed to fetch expenses:', expensesError);
            // Continue without expenses rather than failing
        }

        // Structure the group data properly with schema mapping
        const completeGroup = {
            id: group[groupSchema.id] || group.id,
            name: group[groupSchema.name] || group.name,
            members: group[groupSchema.members] || group[groupSchema.participants] || [],
            expenses: expenses ? expenses.map(expense => ({
                id: expense[expenseSchema.id] || expense.id,
                name: expense[expenseSchema.description] || expense.description || expense.name,
                amount: parseFloat(expense[expenseSchema.amount] || expense.amount || 0),
                paidBy: expense[expenseSchema.paidBy] || expense.paid_by || expense.paidby,
                splitBetween: expense[expenseSchema.splitBetween] || expense.split_between || expense.splitbetween || [],
                date: expense[expenseSchema.createdAt] || expense.created_at || expense.createdat,
                perPersonAmount: expense[expenseSchema.perPersonAmount] || expense.per_person_amount || expense.perpersonamount || 0
            })) : [],
            totalExpenses: 0,
            createdAt: group[groupSchema.createdAt] || group.created_at || group.createdat,
            createdBy: group[groupSchema.createdBy] || group.created_by || group.createdby
        };

        // Calculate total expenses
        if (completeGroup.expenses) {
            completeGroup.totalExpenses = completeGroup.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
        }

        console.log('✅ Complete group data assembled:', completeGroup.name, 'with', completeGroup.expenses.length, 'expenses');
        return completeGroup;

    } catch (error) {
        console.error('❌ Failed to fetch group from database:', error);
        console.error('🔍 Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        throw error;
    }
}

// FIXED: Schema-aware expense deletion
async function deleteExpenseFromDatabase(expenseId) {
    console.log('🗑️ deleteExpenseFromDatabase called with ID:', expenseId);

    if (!expenseId) {
        throw new Error('Expense ID is required for deletion');
    }

    if (window.splitEasySync.isOffline) {
        console.log('📴 Offline - queuing expense deletion for later sync');
        let deleteQueue = JSON.parse(localStorage.getItem('spliteasy_delete_queue') || '[]');
        deleteQueue.push({ type: 'expense', id: expenseId, timestamp: Date.now() });
        localStorage.setItem('spliteasy_delete_queue', JSON.stringify(deleteQueue));
        return;
    }

    if (!window.supabaseClient) {
        throw new Error('Supabase client not available');
    }

    // Ensure schema is detected
    await detectDatabaseSchema();

    try {
        console.log('🔥 Attempting to delete expense from database:', expenseId);

        const expenseSchema = SCHEMA_MAPPING.expenses;

        const { data, error: deleteError } = await window.supabaseClient
            .from('expenses')
            .delete()
            .eq(expenseSchema.id, expenseId)
            .select();

        if (deleteError) {
            console.error('❌ Supabase delete error:', deleteError);
            throw deleteError;
        }

        if (!data || data.length === 0) {
            console.warn('⚠️ No records deleted - expense might not exist in database');
            return;
        }

        console.log('✅ Expense deleted from database successfully:', data.length, 'records');
        cleanupDeleteQueue('expense', expenseId);

    } catch (error) {
        console.error('❌ Failed to delete expense from database:', error);
        console.error('🔍 Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        throw error;
    }
}

// FIXED: Schema-aware group deletion
async function deleteGroupFromDatabase(groupId) {
    console.log('🗑️ deleteGroupFromDatabase called with ID:', groupId);

    if (!groupId) {
        throw new Error('Group ID is required for deletion');
    }

    if (window.splitEasySync.isOffline) {
        console.log('📴 Offline - queuing group deletion for later sync');
        let deleteQueue = JSON.parse(localStorage.getItem('spliteasy_delete_queue') || '[]');
        deleteQueue.push({ type: 'group', id: groupId, timestamp: Date.now() });
        localStorage.setItem('spliteasy_delete_queue', JSON.stringify(deleteQueue));
        return;
    }

    if (!window.supabaseClient) {
        throw new Error('Supabase client not available');
    }

    // Ensure schema is detected
    await detectDatabaseSchema();

    try {
        console.log('🔥 Deleting group from database:', groupId);

        const groupSchema = SCHEMA_MAPPING.groups;
        const expenseSchema = SCHEMA_MAPPING.expenses;

        // Delete expenses first
        const { error: expenseError } = await window.supabaseClient
            .from('expenses')
            .delete()
            .eq(expenseSchema.groupId, groupId);

        if (expenseError) {
            console.warn('⚠️ Failed to delete group expenses:', expenseError);
        } else {
            console.log('✅ Group expenses deleted');
        }

        // Then delete group
        const { data, error: groupError } = await window.supabaseClient
            .from('groups')
            .delete()
            .eq(groupSchema.id, groupId)
            .select();

        if (groupError) {
            throw groupError;
        }

        console.log('✅ Group deleted from database successfully');
        cleanupDeleteQueue('group', groupId);

    } catch (error) {
        console.error('❌ Failed to delete group from database:', error);
        console.error('🔍 Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        throw error;
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Clean up delete queue
function cleanupDeleteQueue(type, id) {
    try {
        let deleteQueue = JSON.parse(localStorage.getItem('spliteasy_delete_queue') || '[]');
        deleteQueue = deleteQueue.filter(item => !(item.type === type && item.id === id));
        localStorage.setItem('spliteasy_delete_queue', JSON.stringify(deleteQueue));
        console.log('🧹 Cleaned up delete queue for', type, id);
    } catch (error) {
        console.warn('Failed to clean up delete queue:', error);
    }
}

// Safe localStorage functions
function loadFromLocalStorageSafe() {
    try {
        const data = localStorage.getItem('spliteasy_groups');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('❌ Error loading from localStorage:', error);
        return [];
    }
}

function saveGroupsToLocalStorageSafe(groups) {
    try {
        groups.forEach(group => {
            if (!group.expenses) group.expenses = [];
            if (group.expenses.length > 0) {
                group.totalExpenses = group.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
            } else {
                group.totalExpenses = 0;
            }
        });

        localStorage.setItem('spliteasy_groups', JSON.stringify(groups));
        console.log('💾 Groups saved to localStorage:', groups.length, 'groups');
    } catch (error) {
        console.error('❌ Failed to save to localStorage:', error);
    }
}

function showNotificationSafe(message, type = 'success') {
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else {
        console.log(`📢 Notification: ${message} (${type})`);
    }
}

// Sync all data to database
async function syncAllDataToDatabase() {
    if (window.splitEasySync.isSyncing || window.splitEasySync.isOffline || !window.supabaseClient || !window.currentUser) {
        console.log('⚠️ Cannot sync - already syncing, offline, no client, or no user');
        return;
    }

    window.splitEasySync.isSyncing = true;
    console.log('🔄 Starting complete data sync with schema detection...');

    try {
        // First, detect database schema
        await detectDatabaseSchema();

        // Sync current user first
        await syncUserToDatabase(window.currentUser);

        // Get all local data
        const localGroups = loadFromLocalStorageSafe();

        if (localGroups.length === 0) {
            console.log('📭 No groups to sync');
            return;
        }

        // Sync all groups
        for (const group of localGroups) {
            console.log('🔄 Syncing group:', group.name);

            await syncGroupToDatabase(group);

            if (group.expenses && group.expenses.length > 0) {
                for (const expense of group.expenses) {
                    await syncExpenseToDatabase(expense, group.id);
                }
            }

            await new Promise(resolve => setTimeout(resolve, 200));
        }

        window.splitEasySync.lastSyncTime = new Date().toISOString();
        localStorage.setItem('lastsynctime', window.splitEasySync.lastSyncTime);

        console.log('✅ Complete data sync finished successfully!');
        showNotificationSafe('All data synced to cloud successfully!');
    } catch (error) {
        console.error('❌ Complete data sync failed:', error);
        showNotificationSafe('Sync failed: ' + error.message, 'error');
    } finally {
        window.splitEasySync.isSyncing = false;
    }
}

// ========================================
// GLOBAL FUNCTION EXPORTS
// ========================================

// Make all functions globally available
window.fetchGroupFromDatabase = fetchGroupFromDatabase;
window.deleteExpenseFromDatabase = deleteExpenseFromDatabase;
window.deleteGroupFromDatabase = deleteGroupFromDatabase;
window.syncExpenseToDatabase = syncExpenseToDatabase;
window.syncGroupToDatabase = syncGroupToDatabase;
window.syncUserToDatabase = syncUserToDatabase;
window.syncAllDataToDatabase = syncAllDataToDatabase;
window.detectDatabaseSchema = detectDatabaseSchema;

// Enhanced sync management functions
window.forceSyncToDatabase = async function() {
    if (window.splitEasySync.isSyncing) {
        showNotificationSafe('Sync already in progress...', 'info');
        return;
    }

    if (window.splitEasySync.isOffline || !window.supabaseClient) {
        showNotificationSafe('Cannot sync - you are offline', 'error');
        return;
    }

    if (!window.currentUser) {
        showNotificationSafe('Please log in to sync data', 'error');
        return;
    }

    showNotificationSafe('Starting sync with schema detection...', 'info');
    await syncAllDataToDatabase();
};

window.getSyncStatus = function() {
    return {
        syncing: window.splitEasySync.isSyncing,
        online: !window.splitEasySync.isOffline,
        hasSupabase: !!window.supabaseClient,
        hasUser: !!window.currentUser,
        schemaDetected: window.splitEasySync.schemaChecked,
        canSync: !window.splitEasySync.isOffline && !!window.supabaseClient && !!window.currentUser && !window.splitEasySync.isSyncing,
        lastSync: window.splitEasySync.lastSyncTime || localStorage.getItem('lastsynctime'),
        schemaMapping: SCHEMA_MAPPING
    };
};

// Debug function for development
window.debugSync = function() {
    return {
        status: window.getSyncStatus(),
        groups: window.groups?.length || 0,
        user: window.currentUser?.name || 'Not logged in',
        offline: window.splitEasySync.isOffline,
        syncing: window.splitEasySync.isSyncing,
        schemaChecked: window.splitEasySync.schemaChecked,
        schemaMapping: SCHEMA_MAPPING,
        namespace: 'splitEasySync'
    };
};

console.log('✅ Database schema-aware SplitEasy sync system loaded successfully');