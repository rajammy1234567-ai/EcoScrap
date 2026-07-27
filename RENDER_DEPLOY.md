# Deploy API + Admin UI on Render

`Cannot GET /` aata hai jab sirf API chalti hai aur admin HTML serve nahi hota.

Ab backend **same URL** pe admin panel bhi serve karta hai:

| URL | Kya |
|-----|-----|
| https://ecoscrap-1.onrender.com/ | Admin login panel |
| https://ecoscrap-1.onrender.com/api/health | API health |
| https://ecoscrap-1.onrender.com/api/... | All APIs |

## Render Dashboard settings

**Root Directory:** leave empty (repo root) **OR** set to repo root `.`

### Option A — Root = repository root (recommended)

- **Build Command:**
  ```bash
  npm install --prefix Scrap-admin && npm run build --prefix Scrap-admin && node Scrap-backend/scripts/copyAdminDist.js && npm install --prefix Scrap-backend
  ```
- **Start Command:**
  ```bash
  node Scrap-backend/server.js
  ```

### Option B — Root Directory = `Scrap-backend`

- **Build Command:**
  ```bash
  npm install --prefix ../Scrap-admin && npm run build --prefix ../Scrap-admin && node scripts/copyAdminDist.js && npm install
  ```
- **Start Command:**
  ```bash
  node server.js
  ```

## Env vars (Render)

- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- email / SMS keys if used

## After deploy

1. Open https://ecoscrap-1.onrender.com/
2. Admin login page aani chahiye (Cannot GET / nahi)
3. API: https://ecoscrap-1.onrender.com/api/health

## Local test

```bash
cd Scrap-admin && npm run build
cd ../Scrap-backend && node scripts/copyAdminDist.js && node server.js
# open http://localhost:5000
```
