# Complete Working Flow Explanation

This document explains how the entire Spa Bot system works from end to end.

---

## 🏗️ System Architecture

The system consists of three main components:

1. **Backend Server** (Node.js + Express + MongoDB)
   - Handles API requests
   - Manages authentication
   - Stores spa configurations and leads
   - Port: 5000

2. **Admin Panel** (React + Vite)
   - Admin dashboard for managing spas
   - View and manage leads
   - Generate embed codes
   - Port: 5173

3. **Chatbot Widget** (React + Vite)
   - Customer-facing chatbot interface
   - Embedded on client websites
   - Port: 5174 (dev) or deployed URL (production)

---

## 🔄 Complete Workflow

### Phase 1: Setup & Configuration

#### 1.1 Admin Creates Spa

```
Admin Panel → Spas Page → Add Spa
```

**Process:**
1. Admin logs into admin panel
2. Navigates to Spas page
3. Clicks "Add Spa" button
4. Fills in spa details:
   - Spa ID (unique identifier)
   - Spa Name
   - Bot Name (optional)
   - Bot Image URL (optional)
   - Services (list of services with prices)
   - Colors (primary and secondary)
   - Offer text
5. Sets spa as "Active"
6. Clicks "Save Spa"

**Backend Process:**
- POST request to `/api/spas`
- Validates authentication token
- Creates new Spa document in MongoDB
- Returns created spa data

**Database:**
```javascript
{
  spaId: "test-spa-1",
  spaName: "Test Spa",
  botName: "Ava",
  botImage: "https://...",
  isActive: true,
  services: [...],
  colors: { primary: "#8b5cf6", secondary: "#f5f3ff" },
  totalLeads: 0
}
```

#### 1.2 Admin Gets Embed Code

```
Admin Panel → Spas Page → Click "Embed Code" on Spa Card
```

**Process:**
1. Admin clicks "Embed Code" button on a spa card
2. System generates embed code with:
   - Spa ID
   - Chatbot URL (from environment variable)
   - DOM-ready script

**Generated Code:**
```html
<script>
  const spaId = "test-spa-1";
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

#### 1.3 Client Integrates Bot

```
Client Website → HTML File → Paste Embed Code
```

**Process:**
1. Client receives embed code from admin
2. Pastes code before `</body>` tag in their website HTML
3. Saves and deploys website

---

### Phase 2: Customer Interaction

#### 2.1 Customer Visits Website

```
Customer → Opens Client Website → Page Loads
```

**Process:**
1. Customer visits client's website
2. Page HTML loads
3. Embed script executes
4. Script creates `<script>` tag pointing to chatbot's `bot.js`
5. `bot.js` loads asynchronously

#### 2.2 Bot Widget Appears

```
bot.js Loads → Creates iframe → Widget Appears
```

**Process (in bot.js):**
1. Script extracts `spaId` from URL parameter: `?spa=test-spa-1`
2. Creates container div: `#spa-bot-root`
3. Creates iframe pointing to: `https://chatbot-url.com/?spa=test-spa-1`
4. Styles container (fixed position, bottom-right)
5. Appends to `document.body`

**Result:**
- Widget appears in bottom-right corner
- 400px × 600px (responsive on mobile)
- Z-index: 999999 (above all content)

#### 2.3 Chatbot Loads Configuration

```
Chatbot iframe → Fetches Spa Config → Displays Bot
```

**Process (in BookingBot.jsx):**
1. Chatbot component mounts
2. Extracts `spaId` from URL: `?spa=test-spa-1`
3. Makes API call: `GET /api/spas/config/test-spa-1`
4. Backend returns spa configuration
5. Chatbot applies configuration:
   - Bot name
   - Bot image
   - Services list
   - Colors
   - Offer text
6. Displays welcome message

**API Call:**
```javascript
GET http://localhost:5000/api/spas/config/test-spa-1

Response:
{
  spaId: "test-spa-1",
  spaName: "Test Spa",
  botName: "Ava",
  botImage: "https://...",
  services: [...],
  colors: { primary: "#8b5cf6", secondary: "#f5f3ff" },
  offer: "20% Off",
  isActive: true
}
```

#### 2.4 Customer Interacts with Bot

```
Customer → Clicks Widget → Opens Chat → Selects Service → Books
```

**Process:**
1. Customer clicks bot widget
2. Chatbot interface opens
3. Customer sees:
   - Welcome message
   - Services list
   - Bot avatar and name
4. Customer clicks on a service
5. Booking form appears
6. Customer fills:
   - Name
   - Phone number
   - Optional message
7. Customer submits

#### 2.5 Lead is Created

```
Chatbot → Submits Form → API Creates Lead → Success Message
```

**Process:**
1. Chatbot makes API call: `POST /api/leads`
2. Payload:
```javascript
{
  spaId: "test-spa-1",
  name: "John Doe",
  phone: "1234567890",
  services: ["Facial", "Massage"],
  message: "Looking for weekend appointment"
}
```

**Backend Process:**
1. Validates required fields (spaId, name, phone)
2. Verifies spa exists and is active
3. Creates Lead document in MongoDB
4. Updates spa's `totalLeads` count
5. Returns created lead

**Database:**
```javascript
{
  spa: ObjectId("..."),
  spaId: "test-spa-1",
  spaName: "Test Spa",
  name: "John Doe",
  phone: "1234567890",
  services: ["Facial", "Massage"],
  message: "Looking for weekend appointment",
  createdAt: "2024-01-15T10:30:00Z"
}
```

---

### Phase 3: Admin Management

#### 3.1 Admin Views Leads

```
Admin Panel → Leads Page → View All Leads
```

**Process:**
1. Admin navigates to Leads page
2. Frontend makes API call: `GET /api/leads`
3. Backend returns all leads (sorted by date, newest first)
4. Frontend displays in table

**API Call:**
```javascript
GET http://localhost:5000/api/leads
Headers: { Authorization: "Bearer <token>" }

Response: [
  {
    _id: "...",
    spaId: "test-spa-1",
    spaName: "Test Spa",
    name: "John Doe",
    phone: "1234567890",
    services: ["Facial", "Massage"],
    message: "Looking for weekend appointment",
    createdAt: "2024-01-15T10:30:00Z"
  },
  ...
]
```

#### 3.2 Admin Filters Leads

```
Admin Panel → Leads Page → Apply Filters
```

**Process:**
1. Admin selects spa from dropdown
2. Frontend filters leads by `spaId`
3. Admin selects date range
4. Frontend filters leads by `createdAt`
5. Table updates in real-time (client-side filtering)

#### 3.3 Admin Exports Data

```
Admin Panel → Leads Page → Export CSV
```

**Process:**
1. Admin clicks "Export CSV" button
2. Frontend generates CSV from filtered leads
3. CSV downloads to admin's computer
4. Format:
```csv
Name,Phone,Spa,Services,Message,Created
"John Doe","1234567890","Test Spa","Facial; Massage","Looking for weekend appointment","2024-01-15T10:30:00Z"
```

---

## 🔐 Authentication Flow

### Admin Login

```
Admin Panel → Login Page → Submit Credentials
```

**Process:**
1. Admin enters email and password
2. Frontend makes API call: `POST /api/auth/login`
3. Backend:
   - Finds user by email
   - Compares password (bcrypt)
   - Generates JWT token (7-day expiry)
   - Returns token and user data
4. Frontend:
   - Stores token in `localStorage` as `spa_token`
   - Stores user data in `localStorage` as `spa_user`
   - Redirects to dashboard

**API Call:**
```javascript
POST http://localhost:5000/api/auth/login
Body: {
  email: "admin@spa.com",
  password: "admin123"
}

Response: {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "...",
    name: "Super Admin",
    email: "admin@spa.com",
    role: "admin"
  }
}
```

### Protected Routes

```
Frontend → API Request → Include Token → Backend Validates
```

**Process:**
1. Frontend makes API request
2. Axios interceptor adds token to headers:
   ```javascript
   Authorization: Bearer <token>
   ```
3. Backend middleware validates token
4. If valid: Request proceeds
5. If invalid: Returns 401, frontend redirects to login

---

## 🔄 Data Flow Diagrams

### Creating a Lead

```
Customer Website
    │
    ├─> Embed Script Loads
    │       │
    │       └─> bot.js Loads
    │               │
    │               └─> Creates iframe
    │                       │
    │                       └─> Chatbot Component
    │                               │
    │                               └─> Fetches Config
    │                                       │
    │                                       └─> GET /api/spas/config/:spaId
    │                                               │
    │                                               └─> Backend
    │                                                       │
    │                                                       └─> MongoDB
    │                                                               │
    │                                                               └─> Returns Config
    │
    └─> Customer Books Service
            │
            └─> POST /api/leads
                    │
                    └─> Backend
                            │
                            ├─> Validates Spa
                            │       │
                            │       └─> MongoDB (Spa Collection)
                            │
                            ├─> Creates Lead
                            │       │
                            │       └─> MongoDB (Lead Collection)
                            │
                            └─> Updates Spa Stats
                                    │
                                    └─> MongoDB (Spa Collection)
```

### Admin Viewing Leads

```
Admin Panel
    │
    └─> Leads Page Loads
            │
            ├─> GET /api/leads
            │       │
            │       └─> Backend
            │               │
            │               ├─> Validates Token
            │               │
            │               └─> GET from MongoDB
            │                       │
            │                       └─> Returns Leads Array
            │
            └─> Displays in Table
                    │
                    └─> Admin Can Filter/Export
```

---

## 🗄️ Database Schema

### Spa Collection

```javascript
{
  _id: ObjectId,
  spaId: String (unique, indexed),
  spaName: String,
  botName: String,
  botImage: String,
  isActive: Boolean,
  offer: String,
  colors: {
    primary: String,
    secondary: String
  },
  services: [{
    id: String,
    title: String,
    priceRange: String,
    duration: String,
    popular: Boolean
  }],
  totalLeads: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Lead Collection

```javascript
{
  _id: ObjectId,
  spa: ObjectId (ref: Spa),
  spaId: String,
  spaName: String,
  name: String,
  phone: String,
  services: [String],
  message: String,
  createdAt: Date
}
```

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ("admin" | "staff"),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 Key Components

### Backend API Endpoints

**Public Endpoints:**
- `GET /health` - Health check
- `GET /api/spas/config/:spaId` - Get spa config
- `POST /api/leads` - Create lead
- `POST /api/auth/login` - Admin login

**Protected Endpoints (require authentication):**
- `GET /api/spas` - Get all spas
- `POST /api/spas` - Create spa
- `PUT /api/spas/:id` - Update spa
- `DELETE /api/spas/:id` - Delete spa
- `GET /api/leads` - Get all leads

### Frontend Components

**Admin Panel:**
- `Login.jsx` - Login page
- `Dashboard.jsx` - Dashboard with stats
- `Spas.jsx` - Spa management page
- `Leads.jsx` - Leads viewing page
- `SpaCard.jsx` - Individual spa card
- `LeadTable.jsx` - Leads table
- `EmbedCode.jsx` - Embed code generator

**Chatbot:**
- `BookingBot.jsx` - Main chatbot component
- `bot.js` - Widget loader script

---

## 🚀 Deployment Flow

### Development

```
Local Machine:
├─> MongoDB (localhost:27017)
├─> Backend Server (localhost:5000)
├─> Admin Panel (localhost:5173)
└─> Chatbot (localhost:5174)
```

### Production

```
Internet:
├─> MongoDB Atlas (Cloud Database)
├─> Backend Server (Render/Railway/etc.)
│   └─> API URL: https://api.yourdomain.com
├─> Admin Panel (Vercel/Netlify)
│   └─> URL: https://admin.yourdomain.com
└─> Chatbot (Vercel/Netlify)
    └─> URL: https://bot.yourdomain.com
```

**Client Websites:**
- Embed code points to production chatbot URL
- Bot widget loads from production
- API calls go to production backend

---

## ✅ Success Indicators

### System Working Correctly When:

1. **Admin Panel:**
   - ✅ Can login
   - ✅ Can create/edit/delete spas
   - ✅ Can view leads
   - ✅ Can export CSV
   - ✅ Embed codes generate correctly

2. **Chatbot:**
   - ✅ Widget appears on client websites
   - ✅ Loads spa configuration
   - ✅ Displays services correctly
   - ✅ Booking form works
   - ✅ Submits leads successfully

3. **Backend:**
   - ✅ Health check returns OK
   - ✅ API endpoints respond correctly
   - ✅ Authentication works
   - ✅ CORS configured properly
   - ✅ Database operations succeed

4. **Integration:**
   - ✅ Bot visible on any website
   - ✅ No console errors
   - ✅ Leads appear in admin panel
   - ✅ All data persists correctly

---

## 🎯 Summary

The system works as follows:

1. **Admin** creates and configures spas in the admin panel
2. **Admin** gets embed code and shares with clients
3. **Clients** paste embed code on their websites
4. **Customers** see bot widget and interact with it
5. **Chatbot** fetches spa config and handles bookings
6. **Leads** are created and stored in database
7. **Admin** views and manages leads in admin panel

The entire flow is automated and requires no manual intervention once set up correctly.

