# Quick Test Guide

This is a condensed version of the complete testing guide for quick verification.

## 🚀 Quick Start (5 minutes)

### 1. Start Services

**Terminal 1 - Server:**
```bash
cd server
npm install  # First time only
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm install  # First time only
npm run dev
```

**Terminal 3 - Chatbot:**
```bash
cd chatbot
npm install  # First time only
npm run dev
```

### 2. Verify Services

- **Server:** http://localhost:5000/health → Should return `{"status":"ok"}`
- **Admin Panel:** http://localhost:5173 → Should show login page
- **Chatbot:** http://localhost:5174 → Should show chatbot interface

### 3. Quick Test Flow

1. **Login to Admin Panel:**
   - URL: http://localhost:5173
   - Email: `admin@spa.com`
   - Password: `admin123`

2. **Create a Spa:**
   - Go to Spas page
   - Click "Add Spa"
   - Fill in:
     - Spa ID: `test-spa-1`
     - Spa Name: `Test Spa`
     - Add at least one service
   - Save

3. **Test Chatbot:**
   - Open: http://localhost:5174/?spa=test-spa-1
   - Should load chatbot
   - Try booking a service

4. **Check Leads:**
   - Go back to Admin Panel
   - Go to Leads page
   - Should see the lead you created

### 4. Test Bot Integration

1. **Open test file:**
   - Open `test-bot-integration.html` in browser
   - Or serve it: `python -m http.server 8000`
   - Open: http://localhost:8000/test-bot-integration.html

2. **Verify:**
   - Bot widget appears in bottom-right
   - Can click and interact
   - No console errors

## ✅ Success Criteria

- [ ] All three services start without errors
- [ ] Can login to admin panel
- [ ] Can create a spa
- [ ] Chatbot loads with spa config
- [ ] Bot widget appears on test page
- [ ] Can complete booking flow
- [ ] Lead appears in admin panel

## 🐛 If Something Fails

1. **Check MongoDB is running:**
   ```bash
   mongosh
   ```

2. **Check browser console (F12):**
   - Look for error messages
   - Check Network tab for failed requests

3. **Check server logs:**
   - Look at Terminal 1 (server) for errors

4. **Verify environment variables:**
   - Check `.env` files exist
   - Verify API URLs are correct

## 📚 Full Testing Guide

For comprehensive testing, see `COMPLETE_TESTING_GUIDE.md`

