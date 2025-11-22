# 🤖 Bot Integration Workflow - Complete Guide

This document provides a step-by-step workflow for integrating the Spa Bot chatbot into any website.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step-by-Step Workflow](#step-by-step-workflow)
3. [Platform-Specific Instructions](#platform-specific-instructions)
4. [Testing & Verification](#testing--verification)
5. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before starting, ensure you have:

- ✅ **Admin Panel Access** - You can log into the admin dashboard
- ✅ **Spa Created** - A spa is registered in the admin panel with a valid `spaId`
- ✅ **Chatbot Deployed** - The chatbot is deployed and accessible (e.g., `https://boticon.vercel.app`)
- ✅ **Backend API Running** - The server API is deployed and accessible
- ✅ **Website Access** - You can edit the HTML of the target website

---

## 🔄 Step-by-Step Workflow

### **Step 1: Get Your Spa ID**

1. Log into the admin panel
2. Navigate to the **Spas** paged your spa in the list
4. Note the **Spa ID** (e
3. Fin.g., `spa_1`, `aurum-andheri`)

**Alternative:** Check the URL when viewing a spa - the ID is usually visible in the URL or spa details.

---

### **Step 2: Get Your Chatbot URL**

The chatbot URL is where your chatbot is deployed. Common examples:
- `https://boticon.vercel.app`
- `https://spa-bot-widget.netlify.app`
- `https://chatbot.yourdomain.com`

**To find it:**
- Check your deployment platform (Vercel, Netlify, etc.)
- Or check the environment variable `VITE_CHATBOT_URL` in your admin panel

---

### **Step 3: Generate Embed Code**

#### **Option A: From Admin Panel (Recommended)**

1. Go to **Spas** page in admin panel
2. Click on the spa card
3. Click **"Embed Code"** button
4. Copy the generated code

#### **Option B: Manual Creation**

Use this template and replace the placeholders:

```html
<script>
  const spaId = "YOUR_SPA_ID";
  (function(){
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadBot);
    } else {
      loadBot();
    }
    
    function loadBot() {
      const s = document.createElement('script');
      s.src = 'https://YOUR-CHATBOT-DOMAIN.com/bot.js?spa=' + spaId;
      s.async = true;
      document.body.appendChild(s);
    }
  })();
</script>
```

**Example with real values:**
```html
<script>
  const spaId = "spa_1";
  (function(){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadBot);
    } else {
      loadBot();
    }
    
    function loadBot() {
      const s = document.createElement('script');
      s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
      s.async = true;
      document.body.appendChild(s);
    }
  })();
</script>
```

---

### **Step 4: Add to Your Website**

The embed code must be placed **just before the closing `</body>` tag** in your HTML.

#### **Why Before `</body>`?**
- Ensures `document.body` exists when the script runs
- Loads after page content (better performance)
- Works reliably across all browsers

#### **Where to Find `</body>` Tag:**
- In HTML files: Look for `</body>` at the end
- In React: `public/index.html` or `index.html`
- In Next.js: `pages/_document.js` or `app/layout.js`
- In WordPress: Theme files or footer section
- In Shopify: `theme.liquid` file

---

### **Step 5: Verify Integration**

1. **Save your changes**
2. **Refresh your website**
3. **Check browser console** (F12) for errors
4. **Look for bot widget** in bottom-right corner
5. **Test the bot** by clicking and sending a message

---

## 🌐 Platform-Specific Instructions

### **1. Plain HTML Website**

**File:** `index.html` or any HTML file

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Your website content -->
  
  <!-- Bot Integration - Add here -->
  <script>
    const spaId = "spa_1";
    (function(){
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadBot);
      } else {
        loadBot();
      }
      
      function loadBot() {
        const s = document.createElement('script');
        s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
        s.async = true;
        document.body.appendChild(s);
      }
    })();
  </script>
</body>
</html>
```

---

### **2. React (Create React App / Vite)**

**File:** `public/index.html` or `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
    
    <!-- Bot Integration -->
    <script>
      const spaId = "spa_1";
      (function(){
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', loadBot);
        } else {
          loadBot();
        }
        
        function loadBot() {
          const s = document.createElement('script');
          s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
          s.async = true;
          document.body.appendChild(s);
        }
      })();
    </script>
  </body>
</html>
```

**Alternative: React Component Method**

Create a component `BotWidget.jsx`:

```jsx
import { useEffect } from 'react';

const BotWidget = ({ spaId }) => {
  useEffect(() => {
    if (!spaId) return;
    
    // Wait for body to exist
    const loadBot = () => {
      const script = document.createElement('script');
      script.src = `https://boticon.vercel.app/bot.js?spa=${spaId}`;
      script.async = true;
      document.body.appendChild(script);
    };
    
    if (document.body) {
      loadBot();
    } else {
      window.addEventListener('load', loadBot);
    }
    
    // Cleanup
    return () => {
      const scripts = document.querySelectorAll(`script[src*="bot.js"]`);
      scripts.forEach(script => script.remove());
    };
  }, [spaId]);
  
  return null;
};

export default BotWidget;
```

Then use it in your `App.jsx`:

```jsx
import BotWidget from './components/BotWidget';

function App() {
  return (
    <div>
      {/* Your app content */}
      <BotWidget spaId="spa_1" />
    </div>
  );
}
```

---

### **3. Next.js**

**Option A: Using `_document.js` (Pages Router)**

**File:** `pages/_document.js`

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
              const spaId = "spa_1";
              (function(){
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', loadBot);
                } else {
                  loadBot();
                }
                
                function loadBot() {
                  const s = document.createElement('script');
                  s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
                  s.async = true;
                  document.body.appendChild(s);
                }
              })();
            `,
          }}
        />
      </body>
    </Html>
  )
}
```

**Option B: Using `layout.js` (App Router)**

**File:** `app/layout.js`

```javascript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const spaId = "spa_1";
              (function(){
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', loadBot);
                } else {
                  loadBot();
                }
                
                function loadBot() {
                  const s = document.createElement('script');
                  s.src = 'https://boticon.vercel.app/bot.js?spa=' + spaId;
                  s.async = true;
                  document.body.appendChild(s);
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
```

---

### **4. WordPress**

**Method 1: Using Plugin (Recommended)**

1. Install plugin: **"Insert Headers and Footers"**
2. Go to **Settings** → **Insert Headers and Footers**
3. Paste code in **"Scripts in Footer"** section
4. Click **Save**

**Method 2: Edit Theme Files**

1. Go to **Appearance** → **Theme Editor**
2. Select **Footer (footer.php)**
3. Find `</body>` tag
4. Paste code just before `</body>`
5. Click **Update File**

⚠️ **Warning:** Editing theme files directly may be lost on theme updates. Use a child theme or plugin method.

---

### **5. Shopify**

1. Go to **Online Store** → **Themes**
2. Click **Actions** → **Edit code**
3. Navigate to **Layout** → **theme.liquid**
4. Find `</body>` tag (usually near the end)
5. Paste code just before `</body>`
6. Click **Save**

**Location in theme.liquid:**
```liquid
<!-- Your theme content -->
</body>
<!-- Paste bot code here, just before </body> -->
</html>
```

---

### **6. Wix**

1. Go to **Settings** → **Custom Code**
2. Click **+ Add Custom Code**
3. Paste your embed code
4. Choose **Body - end** for placement
5. Click **Apply**

---

### **7. Squarespace**

1. Go to **Settings** → **Advanced** → **Code Injection**
2. Paste code in **Footer** section
3. Click **Save**

---

### **8. Webflow**

1. Go to **Project Settings** → **Custom Code**
2. Paste code in **Footer Code** section
3. Click **Save**

---

## 🧪 Testing & Verification

### **Pre-Integration Testing**

Before adding to your website, test these URLs:

1. **Test Chatbot Direct Access:**
   ```
   https://YOUR-CHATBOT-DOMAIN.com/?spa=YOUR_SPA_ID
   ```
   Should show the chatbot interface.

2. **Test bot.js File:**
   ```
   https://YOUR-CHATBOT-DOMAIN.com/bot.js?spa=YOUR_SPA_ID
   ```
   Should load JavaScript without errors.

3. **Test API Endpoint:**
   ```
   https://YOUR-API-DOMAIN.com/api/spas/config/YOUR_SPA_ID
   ```
   Should return JSON with spa configuration.

---

### **Post-Integration Testing**

1. **Visual Check:**
   - ✅ Bot widget appears in bottom-right corner
   - ✅ Widget is clickable
   - ✅ Widget opens/closes properly

2. **Functional Check:**
   - ✅ Bot loads and displays messages
   - ✅ Can send messages
   - ✅ Bot responds correctly
   - ✅ Booking flow works
   - ✅ Lead submission works

3. **Browser Console Check:**
   - Open Developer Tools (F12)
   - Check **Console** tab for errors
   - Check **Network** tab for failed requests

4. **Mobile Testing:**
   - Test on mobile device or emulator
   - Verify widget is responsive
   - Check touch interactions work

5. **Cross-Browser Testing:**
   - Chrome/Edge
   - Firefox
   - Safari
   - Mobile browsers

---

## 🐛 Troubleshooting

### **Problem: Bot doesn't appear**

**Checklist:**
- ✅ Is the script placed before `</body>` tag?
- ✅ Is `spaId` correct? (Check admin panel)
- ✅ Is chatbot URL correct and accessible?
- ✅ Check browser console for errors
- ✅ Is spa marked as "Active" in admin panel?
- ✅ Is your website domain in CORS whitelist?

**Common Errors:**
- `document.body is null` → Script is in `<head>`, move to `<body>`
- `spaId is undefined` → Check variable name spelling
- `Failed to load bot.js` → Check chatbot URL and network

---

### **Problem: "Chat temporarily unavailable"**

**Checklist:**
- ✅ Is backend API running?
- ✅ Is API URL correct in chatbot deployment?
- ✅ Test API endpoint directly in browser
- ✅ Check API logs for errors
- ✅ Verify CORS settings allow chatbot domain

---

### **Problem: Bot appears but doesn't respond**

**Checklist:**
- ✅ Check browser console for API errors
- ✅ Verify API endpoints are accessible
- ✅ Check network tab for failed requests
- ✅ Verify spa configuration in admin panel
- ✅ Check if services are configured for the spa

---

### **Problem: CORS Errors**

**Solution:**
Add your website domain to backend `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=https://yourwebsite.com,https://www.yourwebsite.com
```

**Format:**
- Comma-separated (no spaces)
- Include protocol (`https://`)
- Include `www` version if needed

---

### **Problem: Bot styling looks wrong**

**Checklist:**
- ✅ Check spa configuration in admin panel
- ✅ Verify bot image URL is accessible
- ✅ Check browser console for CSS loading errors
- ✅ Clear browser cache and reload

---

## 📊 Complete Workflow Summary

```
1. Get Spa ID from Admin Panel
   ↓
2. Get Chatbot URL (deployment URL)
   ↓
3. Generate Embed Code (from admin or manually)
   ↓
4. Add Code Before </body> Tag
   ↓
5. Test Integration
   ↓
6. Verify Bot Appears & Works
   ↓
7. Test Booking Flow
   ↓
8. Go Live! 🎉
```

---

## ✅ Final Checklist

Before going live:

- [ ] Chatbot is deployed and accessible
- [ ] Backend API is running
- [ ] Spa is created and active in admin panel
- [ ] Embed code is correctly placed
- [ ] Tested on staging/test environment
- [ ] Bot appears and functions correctly
- [ ] Booking flow works end-to-end
- [ ] Leads appear in admin panel
- [ ] Mobile responsive tested
- [ ] Website domain added to CORS whitelist
- [ ] Browser console shows no errors

---

## 🎯 Quick Reference

**Standard Embed Code:**
```html
<script>
  const spaId = "YOUR_SPA_ID";
  (function(){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadBot);
    } else {
      loadBot();
    }
    
    function loadBot() {
      const s = document.createElement('script');
      s.src = 'https://YOUR-CHATBOT-DOMAIN.com/bot.js?spa=' + spaId;
      s.async = true;
      document.body.appendChild(s);
    }
  })();
</script>
```

**Placement:** Just before `</body>` tag

**Testing:** Check browser console (F12) for errors

---

## 📞 Need Help?

1. Check browser console for specific errors
2. Verify all prerequisites are met
3. Test each component individually (chatbot, API, spa config)
4. Review troubleshooting section above
5. Check deployment documentation

---

**Happy Integrating! 🚀**

