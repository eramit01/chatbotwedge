# Complete Widget Loading Flow - Debugging & Fix Guide

## 🏗️ Architecture Overview

Your chatbot system has **3 separate components**:

1. **Admin Panel** (`client/`) - React app for managing spas
2. **Backend API** (`server/`) - Node.js/Express server with MongoDB
3. **Chatbot Widget** (`chatbot/`) - React app that runs inside an iframe

## 📋 Complete Widget Loading Flow

### Step 1: Embed Script Execution
When a website includes your embed code:
```html
<script>
  const spaId = "spa_3";
  (function(){
    const s = document.createElement('script');
    s.src = 'https://chatbot.yourdomain.com/bot.js?spa=' + spaId;
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  })();
</script>
```

**What happens:**
- Script tag is created and added to the page
- Browser fetches `bot.js` from your chatbot domain
- `bot.js` executes immediately

### Step 2: bot.js Script Execution
The `bot.js` script:
1. Extracts `spaId` from the URL query parameter (`?spa=spa_3`)
2. Extracts `baseUrl` from its own script src (e.g., `https://chatbot.yourdomain.com`)
3. Creates a container `<div id="spa-bot-root">`
4. Creates an `<iframe>` pointing to `${baseUrl}?spa=${spaId}`
5. Appends iframe to container, container to body

**Example iframe src:** `https://chatbot.yourdomain.com?spa=spa_3`

### Step 3: Chatbot React App Loads
The iframe loads your chatbot React app:
1. React app reads `spaId` from URL: `new URLSearchParams(window.location.search).get("spa")`
2. React app fetches spa config: `GET /api/spas/config/${spaId}`
3. React app renders the BookingBot component with the config
4. Widget appears in the iframe

## 🔍 Step-by-Step Debugging

### Issue 1: Script Not Loading

**Symptoms:**
- No console logs from `[SpaBot]`
- No iframe appears on page

**Debug Steps:**
1. Open browser DevTools → Network tab
2. Look for request to `bot.js`
3. Check if request succeeds (200) or fails (404, 403, CORS error)

**Common Causes:**
- ❌ Wrong URL in embed code
- ❌ `bot.js` file not deployed to chatbot domain
- ❌ CORS blocking script load
- ❌ Wrong MIME type (should be `application/javascript`)

**Fix:**
```bash
# Verify bot.js is accessible
curl -I https://chatbot.yourdomain.com/bot.js

# Should return:
# HTTP/1.1 200 OK
# Content-Type: application/javascript
```

### Issue 2: Iframe Not Appearing

**Symptoms:**
- Console shows `[SpaBot] Initializing...` but no widget

**Debug Steps:**
1. Check browser console for errors
2. Verify `spaId` is extracted correctly:
   ```javascript
   // In browser console:
   console.log(window.SpaBot); // Should show { spaId: "spa_3", baseUrl: "..." }
   ```
3. Check if container exists:
   ```javascript
   document.getElementById('spa-bot-root'); // Should return element
   ```

**Common Causes:**
- ❌ `spaId` missing or invalid
- ❌ `baseUrl` incorrectly extracted
- ❌ DOM not ready when script executes
- ❌ CSS hiding the widget (z-index, display: none)

**Fix:**
- Ensure embed code includes `spaId` in URL
- Check that chatbot domain is correct
- Verify chatbot React app is deployed and accessible

### Issue 3: Iframe Loads But Shows Blank/Error

**Symptoms:**
- Iframe appears but is blank or shows error

**Debug Steps:**
1. Right-click iframe → Inspect Element
2. Check iframe `src` attribute
3. Open iframe URL directly in new tab: `https://chatbot.yourdomain.com?spa=spa_3`
4. Check browser console inside iframe (DevTools → Console → Select iframe context)

**Common Causes:**
- ❌ Chatbot React app not deployed
- ❌ React app fails to load (404 on assets)
- ❌ `spaId` not passed correctly to React app
- ❌ API call fails (CORS, 404, network error)

**Fix:**
```bash
# Test chatbot URL directly
curl https://chatbot.yourdomain.com?spa=spa_3

# Test API endpoint
curl https://api.yourdomain.com/api/spas/config/spa_3
```

### Issue 4: API Call Fails

**Symptoms:**
- React app loads but shows "Chat temporarily unavailable"
- Console shows API error

**Debug Steps:**
1. Check Network tab for `/api/spas/config/${spaId}` request
2. Verify request URL is correct
3. Check response status (200, 404, 403, 500)
4. Check CORS headers in response

**Common Causes:**
- ❌ Wrong `VITE_API_URL` in chatbot build
- ❌ CORS not allowing chatbot domain
- ❌ `spaId` doesn't exist in database
- ❌ Spa is inactive (`isActive: false`)

**Fix:**
```javascript
// In chatbot/.env (before building):
VITE_API_URL=https://api.yourdomain.com/api

// In server/.env:
ALLOWED_ORIGINS=https://chatbot.yourdomain.com,https://admin.yourdomain.com,*
```

### Issue 5: CORS Errors

**Symptoms:**
- Console shows: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Debug Steps:**
1. Check request headers in Network tab
2. Check response headers for `Access-Control-Allow-Origin`
3. Verify backend CORS configuration

**Fix:**
```javascript
// In server/server.js - ensure chatbot domain is in allowed origins
ALLOWED_ORIGINS=https://chatbot.yourdomain.com,https://admin.yourdomain.com,*
```

## 🛠️ Production Deployment Checklist

### 1. Backend API Deployment

```bash
# Environment Variables (.env)
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret
ADMIN_EMAIL=admin@spa.com
ADMIN_PASSWORD=secure-password
ALLOWED_ORIGINS=https://chatbot.yourdomain.com,https://admin.yourdomain.com,*
```

**Test:**
```bash
curl https://api.yourdomain.com/health
# Should return: {"status":"ok"}

curl https://api.yourdomain.com/api/spas/config/spa_3
# Should return spa config JSON
```

### 2. Chatbot Widget Deployment

**Before Building:**
```bash
cd chatbot
# Create .env file
echo "VITE_API_URL=https://api.yourdomain.com/api" > .env
```

**Build:**
```bash
npm install
npm run build
```

**Verify Build Output:**
```bash
ls -la dist/
# Should see:
# - bot.js (standalone script)
# - index.html
# - assets/ (CSS, JS, images)
```

**Deploy:**
- Upload entire `dist/` folder contents to chatbot domain root
- Ensure `bot.js` is in root directory (not in subfolder)

**Test:**
```bash
# Test bot.js loads
curl -I https://chatbot.yourdomain.com/bot.js
# Should return: Content-Type: application/javascript

# Test chatbot app loads
curl https://chatbot.yourdomain.com?spa=spa_3
# Should return HTML with React app
```

### 3. Admin Panel Configuration

**Update Embed Code URL:**
```javascript
// In client/.env
VITE_CHATBOT_URL=https://chatbot.yourdomain.com
```

**Rebuild and deploy admin panel**

## 🧪 Testing the Complete Flow

### Test 1: Direct Chatbot Access
1. Visit: `https://chatbot.yourdomain.com?spa=spa_3`
2. Should see chatbot interface
3. Should be able to complete booking

### Test 2: bot.js Script Load
1. Create test HTML file:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Widget</title>
</head>
<body>
  <h1>Test Page</h1>
  <script>
    const spaId = "spa_3";
    (function(){
      const s = document.createElement('script');
      s.src = 'https://chatbot.yourdomain.com/bot.js?spa=' + spaId;
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    })();
  </script>
</body>
</html>
```
2. Open in browser
3. Widget should appear in bottom-right corner

### Test 3: Full Integration
1. Add embed code to a real website
2. Verify widget loads
3. Test booking flow
4. Verify lead appears in admin panel

## 🐛 Common Error Messages & Fixes

### Error: `[SpaBot] Missing spaId`
**Fix:** Ensure embed code includes `?spa=YOUR_SPA_ID` in script URL

### Error: `Failed to load iframe`
**Fix:** 
- Verify chatbot domain is accessible
- Check if React app is deployed
- Verify no CORS/security policies blocking iframe

### Error: `Spa not found` (404)
**Fix:**
- Verify `spaId` exists in database
- Check database connection
- Verify API endpoint: `/api/spas/config/:spaId`

### Error: `Spa is not active` (403)
**Fix:**
- Go to admin panel
- Find the spa
- Enable "Active" toggle

### Error: `CORS policy blocked`
**Fix:**
- Add chatbot domain to `ALLOWED_ORIGINS` in backend
- Restart backend server
- Clear browser cache

## 📝 Embed Code Best Practices

### Correct Embed Code Format:
```html
<script>
  const spaId = "spa_3";
  (function(){
    const s = document.createElement('script');
    s.src = 'https://chatbot.yourdomain.com/bot.js?spa=' + spaId;
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  })();
</script>
```

### Where to Place:
- **Before `</body>` tag** (recommended)
- Or in `<head>` section (will load after DOM ready)

### Important Notes:
- ✅ Always use HTTPS in production
- ✅ Don't include trailing slash in chatbot URL
- ✅ Use `async` and `defer` attributes
- ✅ Ensure `spaId` matches exactly (case-sensitive)

## 🔒 Security Considerations

1. **CORS Configuration:**
   - Only allow specific domains in production
   - Use `*` only for development

2. **API Authentication:**
   - Config endpoint (`/api/spas/config/:spaId`) is public (needed for widget)
   - Other endpoints require authentication

3. **Iframe Embedding:**
   - Widget is designed to be embedded anywhere
   - No sensitive data exposed in widget

## 📊 Monitoring & Logging

### Backend Logs:
- Check for API requests: `GET /api/spas/config/:spaId`
- Monitor error rates
- Track response times

### Frontend Debugging:
- Use browser DevTools Console
- Look for `[SpaBot]` prefixed logs
- Check Network tab for failed requests

### Production Monitoring:
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor API health endpoint
- Track widget load success rate

## ✅ Final Verification Checklist

- [ ] Backend API accessible: `https://api.yourdomain.com/health`
- [ ] Spa config endpoint works: `https://api.yourdomain.com/api/spas/config/spa_3`
- [ ] Chatbot app accessible: `https://chatbot.yourdomain.com?spa=spa_3`
- [ ] bot.js loads: `https://chatbot.yourdomain.com/bot.js`
- [ ] Embed code works on test page
- [ ] Widget appears and functions correctly
- [ ] Booking submission works
- [ ] Lead appears in admin panel
- [ ] No console errors
- [ ] Works on mobile devices
- [ ] Works in different browsers (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Fix Commands

```bash
# Rebuild chatbot
cd chatbot
npm run build

# Test API
curl https://api.yourdomain.com/api/spas/config/spa_3

# Test bot.js
curl -I https://chatbot.yourdomain.com/bot.js

# Check if spa exists
# (Use MongoDB shell or admin panel)
```

---

**Need Help?** Check browser console for `[SpaBot]` logs - they provide detailed debugging information!

