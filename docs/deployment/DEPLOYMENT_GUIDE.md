# 🚀 Harvest.ai Deployment Guide

## Prerequisites

### Required Accounts
- [ ] Vercel Account (for frontend)
- [ ] Railway/Render Account (for backend)
- [ ] Supabase Account (database)
- [ ] Pinecone Account (vector DB)
- [ ] Cloudflare Account (R2 storage)
- [ ] GitHub Account
- [ ] Sentry Account (error tracking)
- [ ] PostHog Account (analytics)

### Required Tools
```bash
# Install Vercel CLI
npm install -g vercel

# Install Railway CLI (macOS)
brew install railway

# Python environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 🌍 Environment Configuration

### 1. Environment Variables Structure

Create `.env.local` for development:
```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key

# Backend (.env)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENV=your-environment
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_ACCESS_KEY=your-access-key
CLOUDFLARE_SECRET_KEY=your-secret-key
SENTRY_DSN=your-sentry-dsn
JWT_SECRET=your-jwt-secret
```

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Next.js App

```bash
cd frontend

# Build locally to test
npm run build

# Test production build
npm run start
```

### Step 2: Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: harvest-ai
# - Directory: ./
# - Override settings? No

# Production deployment
vercel --prod
```

### Step 3: Configure Domain

1. Go to Vercel Dashboard
2. Settings → Domains
3. Add custom domain: `harvest.ai`
4. Configure DNS:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

### Step 4: Environment Variables

In Vercel Dashboard:
1. Settings → Environment Variables
2. Add all `NEXT_PUBLIC_*` variables
3. Deploy triggers automatic rebuild

## 🔧 Backend Deployment (Railway/Render)

### Option A: Railway Deployment

```bash
cd backend

# Login to Railway
railway login

# Initialize new project
railway init

# Link to GitHub repo
railway link

# Deploy
railway up

# Add environment variables
railway variables set DATABASE_URL=$DATABASE_URL
railway variables set REDIS_URL=$REDIS_URL
# ... add all backend env vars

# Get deployment URL
railway open
```

### Option B: Render Deployment

1. Connect GitHub repository
2. Create new Web Service
3. Configuration:
   ```yaml
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. Add environment variables in dashboard
5. Deploy automatically on push

### Option C: Self-Hosted (Docker)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run
docker build -t harvest-ai-backend .
docker run -p 8000:8000 --env-file .env harvest-ai-backend
```

## 💾 Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. New Project → Configure:
   - Name: `harvest-ai-prod`
   - Database Password: (save securely)
   - Region: Choose closest to users

### Step 2: Run Migrations

```sql
-- Create initial schema
CREATE SCHEMA IF NOT EXISTS harvest;

-- Users table
CREATE TABLE harvest.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    api_keys JSONB DEFAULT '{}',
    usage_tier VARCHAR(50) DEFAULT 'free'
);

-- Generated content table
CREATE TABLE harvest.generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES harvest.users(id),
    source_url TEXT,
    output_format VARCHAR(50),
    content JSONB,
    cost DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE harvest.usage_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES harvest.users(id),
    endpoint VARCHAR(255),
    tokens_used INTEGER,
    cost DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_content_user_created ON harvest.generated_content(user_id, created_at DESC);
CREATE INDEX idx_usage_user_created ON harvest.usage_logs(user_id, created_at DESC);
```

### Step 3: Enable Row Level Security

```sql
-- Enable RLS
ALTER TABLE harvest.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest.generated_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON harvest.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own content" ON harvest.generated_content
    FOR SELECT USING (auth.uid() = user_id);
```


## 🔍 Vector Database Setup (Pinecone)

```python
# Initialize Pinecone index
import pinecone

pinecone.init(
    api_key="your-api-key",
    environment="your-environment"
)

# Create index
pinecone.create_index(
    "harvest-content",
    dimension=1536,  # OpenAI embeddings dimension
    metric="cosine"
)
```

## 📦 Storage Setup (Cloudflare R2)

1. Create R2 bucket: `harvest-exports`
2. Generate API tokens
3. Configure CORS:
   ```json
   {
     "AllowedOrigins": ["https://harvest.ai"],
     "AllowedMethods": ["GET", "PUT"],
     "AllowedHeaders": ["*"],
     "MaxAgeSeconds": 3600
   }
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: |
          pip install -r requirements.txt
          pytest tests/

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: true

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway/deploy-action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service-id: ${{ secrets.RAILWAY_SERVICE_ID }}
```

## 📊 Monitoring Setup

### Sentry Configuration

```python
# main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
    environment="production"
)
```

### PostHog Analytics

```typescript
// frontend/src/lib/posthog.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing();
    }
  });
}
```

## 🚀 Production Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Environment variables set
- [ ] Backup strategy configured
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] SSL certificates active

### Post-Deployment
- [ ] Verify all endpoints working
- [ ] Check monitoring dashboards
- [ ] Test user registration flow
- [ ] Verify BYOK functionality
- [ ] Check cost tracking
- [ ] Test export features
- [ ] Monitor error rates

### Rollback Plan
```bash
# Frontend (Vercel)
vercel rollback

# Backend (Railway)
railway rollback

# Database (Supabase)
# Use point-in-time recovery from dashboard
```

## 🔐 Security Hardening

### API Security
```python
# Rate limiting
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/generate")
@limiter.limit("10/minute")
async def generate_content():
    pass
```

### CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://harvest.ai"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## 📱 Domain & DNS

### Recommended DNS Configuration
```
Type  Name    Value
A     @       76.76.21.21          # Vercel
A     api     134.209.28.98        # Backend
TXT   @       v=spf1 include:_spf.mx.cloudflare.net ~all
MX    @       route1.mx.cloudflare.net
```

## 🎯 Go-Live Checklist

### 24 Hours Before
- [ ] Final testing on staging
- [ ] Backup production data
- [ ] Notify team of deployment
- [ ] Prepare rollback plan

### Launch Day
- [ ] Deploy backend first
- [ ] Run database migrations
- [ ] Deploy frontend
- [ ] Update DNS if needed
- [ ] Monitor error rates
- [ ] Check performance metrics

### Post-Launch
- [ ] Monitor for 24 hours
- [ ] Gather user feedback
- [ ] Fix critical issues
- [ ] Plan next iteration

---

*For emergencies, see [INCIDENT_RESPONSE.md](../runbooks/INCIDENT_RESPONSE.md)*
