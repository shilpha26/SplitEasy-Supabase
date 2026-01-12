# SplitEasy - Expense Splitting App

A modern, offline-first expense splitting application built with vanilla JavaScript and Supabase.

## 🚀 Quick Start

### Option 1: Python (Easiest)
```bash
cd SplitEasy-Supabase
python -m http.server 8000
```
Open: http://localhost:8000

### Option 2: Node.js
```bash
npm install -g http-server
cd SplitEasy-Supabase
http-server -p 8000
```

### Option 3: VS Code
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

## ⚠️ Important

**Do NOT** just double-click `index.html` - you need a local web server because:
- Service Workers require `localhost` (not `file://`)
- CORS restrictions for Supabase
- Better localStorage support

## 📋 Features

- ✅ Create groups and split expenses
- ✅ Real-time balance calculations
- ✅ Offline support with localStorage
- ✅ Supabase cloud sync (optional)
- ✅ Progressive Web App (PWA)
- ✅ Mobile-optimized UI

## 🔧 Configuration

### Supabase Setup (Optional)

The app works offline, so Supabase is optional. If you want to use Supabase:

1. Copy `js/config.example.js` to `js/config.js`
2. Add your Supabase URL and anon key to `js/config.js`
3. `js/config.js` is in `.gitignore` and won't be committed

**Note:** `js/config.js` contains sensitive credentials and is excluded from version control.

## 📁 Project Structure

- `index.html` - Main page
- `group-detail.html` - Group details
- `js/shared-utils.js` - Optimized utilities
- `js/shared-supabase.js` - Supabase config
- `js/shared-sync.js` - Database sync
- `css/style.css` - All styles
- `sw.js` - Service Worker

## 🎯 Recent Optimizations

See [OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md) for performance improvements.