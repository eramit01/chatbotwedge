# Chatbot Troubleshooting Guide

## "Chat temporarily unavailable" Error

This error appears when the chatbot cannot fetch spa configuration. Follow these steps:

### 1. Check Browser Console
Open DevTools (F12) → Console tab. Look for:
- `[SpaBot] Fetching config from: http://localhost:5000/api/spas/config/...`
- Any error messages with status codes

### 2. Verify URL Has spaId Parameter
The chatbot needs `?spa=your-spa-id` in the URL.

**Correct:**
```
http://localhost:4173/?spa=aurum-andheri
```

**Wrong:**
```
http://localhost:4173/
```

### 3. Verify Spa Exists and Is Active
1. Go to Admin Panel → Spas page
2. Check if your spa exists
3. Ensure `isActive` toggle is ON (green)
4. Copy the exact `spaId` (e.g., `aurum-andheri`)

### 4. Test API Endpoint Directly
Open in browser:
```
http://localhost:5000/api/spas/config/aurum-andheri
```

Should return JSON with spa config. If 404, spa doesn't exist or is inactive.

### 5. Check CORS Configuration
In `server/.env`, ensure:
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
```

Restart server after changing.

### 6. Verify Environment Variable
Create `chatbot/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Restart chatbot dev server after creating/updating `.env`.

### 7. Common Issues

**Issue:** "Missing spaId" in console
- **Fix:** Add `?spa=your-spa-id` to URL

**Issue:** 404 Not Found
- **Fix:** Create spa in admin panel or check spaId spelling

**Issue:** 401/403 Unauthorized
- **Fix:** `/api/spas/config/:spaId` is public, shouldn't need auth. Check server routes.

**Issue:** CORS error
- **Fix:** Add chatbot origin to `ALLOWED_ORIGINS` in server `.env`

**Issue:** Network error / Connection refused
- **Fix:** Ensure backend server is running on port 5000

### Quick Test Checklist
- [ ] Backend running on port 5000
- [ ] Chatbot running on port 4173
- [ ] URL has `?spa=your-spa-id`
- [ ] Spa exists in database and is active
- [ ] API endpoint returns JSON when tested directly
- [ ] No CORS errors in console
- [ ] `chatbot/.env` has `VITE_API_URL=http://localhost:5000/api`


