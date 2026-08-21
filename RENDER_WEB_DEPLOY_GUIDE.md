# 🚀 How to Deploy EcoScrap Web Portal on Render (Free & Fast)

Follow these simple steps to deploy your website on **Render** in less than 2 minutes.

---

## 🌟 Method 1: Deploy Website as a "Static Site" (Recommended)

1. Go to **[dashboard.render.com](https://dashboard.render.com)** and log in.
2. Click **New +** (top right) $\rightarrow$ select **Static Site**.
3. Connect your GitHub repository: `https://github.com/rajammy1234567-ai/EcoScrap`.
4. Configure the build settings as follows:

| Field | Value |
|---|---|
| **Name** | `ecoscrap-web` (or your preferred name) |
| **Branch** | `main` |
| **Root Directory** | `web` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

5. **SPA Routing Configuration (Important for React Router):**
   - In your Render static site dashboard, go to the **Redirects / Rewrites** tab.
   - Click **Add Rule**:
     - **Type:** `Rewrite`
     - **Source:** `/*`
     - **Destination:** `/index.html`

6. **Environment Variables (Optional):**
   - In the **Environment** tab, you can add:
     - `VITE_API_URL` = `https://ecoscrap-1.onrender.com` (or your backend URL).

7. Click **Create Static Site** (or **Save Changes**).
8. Render will build and deploy your site in ~30 seconds, giving you a live URL like:  
   `https://ecoscrap-web.onrender.com`

---

## 🛠️ Method 2: Deploy Using Render Blueprint (1-Click Deploy for Both Web & Backend)

1. In Render Dashboard, click **New +** $\rightarrow$ select **Blueprint**.
2. Connect your GitHub repository `EcoScrap`.
3. Render will automatically read `render.yaml` and create:
   - `ecoscrap-api` (Backend Web Service with Admin Panel at `/admin`)
   - `ecoscrap-web` (Frontend Static Site)
4. Click **Apply**.

---

## 🔗 Live URLs:
- **Web Portal:** `https://ecoscrap-web.onrender.com`
- **Franchise Hub:** `https://ecoscrap-web.onrender.com/franchise`
- **Pickup Flow:** `https://ecoscrap-web.onrender.com/book-pickup`
- **Admin Panel:** `https://ecoscrap-api.onrender.com/admin`
