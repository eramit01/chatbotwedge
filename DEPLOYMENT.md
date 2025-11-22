# Deployment Guide for Spa Bot System

## 🚀 Deploying to Render (Backend API)

### Option 1: Using Render Dashboard (Recommended)

1. **Go to Render Dashboard** → New → Web Service

2. **Connect Repository**
   - Connect your GitHub repository
   - Select the repository: `AutoReplySaas` (or your repo name)

3. **Configure Service Settings:**
   ```
   Name: spa-bot-api
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Root Directory: spa-bot-system/server
   ```

4. **Build & Start Commands:**
   ```
   Build Command: npm install
   Start Command: npm start
   ```

5. **Environment Variables** (Add these in Render dashboard):
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/spa-bot
   JWT_SECRET=your-super-secret-jwt-key-here
   ADMIN_EMAIL=admin@spa.com
   ADMIN_PASSWORD=admin123
   ALLOWED_ORIGINS=https://your-admin-domain.com,https://your-chatbot-domain.com,http://localhost:5173,http://localhost:4173
   ```

6. **Click "Create Web Service"**

7. **Wait for deployment** - Render will:
   - Install dependencies
   - Start the server
   - Give you a URL like: `https://spa-bot-api.onrender.com`

8. **Test the API:**
   - Visit: `https://your-api-url.onrender.com/health`
   - Should return: `{"status":"ok"}`

---

## 🌐 Deploying Admin Panel (Netlify)

1. **Go to Netlify** → Add new site → Import from Git

2. **Select Repository**

3. **Build Settings:**
   ```
   Base directory: spa-bot-system/client
   Build command: npm install && npm run build
   Publish directory: spa-bot-system/client/dist
   ```

4. **Environment Variables:**
   ```
   VITE_API_URL=https://your-api-url.onrender.com/api
   ```

5. **Deploy** → Get URL like: `https://your-admin.netlify.app`

---

## 💬 Deploying Chatbot Widget (Netlify)

1. **Go to Netlify** → Add new site → Import from Git

2. **Select Repository**

3. **Build Settings:**
   ```
   Base directory: spa-bot-system/chatbot
   Build command: npm install && npm run build
   Publish directory: spa-bot-system/chatbot/dist
   ```

4. **Environment Variables:**
   ```
   VITE_API_URL=https://your-api-url.onrender.com/api
   ```

5. **Deploy** → Get URL like: `https://your-chatbot.netlify.app`

6. **Important:** The `bot.js` file will be at:
   ```
   https://your-chatbot.netlify.app/bot.js
   ```

---

## 🔧 Fix Render Build Error

If you see the Rust/Cargo error, make sure:

1. **Root Directory is set correctly:**
   - In Render dashboard → Settings → Root Directory
   - Set to: `spa-bot-system/server`

2. **Environment is Node:**
   - Settings → Environment → Should be "Node"

3. **Build Command:**
   ```
   npm install
   ```

4. **Start Command:**
   ```
   npm start
   ```

---

## 📝 Embed Code for Websites

Once deployed, use this code on any website:

```html
<script>
  const spaId = "aurum-andheri"; // Replace with your spaId
  (function(){
    const s = document.createElement('script');
    s.src = 'https://your-chatbot.netlify.app/bot.js?spa=' + spaId;
    s.async = true;
    document.body.appendChild(s);
  })();
</script>
```

---

## ✅ Post-Deployment Checklist

- [ ] API health check works: `https://your-api.onrender.com/health`
- [ ] Admin panel loads and you can login
- [ ] Created at least one spa in admin panel
- [ ] Chatbot loads: `https://your-chatbot.netlify.app/?spa=your-spa-id`
- [ ] Test booking submission works
- [ ] Lead appears in admin panel
- [ ] Embed code works on test website

---

## 🐛 Troubleshooting

### Render keeps detecting Rust project:
- Go to Settings → Root Directory → Set to `spa-bot-system/server`
- Make sure there's a `package.json` in that directory

### CORS errors:
- Add your frontend URLs to `ALLOWED_ORIGINS` in Render environment variables
- Format: `https://domain1.com,https://domain2.com` (comma-separated, no spaces)

### MongoDB connection fails:
- Check `MONGO_URI` is correct
- Ensure MongoDB Atlas allows connections from Render's IP (0.0.0.0/0)

### Chatbot shows "temporarily unavailable":
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly in Netlify
- Test API endpoint directly: `https://your-api.onrender.com/api/spas/config/your-spa-id`

