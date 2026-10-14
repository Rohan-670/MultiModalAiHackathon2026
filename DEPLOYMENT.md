# 🚀 Deployment & Publishing Guide

This guide details how to publish and deploy the **LearnSphere AI Platform** to public cloud platforms, GitHub, or Docker containers.

---

## 🌟 Architecture Overview for Deployment

The application supports **Unified Single-Port Deployment**:
* The built React frontend (`frontend/dist`) is automatically mounted by the FastAPI backend.
* A single container or service serves both the Web UI and the REST API on port `8000` (or `$PORT`).
* Zero CORS issues and zero need for separate frontend/backend hosting!

---

## 📦 Step 1: Publish Code to GitHub

Initialize git and push the codebase to your GitHub account:

```bash
# 1. Initialize git repository
git init

# 2. Add all files (respects .gitignore)
git add .

# 3. Create initial commit
git commit -m "feat: LearnSphere AI adaptive learning platform"

# 4. Link to your GitHub repository
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git branch -M main

# 5. Push to GitHub
git push -u origin main
```

---

## ☁️ Step 2: Cloud Deployment Options

### Option A: Render (Recommended — Free & Easiest)

Render provides free hosting for Web Services using Docker:

1. Go to [render.com](https://render.com) and create an account.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Render will detect the [`Dockerfile`](file:///d:/MMAH2026/Dockerfile) automatically.
5. In the **Environment Variables** section, add:
   * `GEMINI_API_KEY`: *Your Google Gemini API Key* ([Get free key here](https://aistudio.google.com/app/apikey))
   * `PORT`: `8000`
6. Click **Create Web Service**.
7. Render will build the React frontend and Python runtime, giving you a live public URL (e.g. `https://learnsphere-ai.onrender.com`).

---

### Option B: Railway

1. Go to [railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository.
4. In **Variables**, add:
   * `GEMINI_API_KEY`: *Your Google Gemini API Key*
5. Railway will automatically build the Dockerfile and expose a public domain under Settings → Networking.

---

### Option C: Google Cloud Run / AWS / DigitalOcean (Docker Container)

Deploy to any container platform:

```bash
# 1. Build Docker image
docker build -t learnsphere-ai:latest .

# 2. Run locally or on your server
docker run -d -p 8000:8000 -e GEMINI_API_KEY="your_api_key" learnsphere-ai:latest
```

Using Docker Compose:
```bash
# In .env file, specify GEMINI_API_KEY
docker compose up -d --build
```
Access at `http://YOUR_SERVER_IP:8000`.

---

### Option D: Split Deployment (Frontend on Vercel + Backend on Render)

If you prefer hosting the React static files separately on Vercel:

1. **Deploy Backend to Render or Railway** using the steps above. Note the backend URL (e.g. `https://api.yourdomain.com`).
2. **Deploy Frontend to Vercel**:
   * In Vercel, import the repo and select root directory as `frontend`.
   * Framework Preset: **Vite**.
   * Add Environment Variable:
     * `VITE_API_URL`: `https://api.yourdomain.com`
   * Click **Deploy**.

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key for real-time quiz synthesis & AI tutoring |
| `PORT` | Optional | Port for the backend server (defaults to `8000`) |
| `HOST` | Optional | Host binding (defaults to `0.0.0.0`) |
| `JWT_SECRET` | Optional | Secret key for JWT student auth sessions |

---

## ✅ Post-Deployment Verification

Once deployed, visit your live URL:
1. `https://your-app.onrender.com/` → Loads the LearnSphere AI Web Application.
2. `https://your-app.onrender.com/api/health` → Returns `{"status": "healthy", "gemini_active": true}`.
3. `https://your-app.onrender.com/docs` → Displays the OpenAPI Swagger documentation.
