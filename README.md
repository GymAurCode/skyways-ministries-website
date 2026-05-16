# SKYWAY MINISTRIES OF CHRIST

**Teach · Preach · Heal** — Since 2023

A production-ready ministry website with admin panel, gallery management (Cloudinary), and donation system. Built with React/Vite + Vercel Serverless + MongoDB Atlas.

---

## 🔐 Security Features

✅ **Authentication**
- JWT-based auth with 7-day expiration
- bcrypt password hashing (12 rounds)
- No hardcoded secrets — all from `.env`
- Auto-logout on token expiry (401 responses)
- Password requirements: min 8 chars, 1 letter + 1 number

✅ **Input Validation**
- All inputs validated on backend (never trust frontend)
- XSS protection via HTML tag stripping
- SQL injection impossible (Mongoose ODM)
- Rate limiting on login (10/15min) and donations (5/10min)

✅ **Data Protection**
- Passwords never logged or exposed
- Admin password field has `select: false` on schema
- JWT secret validated at startup (min 32 chars)
- MongoDB URI validated before connection

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS |
| Backend | Vercel Serverless Functions (Node.js) |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| File Storage | Cloudinary |
| Deployment | Vercel |

---

## Project Structure

```
├── api/                        # Vercel serverless API routes
│   ├── lib/
│   │   ├── db.js               # MongoDB connection (cached)
│   │   ├── models.js           # Mongoose models (Admin, Content, Gallery, Donation)
│   │   ├── auth.js             # JWT helpers + requireAuth middleware
│   │   ├── cloudinary.js       # Cloudinary upload/delete
│   │   ├── validate.js         # Input validation + sanitization
│   │   └── rateLimit.js        # In-memory rate limiter
│   ├── auth/
│   │   ├── login.js            # POST /api/auth/login
│   │   └── change-password.js  # POST /api/auth/change-password
│   ├── content/
│   │   └── index.js            # GET/PUT /api/content
│   ├── gallery/
│   │   ├── index.js            # GET/POST /api/gallery
│   │   └── [id].js             # DELETE /api/gallery/:id
│   ├── donations/
│   │   ├── index.js            # GET/POST /api/donations
│   │   ├── [id].js             # PATCH /api/donations/:id
│   │   └── stats.js            # GET /api/donations/stats
│   └── seed.js                 # One-time DB seed script
├── src/                        # React frontend
│   ├── components/
│   │   ├── ErrorBoundary.tsx   # Global error handler
│   │   ├── DonationForm.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx     # JWT token management
│   ├── hooks/
│   │   └── useSiteContent.ts
│   ├── lib/
│   │   └── api.ts              # Centralized API client
│   ├── pages/
│   │   ├── admin/              # Protected admin panel
│   │   ├── HomePage.tsx
│   │   └── GalleryPage.tsx
│   └── types/
├── vercel.json                 # Vercel routing config
├── .env.example                # Template for environment variables
└── package.json
```

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo>
cd skyway-ministries
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required variables:**

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skyway?retryWrites=true&w=majority

# JWT secret (min 32 chars) — generate with:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-64-char-random-hex-string
JWT_EXPIRES=7d

# Admin credentials for seeding (used ONLY by: node api/seed.js)
# Requirements: min 8 chars, at least 1 letter + 1 number
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourStr0ngP@ssword

# Cloudinary credentials (get from https://cloudinary.com → Dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Getting MongoDB URI
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Click **Connect** → **Drivers** → copy the connection string
4. Replace `<password>` with your DB user password

#### Getting Cloudinary Credentials
1. Sign up at [Cloudinary](https://cloudinary.com) (free tier is sufficient)
2. Go to Dashboard → copy Cloud Name, API Key, API Secret

### 3. Seed the Database

Run once to create the admin user and default site content:

```bash
npm run seed
```

**Output:**
```
✅  Connected to MongoDB
✅  Admin created  →  username: admin
    Password was read from ADMIN_PASSWORD env var (not logged for security)
✅  Default site content created
✅  Seed complete
```

> ⚠️ **IMPORTANT:** Change the admin password immediately after first login via Admin → Settings.

### 4. Run Locally

**Frontend only (Vite dev server):**
```bash
npm run dev
```
Runs at `http://localhost:5173` — API routes will 404 without Vercel CLI.

**Full stack (with API routes):**
```bash
npx vercel dev
```
Runs at `http://localhost:3000` with working API routes.

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "Production-ready deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Framework: **Vite**
4. **Add all environment variables** from `.env.example`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ADMIN_USERNAME` (for re-seeding if needed)
   - `ADMIN_PASSWORD` (for re-seeding if needed)
5. Deploy

### 3. Seed Production Database

After deployment, run the seed script once with your production `MONGODB_URI`:

```bash
MONGODB_URI=<your-atlas-uri> ADMIN_PASSWORD=<strong-password> npm run seed
```

---

## Admin Panel

Access at `/admin/login`

**Default credentials (after seeding):**
- Username: `admin` (or value from `ADMIN_USERNAME`)
- Password: from `ADMIN_PASSWORD` env var

### Features

| Feature | Description |
|---|---|
| **Dashboard** | Stats overview (donations, gallery count) |
| **Website Content** | Edit all text, images, contact info, social links |
| **Gallery** | Upload/delete images (stored on Cloudinary with `public_id`) |
| **Donations** | View, confirm, or reject donation submissions |
| **Settings** | Change admin password (enforces strong password rules) |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Admin login (rate-limited: 10/15min) |
| POST | `/api/auth/change-password` | JWT | Change password |
| GET | `/api/content` | Public | Get site content |
| PUT | `/api/content` | JWT | Update site content |
| GET | `/api/gallery` | Public | List gallery images |
| POST | `/api/gallery` | JWT | Upload image (base64 → Cloudinary) |
| DELETE | `/api/gallery/:id` | JWT | Delete image (DB + Cloudinary) |
| POST | `/api/donations` | Public | Submit donation (rate-limited: 5/10min) |
| GET | `/api/donations` | JWT | List all donations |
| PATCH | `/api/donations/:id` | JWT | Update donation status |
| GET | `/api/donations/stats` | JWT | Dashboard stats |

---

## Security Checklist

✅ **Authentication**
- [x] JWT secret from env (min 32 chars, validated at startup)
- [x] Passwords hashed with bcrypt (12 rounds)
- [x] No plain-text passwords in logs or responses
- [x] Token expiry enabled (7 days)
- [x] Auto-logout on 401 responses

✅ **Input Validation**
- [x] All inputs validated on backend
- [x] XSS protection (HTML tags stripped)
- [x] Amount validation (min 1, max 10M, no negatives)
- [x] Password requirements enforced (min 8 chars, 1 letter + 1 number)

✅ **Rate Limiting**
- [x] Login: 10 attempts per 15 minutes per IP
- [x] Donations: 5 submissions per 10 minutes per IP

✅ **Database**
- [x] Mongoose schema validation on all models
- [x] Indexes on frequently queried fields
- [x] No direct DB calls in routes (all via models)

✅ **Cloudinary**
- [x] `public_id` stored for deletion support
- [x] Image size validation (max 10MB)
- [x] Base64 format validation
- [x] Deletion syncs DB + Cloudinary

✅ **Error Handling**
- [x] Try/catch on all async operations
- [x] Generic error messages (no stack traces to client)
- [x] React ErrorBoundary for frontend crashes

---

## Production Notes

### Environment Variables

**Never commit `.env` to version control.** All secrets must be in Vercel's environment variables dashboard.

### Password Policy

- Minimum 8 characters
- At least 1 letter (a-z, A-Z)
- At least 1 number (0-9)
- Enforced on both frontend and backend

### Rate Limiting

Current implementation is in-memory (per Vercel instance). For stricter enforcement across all instances, integrate:
- [Upstash Redis](https://upstash.com) for distributed rate limiting
- Vercel Edge Middleware for request-level blocking

### Monitoring

Add error tracking in production:
- [Sentry](https://sentry.io) for backend errors
- Replace `console.error` in `ErrorBoundary.tsx` with Sentry SDK

### Backup

MongoDB Atlas provides automated backups. Configure:
- Daily snapshots (free tier: 2-day retention)
- Point-in-time recovery (paid tiers)

---

## Troubleshooting

### "JWT_SECRET is not set"
Add `JWT_SECRET` to your `.env` file. Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### "MONGODB_URI is not set"
Add your MongoDB Atlas connection string to `.env`.

### API routes return 404 locally
Use `npx vercel dev` instead of `npm run dev` to run serverless functions locally.

### Images not uploading
1. Check Cloudinary credentials in `.env`
2. Verify image is under 10MB
3. Check browser console for base64 encoding errors

### Donations not submitting
1. Check rate limit (5 per 10 minutes per IP)
2. Verify amount is between 1 and 10,000,000
3. Check browser console for validation errors

---

## License

Private project — all rights reserved.

---

## Support

For issues or questions, contact the development team.
