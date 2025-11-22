# How to Use the Embed Code - Step by Step Guide

## ✅ Corrected Embed Code

The embed code you received has a small issue. Use this **corrected version**:

```html
<script>
  const spaId = "test_1";
  (function(){
    const s = document.createElement('script');
    s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  })();
</script>
```

**Note:** The URL should be `https://boticon.vercel.app/bot.js` (not `/bot.js/bot.js`)

## 📋 Next Steps

### Step 1: Verify Your Chatbot is Deployed

Before using the embed code, make sure your chatbot is deployed and accessible:

1. **Test chatbot directly:**
   - Visit: `https://boticon.vercel.app?spa=test_1`
   - You should see the chatbot interface
   - If it doesn't load, you need to deploy/rebuild the chatbot first

2. **Test bot.js file:**
   - Visit: `https://boticon.vercel.app/bot.js?spa=test_1`
   - Should load the JavaScript file (not show a page)
   - Check browser console for any errors

### Step 2: Add Embed Code to Your Website

#### Option A: Static HTML Website

1. Open your website's HTML file (usually `index.html`)
2. Find the `</body>` tag (at the end of the file)
3. **Paste the embed code just before `</body>`:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Your Website</title>
</head>
<body>
  <!-- Your website content here -->
  
  <!-- Chatbot Embed Code - Paste here -->
  <script>
    const spaId = "test_1";
    (function(){
      const s = document.createElement('script');
      s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    })();
  </script>
</body>
</html>
```

4. Save the file
5. Upload to your web server
6. Visit your website - the chatbot widget should appear in the bottom-right corner

#### Option B: WordPress Website

1. Go to **Appearance** → **Theme Editor**
2. Select `footer.php` or use a plugin like "Insert Headers and Footers"
3. Paste the embed code just before `</body>` tag
4. Save changes

#### Option C: Shopify Website

1. Go to **Online Store** → **Themes** → **Actions** → **Edit code**
2. Navigate to `theme.liquid`
3. Find `</body>` tag
4. Paste the embed code just before `</body>`
5. Save

#### Option D: React/Next.js Website

**For React (public/index.html):**
```html
<body>
  <div id="root"></div>
  <!-- Embed code here -->
  <script>
    const spaId = "test_1";
    (function(){
      const s = document.createElement('script');
      s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    })();
  </script>
</body>
```

**For Next.js (_document.js):**
```javascript
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const spaId = "test_1";
              (function(){
                const s = document.createElement('script');
                s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
                s.async = true;
                s.defer = true;
                document.body.appendChild(s);
              })();
            `,
          }}
        />
      </body>
    </Html>
  )
}
```

### Step 3: Test the Widget

1. **Open your website** in a browser
2. **Look for the chatbot widget** in the bottom-right corner
3. **Click on it** - it should open the chat interface
4. **Test the booking flow:**
   - Click "Claim Offer" or "Book Now"
   - Fill in the booking form
   - Submit the booking
5. **Check your admin panel** - the lead should appear in the Leads section

### Step 4: Verify Everything Works

✅ **Checklist:**
- [ ] Widget appears on the website
- [ ] Widget opens when clicked
- [ ] Chatbot loads and shows spa information
- [ ] Booking form works
- [ ] Submission succeeds
- [ ] Lead appears in admin panel
- [ ] No console errors in browser DevTools

## 🐛 Troubleshooting

### Widget Not Appearing?

1. **Open browser DevTools** (F12)
2. **Check Console tab** for errors
3. **Look for `[SpaBot]` logs** - they show what's happening
4. **Check Network tab** - verify `bot.js` loads successfully

### Common Errors:

**Error: `[SpaBot] Missing spaId`**
- Fix: Ensure `spaId` is correct in the embed code

**Error: `Failed to load iframe`**
- Fix: Verify chatbot is deployed at `https://boticon.vercel.app`
- Test: Visit `https://boticon.vercel.app?spa=test_1` directly

**Error: `Spa not found`**
- Fix: Verify `test_1` exists in your admin panel
- Check: Spa is active (toggle enabled)

**Error: `CORS policy blocked`**
- Fix: Add your website domain to backend `ALLOWED_ORIGINS`
- Restart backend server

### Still Not Working?

1. **Test chatbot directly:**
   ```
   https://boticon.vercel.app?spa=test_1
   ```

2. **Test API endpoint:**
   ```
   https://your-api-domain.com/api/spas/config/test_1
   ```

3. **Check browser console** for detailed error messages

4. **Verify deployment:**
   - Chatbot is built and deployed
   - Backend API is running
   - Database connection is working

## 📝 Important Notes

1. **Always use HTTPS** in production (not HTTP)
2. **Don't modify the embed code** - just paste it as-is
3. **Place code before `</body>` tag** for best results
4. **One widget per page** - don't add multiple embed codes
5. **Test on mobile devices** - widget should be responsive

## 🎯 Quick Test

Create a simple test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <h1>Testing Chatbot Widget</h1>
  <p>Look for the widget in the bottom-right corner!</p>
  
  <script>
    const spaId = "test_1";
    (function(){
      const s = document.createElement('script');
      s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    })();
  </script>
</body>
</html>
```

Save as `test.html` and open in your browser. The widget should appear!

---

**Need more help?** Check `WIDGET_DEBUGGING_GUIDE.md` for detailed troubleshooting steps.

