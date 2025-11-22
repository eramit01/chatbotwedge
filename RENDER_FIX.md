# 🔧 Fix Render Rust Detection Error

## Problem
Render is detecting your project as Rust instead of Node.js, causing this error:
```
error: could not find `Cargo.toml` in `/opt/render/project/src`
```

## Solution: Force Node.js Detection

### Step 1: Delete Current Service (if needed)
If you've already created the service, you may need to delete and recreate it with correct settings.

### Step 2: Create New Web Service in Render

1. **Go to Render Dashboard** → New → **Web Service**

2. **Connect Repository:**
   - Repository: `eramit01/AutoReplySaas`
   - Branch: `main`

3. **Critical Settings - Set These EXACTLY:**

   ```
   Name: spa-bot-api
   Environment: Node (MUST be Node, not Auto-detect)
   Region: Choose your region
   Branch: main
   Root Directory: spa-bot-system/server
   ```

4. **Build Settings:**

   ```
   Build Command: npm install
   Start Command: npm start
   ```

5. **Advanced Settings:**
   - Click "Advanced" or scroll down
   - **Auto-Deploy:** Yes
   - **Docker:** No (unchecked)

### Step 3: Add Environment Variables

Go to **Environment** tab and add:

```
NODE_ENV=production
PORT=10000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key-min-32-chars
ADMIN_EMAIL=admin@spa.com
ADMIN_PASSWORD=admin123
ALLOWED_ORIGINS=https://your-admin.netlify.app,https://your-chatbot.netlify.app
```

### Step 4: Deploy

Click **"Create Web Service"** and wait for deployment.

---

## Alternative: Use Blueprint (render.yaml)

If the above doesn't work, use the Blueprint method:

1. **Delete the current service**

2. **Go to Render** → New → **Blueprint**

3. **Connect Repository:**
   - Repository: `eramit01/AutoReplySaas`
   - Branch: `main`

4. Render will automatically detect `render.yaml` and create the service

5. **Add environment variables** in the dashboard (the ones marked `sync: false`)

---

## Still Not Working?

### Option A: Check Repository Root
There might be Rust files in your `AutoReplySaas` repo root. Check:
- Is there a `Cargo.toml` at the repo root?
- Are there `.rs` files at the root level?

If yes, you can:
1. Move them to a subdirectory
2. Or use a `.renderignore` file (if Render supports it)

### Option B: Use Different Root Directory Path
Try these variations in Root Directory:
- `spa-bot-system/server` (recommended)
- `./spa-bot-system/server`
- Just `server` (if your repo root is `spa-bot-system`)

### Option C: Manual Build Override
In Build Command, try:
```
cd spa-bot-system/server && npm install
```

In Start Command:
```
cd spa-bot-system/server && npm start
```

---

## Verification

After deployment, check:

1. **Build Logs** should show:
   ```
   npm install
   npm start
   ```
   NOT:
   ```
   cargo build
   ```

2. **Service URL** should respond:
   ```
   https://your-service.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

---

## Quick Checklist

- [ ] Environment is set to **Node** (not Auto-detect)
- [ ] Root Directory is `spa-bot-system/server`
- [ ] Build Command is `npm install`
- [ ] Start Command is `npm start`
- [ ] All environment variables are set
- [ ] No Rust files in the root directory path

