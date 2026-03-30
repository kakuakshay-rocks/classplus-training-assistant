# Classplus Training Assistant — AI Agent

An AI-powered training assistant with a separate **admin backend** (for managing content) and **user frontend** (for asking questions).

## Pages

| URL | Purpose | Access |
|-----|---------|--------|
| `/` (index.html) | **User Frontend** — Home page + AI Chat | Public (all users) |
| `/admin.html` | **Admin Backend** — Add, edit, delete learnings | Password protected |

## Features

### User Frontend (`/`)
- **Home Page** with hero section, feature highlights, and clickable topic chips
- **AI Chat** — ask questions and get answers from your knowledge base
- **Home button** in navbar to return to the home page anytime
- Clean, read-only — users cannot edit content

### Admin Backend (`/admin.html`)
- **Password-protected** login screen
- **Dashboard** with stats (total learnings, categories, word count)
- **Add / Edit / Delete** learnings with title, category, description, and full content
- **Search & filter** by category
- **Import / Export** knowledge base as JSON
- **View Site** button to jump to the user frontend
- Default password: `classplus2026` (change it in admin.html)

## Project Structure

```
classplus-training-assistant/
├── index.html                    ← User frontend (Home + AI Chat)
├── admin.html                    ← Admin backend (manage learnings)
├── netlify.toml                  ← Netlify deployment config
├── package.json                  ← Dependencies
├── README.md
└── netlify/
    └── functions/
        └── chat.js               ← Serverless function (Anthropic API proxy)
```

## Deployment to Netlify

### Step 1: Get an Anthropic API Key
- Go to [console.anthropic.com](https://console.anthropic.com)
- Create an account and generate an API key

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/classplus-training-assistant.git
git push -u origin main
```

### Step 3: Deploy on Netlify
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repo
4. Build settings auto-configure from `netlify.toml`
5. Click **"Deploy site"**

### Step 4: Add Your API Key
1. In Netlify: **Site Settings** → **Environment Variables**
2. Add: `ANTHROPIC_API_KEY` = your key
3. **Deploys** → **Trigger deploy** → **Deploy site**

### Step 5: Change Admin Password
Open `admin.html` and change this line:
```javascript
const ADMIN_PASSWORD = 'classplus2026';  // ← Change this!
```
Commit and push — Netlify will auto-redeploy.

## How to Add Learnings

1. Go to `yoursite.netlify.app/admin.html`
2. Enter the admin password
3. Click **＋ Add Learning**
4. Fill in title, category, description, and full content
5. Click **Save Learning**

The AI immediately picks up new content — no redeploy needed!

## Tips

- **Be detailed** in the content field — the more context you provide, the better the AI answers
- **Use categories** to organize content (Product, Sales, Support, Onboarding, General)
- **Export regularly** to backup your knowledge base
- **Import** to restore or share content between environments
- Data is stored in localStorage — use Export/Import to transfer between devices
"# classplus-training-assistant" 
