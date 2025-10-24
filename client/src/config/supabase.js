import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://gddblbotzusdpeyedola.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzAxMDQsImV4cCI6MjA3NjgwNjEwNH0.czVjg7ZEljTfV_1TJRWsyl271gB7O8hgG96u5BVhTgE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to execute SQL queries
export const query = async (sql, params = []) => {
    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            query: sql,
            params: params
        })

        if (error) throw error
        return { rows: data, error: null }
    } catch (err) {
        console.error('Query error:', err)
        return { rows: [], error: err }
    }
}

export default supabase
