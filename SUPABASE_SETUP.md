# Garage360 - Supabase Setup Guide

This guide will help you connect your Garage360 application to Supabase.

## 🚀 Quick Start

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: garage360
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize (~2 minutes)

### Step 2: Get Your Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in the sidebar)
2. Navigate to **API** section
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
     ⚠️ **Keep service_role secret! Never expose it in client code!**

4. Navigate to **Database** section in Project Settings
5. Scroll down to **Connection String** section
6. Select **URI** and copy the connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres`
   - Replace `[YOUR-PASSWORD]` with your database password from Step 1

### Step 3: Configure Your Server

1. Navigate to your server directory:
   ```bash
   cd server
   ```

2. Update your `.env` file with Supabase credentials:
   ```bash
   # Supabase Configuration
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   SUPABASE_DB_URL=postgresql://postgres.your-project-ref:your-password@aws-0-region.pooler.supabase.com:5432/postgres
   
   # Other configurations
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   CORS_ORIGIN=http://localhost:3000
   ```

### Step 4: Set Up Database Schema

You'll need to create tables in your Supabase database. You have two options:

#### Option A: Using Supabase SQL Editor (Recommended)

1. In your Supabase dashboard, click on **SQL Editor** in the sidebar
2. Click **New Query**
3. Paste your SQL schema (create tables for customers, mechanics, vehicles, services, etc.)
4. Click **Run** to execute

#### Option B: Using Migration Script

If you have a migration script, run it:
```bash
npm run migrate
```

### Step 5: Test the Connection

Start your server:
```bash
npm run dev
```

Check the health endpoint:
```bash
curl http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "database": {
    "connected": true,
    "tablesReady": true
  }
}
```

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It contains sensitive keys
2. **Use service_role key only on server** - Never expose it to client
3. **Use anon key for client-side** - It's safe to expose
4. **Enable Row Level Security (RLS)** in Supabase for each table
5. **Set up proper authentication** using Supabase Auth

## 🎯 Enable Row Level Security (RLS)

For security, enable RLS on your tables:

```sql
-- Enable RLS on tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Example: Allow users to read only their own data
CREATE POLICY "Users can view own data" ON customers
  FOR SELECT USING (auth.uid() = user_id);

-- Example: Allow service role to do everything
CREATE POLICY "Service role can do everything" ON customers
  FOR ALL USING (auth.role() = 'service_role');
```

## 📱 Client-Side Setup (Optional)

If you want to use Supabase features on the client:

1. Install Supabase client:
   ```bash
   cd client
   npm install @supabase/supabase-js
   ```

2. Create a Supabase client file (`client/src/config/supabase.js`):
   ```javascript
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
   const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

3. Add to your `client/.env`:
   ```bash
   REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## 🔄 Migration from Local PostgreSQL

If you're migrating from local PostgreSQL:

1. **Export your local database**:
   ```bash
   pg_dump -U postgres -d garage360 -f garage360_backup.sql
   ```

2. **Import to Supabase** via SQL Editor or command line:
   ```bash
   psql -h db.xxxxxxxxxxxxx.supabase.co -U postgres -d postgres -f garage360_backup.sql
   ```

## 🐛 Troubleshooting

### Connection Issues

**Problem**: Cannot connect to database
**Solution**: 
- Check if SUPABASE_DB_URL is correct
- Verify your password doesn't contain special characters that need encoding
- Try using the pooler connection string (port 6543) instead of direct (port 5432)

### SSL Certificate Issues

**Problem**: SSL connection errors
**Solution**: The code already has `{ rejectUnauthorized: false }` configured

### Rate Limiting

**Problem**: Too many connections
**Solution**: Supabase free tier has connection limits. Consider:
- Using connection pooling (already configured)
- Upgrading to Pro plan for more connections

## 📚 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Database Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 🎉 Next Steps

1. ✅ Set up authentication using Supabase Auth
2. ✅ Configure RLS policies for data security
3. ✅ Set up real-time subscriptions if needed
4. ✅ Configure storage for file uploads (vehicle images, etc.)
5. ✅ Set up edge functions for serverless operations

## 💡 Benefits of Using Supabase

- ✨ **Free tier**: Generous free tier for development
- 🔒 **Built-in Auth**: Complete authentication system
- 📡 **Real-time**: Live database subscriptions
- 🗄️ **Storage**: File storage with CDN
- 🚀 **Edge Functions**: Serverless functions
- 📊 **Dashboard**: Visual database management
- 🔐 **RLS**: Row Level Security built-in
- 🌍 **Global CDN**: Fast worldwide access

---

Need help? Check the [Supabase Community](https://github.com/supabase/supabase/discussions) or create an issue in this repository.
