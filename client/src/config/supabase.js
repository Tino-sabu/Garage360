import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing required Supabase environment variables. Please check your .env file.')
}

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
