# Verify Spa Exists - Step by Step

## 🔍 The Problem

You're getting 404 for `spa_1`, which means the spa doesn't exist in your database OR the `spaId` field doesn't match.

## ✅ Step-by-Step Verification

### Step 1: Check Admin Panel

1. **Go to your Admin Panel**
   - Login if needed

2. **Navigate to Spas Page**
   - Click "Spas" in sidebar

3. **Find Your Spa**
   - Look at the spa card/list
   - **Check the `spaId` field** - this is critical!

### Step 2: Verify the Exact spaId

**Important:** The `spaId` field must match EXACTLY (case-sensitive, no spaces).

**Common Issues:**
- ❌ `spa_1` vs `Spa_1` (case difference)
- ❌ `spa_1` vs `spa-1` (underscore vs hyphen)
- ❌ `spa_1` vs `spa1` (missing underscore)
- ❌ `spa_1` vs `spa_ 1` (extra space)

### Step 3: Check What You See in Admin Panel

**Look at your spa card and find:**
- **spaId field** - What does it say exactly?
- **Is it `spa_1`?** Or something else like:
  - `test_1`
  - `spa1`
  - `Spa_1`
  - Something else?

### Step 4: Test the API with Your Exact spaId

Once you know the exact `spaId` from admin panel, test:

**If spaId is `spa_1`:**
```
https://bot-backend-u2n1.onrender.com/api/spas/config/spa_1
```

**If spaId is something else (e.g., `test_1`):**
```
https://bot-backend-u2n1.onrender.com/api/spas/config/test_1
```

**Expected:** JSON response with spa config
**If 404:** Spa doesn't exist with that ID

### Step 5: Update Embed Code with Correct spaId

Use the EXACT `spaId` from your admin panel:

```html
<script>
  const spaId = "YOUR_EXACT_SPA_ID_HERE";  <!-- Use what you see in admin panel -->
  (function(){
    const s = document.createElement('script');
    s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  })();
</script>
```

## 🔧 Quick Fix Options

### Option A: Use Existing Spa

1. **Check admin panel** for the exact `spaId`
2. **Update embed code** to use that exact `spaId`
3. **Test API** with that `spaId`
4. **Refresh website**

### Option B: Create New Spa with spa_1

1. **Go to Admin Panel → Spas**
2. **Click "Add New Spa"**
3. **Fill in form:**
   - **spaId:** `spa_1` (exactly)
   - **spaName:** Your spa name
   - **isActive:** Toggle ON (green)
   - Fill other fields
4. **Save**
5. **Test API:** `https://bot-backend-u2n1.onrender.com/api/spas/config/spa_1`
6. **Should return JSON** (not 404)

### Option C: Edit Existing Spa

1. **Go to Admin Panel → Spas**
2. **Click on your existing spa**
3. **Edit the `spaId` field** to `spa_1`
4. **Ensure `isActive` is ON**
5. **Save**
6. **Test API**

## 🧪 Test Checklist

- [ ] Open Admin Panel → Spas
- [ ] Find your spa
- [ ] Copy the EXACT `spaId` (check spelling, case, underscores)
- [ ] Test API: `https://bot-backend-u2n1.onrender.com/api/spas/config/YOUR_SPA_ID`
- [ ] Should return JSON (not 404)
- [ ] Update embed code with exact `spaId`
- [ ] Refresh website
- [ ] Chatbot should work

## 📝 What to Share

If still not working, share:
1. **What `spaId` you see in admin panel** (exact text)
2. **API test result** (what you see when visiting the API URL)
3. **Screenshot of spa card** (if possible)

---

**Most likely:** The `spaId` in your database is different from `spa_1`. Check admin panel and use the exact value!

