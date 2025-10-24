/**
 * Supabase Authentication Helper
 * This file provides helper functions for integrating Supabase Auth with your existing auth system
 */

const { supabase } = require('../config/database');

/**
 * Sign up a new user with Supabase Auth
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {object} metadata - Additional user metadata
 * @returns {object} User data or error
 */
async function signUpWithSupabase(email, password, metadata = {}) {
    if (!supabase) {
        console.warn('Supabase client not initialized. Using traditional auth.');
        return { error: null, useTraditionalAuth: true };
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata, // Additional user info like name, role, etc.
            },
        });

        if (error) {
            console.error('Supabase sign up error:', error.message);
            return { error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Supabase sign up exception:', err);
        return { error: err };
    }
}

/**
 * Sign in a user with Supabase Auth
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {object} Session data or error
 */
async function signInWithSupabase(email, password) {
    if (!supabase) {
        console.warn('Supabase client not initialized. Using traditional auth.');
        return { error: null, useTraditionalAuth: true };
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Supabase sign in error:', error.message);
            return { error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Supabase sign in exception:', err);
        return { error: err };
    }
}

/**
 * Sign out a user
 * @param {string} accessToken - User's access token
 * @returns {object} Result or error
 */
async function signOutWithSupabase(accessToken) {
    if (!supabase) {
        return { error: null, useTraditionalAuth: true };
    }

    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Supabase sign out error:', error.message);
            return { error };
        }

        return { error: null };
    } catch (err) {
        console.error('Supabase sign out exception:', err);
        return { error: err };
    }
}

/**
 * Get user from access token
 * @param {string} accessToken - JWT access token
 * @returns {object} User data or error
 */
async function getUserFromToken(accessToken) {
    if (!supabase) {
        return { error: null, useTraditionalAuth: true };
    }

    try {
        const { data, error } = await supabase.auth.getUser(accessToken);

        if (error) {
            console.error('Supabase get user error:', error.message);
            return { error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Supabase get user exception:', err);
        return { error: err };
    }
}

/**
 * Update user metadata
 * @param {string} userId - User's ID
 * @param {object} metadata - Metadata to update
 * @returns {object} Result or error
 */
async function updateUserMetadata(userId, metadata) {
    if (!supabase) {
        return { error: null, useTraditionalAuth: true };
    }

    try {
        const { data, error } = await supabase.auth.updateUser({
            data: metadata,
        });

        if (error) {
            console.error('Supabase update user error:', error.message);
            return { error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Supabase update user exception:', err);
        return { error: err };
    }
}

/**
 * Reset password via email
 * @param {string} email - User's email
 * @returns {object} Result or error
 */
async function resetPassword(email) {
    if (!supabase) {
        return { error: null, useTraditionalAuth: true };
    }

    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.CORS_ORIGIN}/reset-password`,
        });

        if (error) {
            console.error('Supabase password reset error:', error.message);
            return { error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Supabase password reset exception:', err);
        return { error: err };
    }
}

/**
 * Verify if Supabase is properly configured
 * @returns {boolean} True if configured, false otherwise
 */
function isSupabaseConfigured() {
    return supabase !== null;
}

module.exports = {
    signUpWithSupabase,
    signInWithSupabase,
    signOutWithSupabase,
    getUserFromToken,
    updateUserMetadata,
    resetPassword,
    isSupabaseConfigured,
};
