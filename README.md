# SplitEasy - Expense Splitting App

A modern expense splitting application built with vanilla JavaScript and Supabase. Split expenses with friends, roommates, or travel buddies easily!

## 📋 What is SplitEasy?

SplitEasy helps you:
- ✅ Create groups and split expenses
- ✅ Track who paid and who owes what
- ✅ Calculate balances automatically
- ✅ Sync data across devices with Supabase
- ✅ Works offline (Progressive Web App)

## 🚀 Quick Start Guide

### Step 1: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** → **API**
4. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long JWT token)

### Step 2: Configure the App

**Option A: Using Environment Variables (Recommended)**

1. Create a file named `.env` in the project root
2. Add your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Run this command to generate the config:
   ```bash
   npm run generate-config
   ```

**Option B: Manual Configuration (Quick Start)**

1. Create a file `js/config.js`
2. Add this code with your credentials:
   ```javascript
   window.SUPABASECONFIG = {
       url: 'https://your-project.supabase.co',
       anonKey: 'your-anon-key-here'
   };
   ```

### Step 3: Start the App

**Using Python (Easiest):**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npm run dev
```

**Using VS Code:**
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

### Step 4: Open in Browser

Open: **http://localhost:8000**

> ⚠️ **Important:** Don't just double-click `index.html` - you need a local server because:
> - Service Workers require `localhost` (not `file://`)
> - CORS restrictions for Supabase
> - Better localStorage support

## 📦 Setup Database

The app needs database tables. Check `DATABASE_SETUP.md` for detailed instructions.

**Quick Setup:**
1. Go to your Supabase project → **SQL Editor**
2. Run the SQL from `supabase-migration.sql`
3. Set up Row Level Security (RLS) policies from `supabase-rls-policies.sql`

## 🎯 How to Use

1. **Create an Account**
   - Enter your name
   - Choose a unique User ID (or generate one)
   - Click "Continue"

2. **Create a Group**
   - Click "Create New Group"
   - Enter group name (e.g., "Weekend Trip")
   - Add members (friends, roommates, etc.)
   - Click "Create Group"

3. **Add Expenses**
   - Open a group
   - Click "Add Expense"
   - Enter amount, who paid, and who should split
   - Save the expense

4. **View Balances**
   - See who owes what automatically
   - Track settlements
   - View expense history

## 📁 Project Structure

```
SplitEasy-Supabase/
├── index.html              # Main app page
├── group-detail.html       # Group details page
├── css/
│   └── style.css          # All styles
├── js/
│   ├── config.js          # Supabase config (create this)
│   ├── logger.js          # Logging system
│   ├── error-handler.js    # Error handling
│   ├── dom-utils.js       # DOM utilities
│   ├── app-state.js       # State management
│   ├── modal-utils.js     # Modal dialogs
│   ├── shared-utils.js    # Common utilities
│   ├── shared-supabase.js  # Supabase client
│   └── shared-sync.js     # Database sync
├── sw.js                  # Service Worker (PWA)
└── manifest.json          # PWA manifest
```

## 🔧 Deployment

### Deploy to GitHub Pages

1. **Set up GitHub Secrets:**
   - Go to your repo → **Settings** → **Secrets and variables** → **Actions**
   - Add secrets:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anon key

2. **Push to main branch:**
   - The GitHub Action will automatically:
     - Generate `js/config.js` from secrets
     - Deploy to GitHub Pages

> **Note:** `js/config.js` is gitignored and generated during deployment.

## 🔐 Security Notes

- ✅ `js/config.js` is gitignored (never commit it)
- ✅ `.env` is gitignored (local development only)
- ✅ GitHub Secrets used for production
- ⚠️ Never commit sensitive credentials

## 🛠️ Development

### Code Quality Features

- ✅ **Security**: XSS prevention, safe DOM manipulation
- ✅ **Accessibility**: ARIA labels, keyboard navigation
- ✅ **Performance**: DOM caching, optimized queries
- ✅ **Error Handling**: Centralized error management
- ✅ **Logging**: Environment-aware logging system

### Key Utilities

- `Logger` - Logging system (only logs in development)
- `DOMUtils` - Safe DOM manipulation with caching
- `AppState` - Centralized state management
- `ModalUtils` - Accessible modal dialogs
- `ErrorHandler` - Consistent error handling

## 📚 Documentation

- `DATABASE_SETUP.md` - Database setup instructions
- `OPTIMIZATION_SUMMARY.md` - Code optimization details
- `OPTIMIZATION_GUIDE.md` - How to use new utilities

## 🐛 Troubleshooting

**App won't load?**
- Make sure you're using a local server (not `file://`)
- Check browser console for errors
- Verify Supabase credentials in `js/config.js`

**Database errors?**
- Check if tables exist in Supabase
- Verify RLS policies are set up
- Check browser console for specific errors

**Service Worker issues?**
- Clear browser cache
- Use `window.clearAppCache()` in console
- Check if service worker is registered in DevTools

## 📝 License

This project is open source and available for personal and commercial use.

## 🙏 Support

For issues or questions, check the documentation files or open an issue in the repository.
