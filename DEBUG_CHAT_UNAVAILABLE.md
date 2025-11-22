# Fix "Chat temporarily unavailable" Error

## 🔍 Step-by-Step Debugging

### Step 1: Open Browser Console

1. **Open your website** with the chatbot widget
2. **Press F12** to open DevTools
3. **Click Console tab**
4. **Look for `[SpaBot]` logs** - they show what's happening

### Step 2: Check Console Logs

Look for these messages:

#### ✅ Good Signs:
```
[SpaBot] Initializing with spaId: spa_5, baseUrl: https://boticon.vercel.app
[SpaBot] Fetching config from: https://api.yourdomain.com/api/spas/config/spa_5
[SpaBot] Config received: { spaId: "spa_5", ... }
```

#### ❌ Error Signs:

**Error 1: Missing spaId**
```
[SpaBot] Missing spaId. Please provide spaId in script URL
```
**Fix:** Check your embed code has `?spa=spa_5` in the URL

**Error 2: API 404 Not Found**
```
[SpaBot] Error fetching config: Error: Request failed with status code 404
```
**Fix:** 
- Verify spa exists in admin panel
- Check spaId spelling (case-sensitive)
- Test API: `https://api.yourdomain.com/api/spas/config/spa_5`

**Error 3: API 403 Forbidden**
```
[SpaBot] Error fetching config: Error: Request failed with status code 403
```
**Fix:**
- Go to admin panel → Spas
- Find your spa
- Enable "Active" toggle (should be green)

**Error 4: CORS Error**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Fix:**
- Add chatbot domain to backend `ALLOWED_ORIGINS`
- Restart backend server

**Error 5: Network Error**
```
Network Error / Connection refused
```
**Fix:**
- Verify backend API is running
- Check API URL is correct
- Test: `https://api.yourdomain.com/health`

### Step 3: Test API Directly

Open in browser:
```
https://api.yourdomain.com/api/spas/config/spa_5
```

**Expected:** JSON response with spa config
```json
{
  "spaId": "spa_5",
  "spaName": "Your Spa Name",
  "isActive": true,
  ...
}
```

**If 404:** Spa doesn't exist or wrong spaId
**If 403:** Spa exists but is inactive
**If 500:** Backend error - check server logs

### Step 4: Verify spaId

1. **Go to Admin Panel**
2. **Navigate to Spas page**
3. **Find your spa**
4. **Copy the exact `spaId`** (e.g., `spa_5`)
5. **Verify it matches** the embed code

### Step 5: Check Chatbot Environment

The chatbot needs to know your API URL. Check:

1. **If chatbot is built:**
   - API URL is baked into the build
   - Need to rebuild with correct `VITE_API_URL`

2. **Rebuild chatbot:**
   ```bash
   cd chatbot
   # Create/update .env file
   echo "VITE_API_URL=https://api.yourdomain.com/api" > .env
   npm run build
   ```

3. **Redeploy chatbot** with new build

### Step 6: Verify Embed Code

Your embed code should be:
```html
<script>
  const spaId = "spa_5";  <!-- Use your actual spaId -->
  (function(){
    const s = document.createElement('script');
    s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  })();
</script>
```

**Important:**
- ✅ Place in `<body>`, just before `</body>`
- ✅ Use correct spaId
- ✅ Use correct chatbot URL
- ✅ Only one embed code per page

## 🔧 Common Fixes

### Fix 1: Spa Not Active
1. Admin Panel → Spas
2. Find your spa
3. Toggle "Active" to ON (green)
4. Save

### Fix 2: Wrong API URL
1. Check chatbot `.env` file:
   ```
   VITE_API_URL=https://api.yourdomain.com/api
   ```
2. Rebuild chatbot:
   ```bash
   cd chatbot
   npm run build
   ```
3. Redeploy chatbot

### Fix 3: CORS Issue
1. Backend `.env` file:
   ```
   ALLOWED_ORIGINS=https://boticon.vercel.app,https://yourwebsite.com,*
   ```
2. Restart backend server

### Fix 4: Wrong spaId
1. Check admin panel for exact spaId
2. Update embed code with correct spaId
3. Save and refresh website

## 🧪 Quick Test Checklist

- [ ] Open browser console (F12)
- [ ] Check for `[SpaBot]` logs
- [ ] Test API: `https://api.yourdomain.com/api/spas/config/spa_5`
- [ ] Verify spa exists in admin panel
- [ ] Verify spa is active (toggle ON)
- [ ] Check embed code has correct spaId
- [ ] Check embed code has correct chatbot URL
- [ ] Verify chatbot is deployed and accessible
- [ ] Test chatbot directly: `https://boticon.vercel.app?spa=spa_5`

## 📝 What to Check in Console

1. **spaId extraction:**
   ```
   [SpaBot] Initializing with spaId: spa_5
   ```
   If missing → Check embed code URL

2. **API call:**
   ```
   [SpaBot] Fetching config from: https://api.yourdomain.com/api/spas/config/spa_5
   ```
   If wrong URL → Check `VITE_API_URL` and rebuild

3. **API response:**
   ```
   [SpaBot] Config received: { ... }
   ```
   If error → Check API endpoint and spa status

## 🚨 Still Not Working?

1. **Share console logs** - Copy all `[SpaBot]` messages
2. **Test API endpoint** - Share the response
3. **Check spa status** - Is it active in admin panel?
4. **Verify deployment** - Is chatbot accessible?

---

**Most Common Issue:** Spa is not active or API URL is wrong. Check these first!

