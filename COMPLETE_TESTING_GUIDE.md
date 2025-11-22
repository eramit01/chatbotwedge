# Complete Testing Guide - Spa Bot System

This guide provides step-by-step instructions to test the entire system and ensure everything works properly.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** installed (v18 or higher)
- [ ] **MongoDB** running locally or MongoDB Atlas connection string
- [ ] **Git** installed
- [ ] Three terminal windows/tabs available

---

## 🚀 Step 1: Environment Setup

### 1.1 Server Environment

Create `server/.env` file:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/spa-bot
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/spa-bot

# Server Port
PORT=5000

# Admin Credentials (optional - defaults provided)
ADMIN_EMAIL=admin@spa.com
ADMIN_PASSWORD=admin123

# CORS Allowed Origins (comma-separated, no spaces)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173,https://yourdomain.com
```

### 1.2 Client Environment

Create `client/.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Chatbot URL (for embed code generation)
VITE_CHATBOT_URL=https://boticon.vercel.app
# Or for local testing:
# VITE_CHATBOT_URL=http://localhost:4173
```

### 1.3 Chatbot Environment

Create `chatbot/.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

---

## 🔧 Step 2: Install Dependencies

Open three terminal windows and run:

**Terminal 1 - Server:**
```bash
cd spa-bot-system/server
npm install
```

**Terminal 2 - Client:**
```bash
cd spa-bot-system/client
npm install
```

**Terminal 3 - Chatbot:**
```bash
cd spa-bot-system/chatbot
npm install
```

---

## 🏃 Step 3: Start All Services

### 3.1 Start MongoDB

**Windows:**
```bash
# If MongoDB is installed as a service, it should start automatically
# Or start manually:
mongod
```

**Mac/Linux:**
```bash
# If installed via Homebrew:
brew services start mongodb-community
# Or:
sudo systemctl start mongod
```

**Verify MongoDB is running:**
```bash
mongosh
# Should connect successfully
```

### 3.2 Start Backend Server

**Terminal 1:**
```bash
cd spa-bot-system/server
npm run dev
```

**Expected Output:**
```
MongoDB connected
Seeded default admin (admin@spa.com)
Server running on port 5000
Allowed CORS origins: [list of origins]
```

**Test Server:**
```bash
# In a new terminal or browser:
curl http://localhost:5000/health
# Should return: {"status":"ok"}
```

### 3.3 Start Admin Panel (Client)

**Terminal 2:**
```bash
cd spa-bot-system/client
npm run dev
```

**Expected Output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open in Browser:**
- URL: `http://localhost:5173`
- Should show login page

### 3.4 Start Chatbot

**Terminal 3:**
```bash
cd spa-bot-system/chatbot
npm run dev
```

**Expected Output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

**Note:** Chatbot will run on port 5174 (or next available port)

---

## ✅ Step 4: Test Admin Panel

### 4.1 Login Test

1. **Open:** `http://localhost:5173`
2. **Login Credentials:**
   - Email: `admin@spa.com`
   - Password: `admin123`
3. **Expected:** Redirect to Dashboard

**Check Browser Console (F12):**
- No errors should appear
- Network tab should show successful API calls

### 4.2 Dashboard Test

1. **Verify Dashboard loads:**
   - Should show stats cards
   - Should show recent leads (if any)
   - Should show spa count

2. **Check for errors:**
   - Open Browser Console (F12)
   - No red errors should appear
   - API calls should return 200 status

### 4.3 Spas Page Test

1. **Navigate to Spas page:**
   - Click "Spas" in sidebar
   - URL should be: `http://localhost:5173/spas`

2. **Test Loading State:**
   - Should show "Loading spas..." initially
   - Then show spa cards or "No spas found" message

3. **Test Create Spa:**
   - Click "Add Spa" button
   - Fill in the form:
     - **Spa ID:** `test-spa-1` (must be unique)
     - **Spa Name:** `Test Spa 1`
     - **Bot Name:** `Ava` (optional)
     - **Services:** Click "Add Service" and add at least one:
       - Title: `Facial`
       - Price Range: `₹1,500 - ₹2,500`
       - Duration: `60 min`
     - **Is Active:** Check the checkbox
   - Click "Save Spa"
   - **Expected:** Form closes, spa appears in list

4. **Test Edit Spa:**
   - Click edit icon (pencil) on a spa card
   - Modify some fields
   - Click "Save Spa"
   - **Expected:** Changes saved, form closes

5. **Test Toggle Active/Inactive:**
   - Click the toggle switch on a spa card
   - **Expected:** Status changes immediately

6. **Test Embed Code:**
   - Click "Embed Code" button on a spa card
   - **Expected:** Embed code section appears below
   - Click "Copy" button
   - **Expected:** Code copied to clipboard

7. **Test Delete Spa:**
   - Click delete icon (trash) on a spa card
   - **Expected:** Spa removed from list

8. **Test Error Handling:**
   - Try creating spa with duplicate Spa ID
   - **Expected:** Error message appears
   - Try creating spa without required fields
   - **Expected:** Validation error

### 4.4 Leads Page Test

1. **Navigate to Leads page:**
   - Click "Leads" in sidebar
   - URL should be: `http://localhost:5173/leads`

2. **Test Loading State:**
   - Should show "Loading leads..." initially
   - Then show leads table or "No leads found" message

3. **Test Filters:**
   - Select a spa from dropdown
   - **Expected:** Table filters to show only that spa's leads
   - Select "All Spas"
   - **Expected:** Shows all leads

4. **Test Date Filters:**
   - Select "From" date
   - **Expected:** Filters leads from that date
   - Select "To" date
   - **Expected:** Filters leads up to that date

5. **Test Export CSV:**
   - Click "Export CSV" button
   - **Expected:** CSV file downloads with leads data

6. **Test Empty State:**
   - If no leads exist, should show "No leads found" message

---

## 🤖 Step 5: Test Chatbot Integration

### 5.1 Direct Chatbot Access Test

1. **Open chatbot directly:**
   - URL: `http://localhost:5174/?spa=test-spa-1`
   - Replace `test-spa-1` with your actual spa ID

2. **Expected Behavior:**
   - Chatbot interface loads
   - Bot name and image from spa config appear
   - Welcome message shows
   - Services are listed

3. **Test Chat Flow:**
   - Click on a service
   - Fill in booking form (name, phone)
   - Submit booking
   - **Expected:** Success message, lead created

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Console should show:
     - `[SpaBot] Fetching config from: http://localhost:5000/api/spas/config/test-spa-1`
     - `[SpaBot] Config received: [spa config object]`
   - No errors should appear

### 5.2 Bot Widget Integration Test

1. **Create test HTML file:**
   - Create `test-bot-integration.html` in project root:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bot Integration Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        h1 {
            color: #333;
        }
        .info {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h1>Bot Integration Test Page</h1>
    <div class="info">
        <p>This page tests the bot widget integration.</p>
        <p>You should see a bot widget in the bottom-right corner.</p>
    </div>
    
    <h2>Test Content</h2>
    <p>Scroll down to test the bot widget visibility.</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
    
    <!-- Bot Integration Script -->
    <script>
      const spaId = "test-spa-1"; // Replace with your spa ID
      (function(){
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', loadBot);
        } else {
          loadBot();
        }
        
        function loadBot() {
          const s = document.createElement('script');
          s.src = 'http://localhost:5174/bot.js?spa=' + spaId;
          s.async = true;
          document.body.appendChild(s);
        }
      })();
    </script>
</body>
</html>
```

2. **Open test file:**
   - Open `test-bot-integration.html` in browser
   - Or serve it with a local server:
     ```bash
     # Python
     python -m http.server 8000
     # Or Node.js
     npx http-server -p 8000
     ```
   - Open: `http://localhost:8000/test-bot-integration.html`

3. **Expected Behavior:**
   - Bot widget appears in bottom-right corner
   - Widget is clickable
   - Clicking opens chatbot interface
   - Bot loads spa configuration
   - Can interact with bot

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Console should show bot loading messages
   - No CORS errors
   - No 404 errors

### 5.3 Test Lead Creation

1. **Through Chatbot:**
   - Open chatbot: `http://localhost:5174/?spa=test-spa-1`
   - Select a service
   - Fill form:
     - Name: `Test User`
     - Phone: `1234567890`
   - Submit
   - **Expected:** Success message

2. **Verify in Admin Panel:**
   - Go to Leads page
   - **Expected:** New lead appears in table
   - Lead should show:
     - Name: `Test User`
     - Phone: `1234567890`
     - Spa: `Test Spa 1`
     - Services: Selected service
     - Created: Current timestamp

3. **Verify Spa Stats:**
   - Go to Spas page
   - Check spa card
   - **Expected:** `totalLeads` count increased

---

## 🔍 Step 6: API Endpoint Testing

### 6.1 Health Check

```bash
curl http://localhost:5000/health
# Expected: {"status":"ok"}
```

### 6.2 Get Spa Config (Public)

```bash
curl http://localhost:5000/api/spas/config/test-spa-1
# Expected: JSON with spa configuration
```

### 6.3 Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spa.com","password":"admin123"}'
# Expected: JSON with token and user data
```

### 6.4 Get Spas (Protected)

```bash
# First get token from login
TOKEN="your-token-here"

curl http://localhost:5000/api/spas \
  -H "Authorization: Bearer $TOKEN"
# Expected: Array of spa objects
```

### 6.5 Get Leads (Protected)

```bash
curl http://localhost:5000/api/leads \
  -H "Authorization: Bearer $TOKEN"
# Expected: Array of lead objects
```

### 6.6 Create Lead (Public)

```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "spaId": "test-spa-1",
    "name": "API Test User",
    "phone": "9876543210",
    "services": ["Facial"],
    "message": "Test message from API"
  }'
# Expected: Created lead object
```

---

## 🐛 Step 7: Error Scenario Testing

### 7.1 Test Invalid Login

1. **Try wrong password:**
   - Email: `admin@spa.com`
   - Password: `wrongpassword`
   - **Expected:** Error message appears

2. **Try non-existent email:**
   - Email: `nonexistent@spa.com`
   - Password: `admin123`
   - **Expected:** Error message appears

### 7.2 Test Invalid Spa ID

1. **Open chatbot with invalid spa:**
   - URL: `http://localhost:5174/?spa=invalid-spa`
   - **Expected:** "Chat temporarily unavailable" message

2. **Check console:**
   - Should show error about spa not found

### 7.3 Test Inactive Spa

1. **Deactivate a spa:**
   - Go to Spas page
   - Toggle spa to inactive
   - **Expected:** Toggle turns off

2. **Try to access chatbot:**
   - URL: `http://localhost:5174/?spa=test-spa-1`
   - **Expected:** "Chat temporarily unavailable" message

3. **Reactivate spa:**
   - Toggle back to active
   - **Expected:** Chatbot works again

### 7.4 Test Network Errors

1. **Stop backend server:**
   - Press Ctrl+C in server terminal

2. **Try to access admin panel:**
   - **Expected:** Error messages appear
   - Retry button should be available

3. **Restart server:**
   - Start server again
   - Click retry in admin panel
   - **Expected:** Data loads successfully

---

## ✅ Step 8: Complete Workflow Test

### 8.1 End-to-End Booking Flow

1. **Create Spa:**
   - Login to admin panel
   - Create a new spa with services
   - Activate the spa
   - Copy embed code

2. **Integrate Bot:**
   - Use embed code in test HTML file
   - Open test HTML in browser

3. **Customer Interaction:**
   - Click bot widget
   - Select a service
   - Fill booking form
   - Submit

4. **Verify Lead:**
   - Go to admin panel Leads page
   - Verify lead appears
   - Check all details are correct

5. **Export Data:**
   - Click "Export CSV"
   - Verify CSV contains the lead

---

## 📊 Step 9: Performance Testing

### 9.1 Load Multiple Spas

1. **Create 5-10 spas:**
   - Test that admin panel handles multiple spas
   - Check loading time
   - Verify all spas display correctly

### 9.2 Load Multiple Leads

1. **Create multiple leads:**
   - Use chatbot or API to create 10+ leads
   - Check Leads page performance
   - Test filtering with many leads

### 9.3 Test Concurrent Users

1. **Open multiple browser tabs:**
   - Open admin panel in 2-3 tabs
   - Make changes in one tab
   - Refresh other tabs
   - **Expected:** Changes reflect correctly

---

## 🔒 Step 10: Security Testing

### 10.1 Authentication

1. **Test protected routes:**
   - Try accessing `/api/spas` without token
   - **Expected:** 401 Unauthorized

2. **Test token expiration:**
   - Login
   - Clear token from localStorage
   - Try to access protected route
   - **Expected:** Redirect to login

### 10.2 CORS Testing

1. **Test from different origin:**
   - Open chatbot from different port
   - **Expected:** Should work if origin is in ALLOWED_ORIGINS

2. **Test blocked origin:**
   - Try from origin not in ALLOWED_ORIGINS
   - **Expected:** CORS error

---

## 📝 Step 11: Browser Compatibility

Test in multiple browsers:

- [ ] **Chrome/Edge** (Chromium)
- [ ] **Firefox**
- [ ] **Safari** (if on Mac)
- [ ] **Mobile browsers** (Chrome Mobile, Safari Mobile)

**Test on each:**
- Admin panel login
- Spa creation
- Lead viewing
- Chatbot integration
- Bot widget functionality

---

## 🎯 Step 12: Final Checklist

Before considering testing complete, verify:

- [ ] All three services start without errors
- [ ] Admin panel login works
- [ ] Can create, edit, delete spas
- [ ] Can view and filter leads
- [ ] Chatbot loads with spa config
- [ ] Bot widget appears on test page
- [ ] Can complete booking flow
- [ ] Leads appear in admin panel
- [ ] CSV export works
- [ ] Error handling works correctly
- [ ] No console errors in browser
- [ ] API endpoints return correct data
- [ ] CORS configured correctly
- [ ] Authentication works
- [ ] Mobile responsive (if applicable)

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"

**Solution:**
- Check MongoDB is running: `mongosh`
- Verify MONGO_URI in server/.env
- Check MongoDB port (default: 27017)

### Issue: "CORS error"

**Solution:**
- Add origin to ALLOWED_ORIGINS in server/.env
- Restart server after changing .env
- Check origin matches exactly (including http/https)

### Issue: "401 Unauthorized"

**Solution:**
- Check if logged in
- Verify token in localStorage
- Try logging in again
- Check token hasn't expired

### Issue: "Spa not found"

**Solution:**
- Verify spa exists in database
- Check spaId spelling (case-sensitive)
- Ensure spa is active (isActive: true)

### Issue: "Chat temporarily unavailable"

**Solution:**
- Check backend server is running
- Verify API URL in chatbot/.env
- Check spa exists and is active
- Verify CORS allows chatbot origin

---

## 📞 Next Steps

After successful testing:

1. **Deploy Backend:**
   - Deploy server to production (Render, Railway, etc.)
   - Update MONGO_URI to production database
   - Set ALLOWED_ORIGINS to production domains

2. **Deploy Chatbot:**
   - Deploy chatbot to Vercel/Netlify
   - Update VITE_API_URL to production API
   - Update VITE_CHATBOT_URL in client/.env

3. **Deploy Admin Panel:**
   - Deploy client to Vercel/Netlify
   - Update VITE_API_URL to production API
   - Update VITE_CHATBOT_URL to production chatbot URL

4. **Update Embed Codes:**
   - Generate new embed codes with production URLs
   - Distribute to clients

---

**Testing Complete! 🎉**

If all tests pass, your system is ready for production use.

