# Fix 404 Error: Spa Not Found

## 🔍 The Problem

The error shows:
```
Failed to load resource: the server responded with a status of 404
GET https://bot-backend-u2n1.onrender.com/api/spas/config/spa_5
```

This means: **The spa with ID `spa_5` doesn't exist in your database.**

## ✅ Solution Steps

### Step 1: Verify Spa Exists in Admin Panel

1. **Go to your Admin Panel**
   - URL: Your admin panel URL
   - Login if needed

2. **Navigate to Spas Page**
   - Click on "Spas" in the sidebar

3. **Check if `spa_5` exists:**
   - Look for a spa with `spaId: "spa_5"`
   - **Note:** The `spaId` field is case-sensitive and must match exactly

### Step 2: Check the Exact spaId

The `spaId` in your embed code must **exactly match** the `spaId` in the database.

**Common Issues:**
- ❌ `spa_5` vs `spa-5` (underscore vs hyphen)
- ❌ `spa_5` vs `Spa_5` (case sensitivity)
- ❌ `spa_5` vs `spa5` (missing underscore)

### Step 3: Create or Verify the Spa

**If spa doesn't exist:**

1. **Create a new spa:**
   - Click "Add New Spa" or "+" button
   - Fill in the form:
     - **spaId:** `spa_5` (exactly as in embed code)
     - **spaName:** Your spa name
     - **isActive:** Toggle ON (green)
     - Fill other fields
   - **Save**

**If spa exists but wrong ID:**

1. **Edit the spa:**
   - Click on the spa card
   - Check the `spaId` field
   - Update it to match your embed code: `spa_5`
   - Ensure **isActive** is ON
   - **Save**

### Step 4: Test the API Endpoint

After creating/updating the spa, test the API:

**Open in browser:**
```
https://bot-backend-u2n1.onrender.com/api/spas/config/spa_5
```

**Expected Response (if spa exists and is active):**
```json
{
  "spaId": "spa_5",
  "spaName": "Your Spa Name",
  "isActive": true,
  "botName": "...",
  "services": [...],
  ...
}
```

**If still 404:**
- Spa doesn't exist → Create it
- Wrong spaId → Check spelling
- Database issue → Check backend logs

**If 403:**
- Spa exists but `isActive: false` → Enable it in admin panel

### Step 5: Update Embed Code (if needed)

If you changed the spaId, update your embed code:

```html
<script>
  const spaId = "spa_5";  <!-- Use the exact spaId from admin panel -->
  (function(){
    const s = document.createElement('script');
    s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  })();
</script>
```

## 🔧 Quick Fix Checklist

- [ ] Go to Admin Panel → Spas
- [ ] Check if spa with `spa_5` exists
- [ ] If not, create it with `spaId: "spa_5"`
- [ ] Ensure `isActive` toggle is ON (green)
- [ ] Test API: `https://bot-backend-u2n1.onrender.com/api/spas/config/spa_5`
- [ ] Should return JSON (not 404)
- [ ] Refresh your website
- [ ] Chatbot should work now

## 🐛 Still Getting 404?

### Check Backend Logs

1. **Go to Render Dashboard**
2. **Check your backend service logs**
3. **Look for database connection errors**
4. **Verify MongoDB is connected**

### Verify Database Connection

The backend needs to connect to MongoDB. Check:
- MongoDB connection string is correct
- MongoDB is accessible
- Database has the spas collection

### Test Other Endpoints

Test if backend is working:
```
https://bot-backend-u2n1.onrender.com/health
```
Should return: `{"status":"ok"}`

If this fails, your backend is down.

## 📝 Most Common Cause

**99% of the time:** The spa with ID `spa_5` doesn't exist in your database.

**Solution:** Create it in the admin panel with the exact `spaId: "spa_5"`

---

**After creating the spa, the chatbot should work!** 🎉

