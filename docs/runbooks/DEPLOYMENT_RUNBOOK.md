# Deployment Runbook - Harvest.ai

## 🚀 **Quick Start Deployment**

### **Prerequisites**
- Node.js 18+ installed
- Git repository cloned
- OpenAI API key

### **1. Local Development Setup**
```bash
# Clone repository
git clone <repository-url>
cd Harvest.ai

# Install dependencies
cd frontend
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your OpenAI API key

# Start development server
npm run dev
```

### **2. Production Deployment (Vercel)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# OPENAI_API_KEY=your_openai_api_key
```

## 🔧 **Environment Configuration**

### **Required Environment Variables**
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here

# Redis Configuration (Optional - for caching and rate limiting)
# REDIS_URL=redis://...

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### **Optional Environment Variables**
```bash
# Analytics (if using)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key

# Monitoring (if using)
SENTRY_DSN=your_sentry_dsn
```

## 📊 **Health Monitoring**

### **Health Check Endpoint**
```bash
# Check system health
curl https://your-app.vercel.app/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-08-27T22:04:31.234Z",
  "response_time": 0,
  "services": {
    "redis": {
      "status": "connected",
      "latency": 15,
      "url": "configured"
    },
    "openai": {
      "status": "configured"
    }
  },
  "cache": {
    "total_keys": 42,
    "memory_usage": 1024,
    "hit_rate": 0.85
  },
  "rate_limits": {
    "active_limits": 5,
    "total_requests": 150
  },
  "environment": "production"
}
```

### **Monitoring Alerts**
- **API Response Time**: > 10 seconds
- **Error Rate**: > 5%
- **Redis Connection**: Failed
- **OpenAI API**: Rate limit exceeded

## 🔄 **Deployment Process**

### **1. Pre-Deployment Checklist**
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] API keys valid and active
- [ ] Redis connection tested (if using)
- [ ] Health check endpoint responding

### **2. Deployment Steps**
```bash
# 1. Build application
npm run build

# 2. Run tests
npm run test

# 3. Deploy to staging (if applicable)
vercel --env staging

# 4. Deploy to production
vercel --prod
```

### **3. Post-Deployment Verification**
```bash
# 1. Check health endpoint
curl https://your-app.vercel.app/api/health

# 2. Test content generation
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Test content",
    "format": "summary",
    "apiKey": "test-key",
    "options": {"tone": "professional"}
  }'

# 3. Verify navigation works
# Visit all pages: /, /demo, /code, /system, /roadmap
```

## 🛠 **Troubleshooting**

### **Common Issues**

#### **1. Redis Connection Errors**
```bash
# Error: Redis client not configured
# Solution: Set REDIS_URL (if using) or disable Redis
# REDIS_URL=
```

#### **2. OpenAI API Errors**
```bash
# Error: 401 Incorrect API key provided
# Solution: Check OPENAI_API_KEY environment variable
echo $OPENAI_API_KEY
```

#### **3. Build Failures**
```bash
# Error: TypeScript compilation errors
# Solution: Fix type errors before deployment
npm run type-check
```

#### **4. Navigation Issues**
```bash
# Error: Missing navigation on pages
# Solution: Ensure all pages have navigation components
# Check: /demo, /code, /system, /roadmap
```

### **Debug Commands**
```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs

# Check Redis connection
curl -X GET https://your-app.vercel.app/api/health

# Test API endpoint
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"test","format":"summary","apiKey":"test"}'
```

## 📈 **Performance Optimization**

### **Caching Strategy**
- **Content Cache**: 24-hour TTL for generated content
- **Rate Limiting**: 100 requests per hour per API key
- **Static Assets**: CDN caching for images and CSS

### **Monitoring Metrics**
- **Response Time**: Target < 5 seconds
- **Cache Hit Rate**: Target > 80%
- **Error Rate**: Target < 1%
- **Uptime**: Target > 99.9%

### **Scaling Considerations**
- **Vercel**: Automatic scaling based on traffic
- **Redis**: Ensure your provider scales appropriately (if used)
- **OpenAI**: Rate limits based on API plan

## 🔒 **Security Considerations**

### **API Key Management**
- Store API keys in environment variables
- Never commit API keys to repository
- Rotate API keys regularly
- Use different keys for development/production

### **Rate Limiting**
- 100 requests per hour per API key
- Exponential backoff for retries
- Clear error messages for rate limits

### **Data Privacy**
- No user data stored on servers
- API keys handled client-side
- Content not logged or stored
- Privacy-first approach

## 📋 **Maintenance Tasks**

### **Daily**
- [ ] Check health endpoint
- [ ] Monitor error rates
- [ ] Review API usage

### **Weekly**
- [ ] Update dependencies
- [ ] Review performance metrics
- [ ] Check Redis memory usage

### **Monthly**
- [ ] Rotate API keys
- [ ] Review security settings
- [ ] Update documentation

## 🚨 **Emergency Procedures**

### **Service Outage**
1. Check health endpoint
2. Verify environment variables
3. Check Vercel status page
4. Rollback to previous deployment if needed

### **API Key Compromise**
1. Immediately rotate API key
2. Update environment variables
3. Redeploy application
4. Monitor for unauthorized usage

### **Performance Issues**
1. Check Redis connection
2. Monitor OpenAI API limits
3. Review application logs
4. Scale resources if needed

## 📞 **Contact Information**

### **Development Team**
- **Lead Developer**: [Your Name]
- **Email**: [your-email@example.com]
- **Slack**: #harvest-ai-dev

### **Infrastructure**
- **Vercel**: [vercel-dashboard-url]
- **Redis provider**: [your-redis-dashboard-url]
- **OpenAI**: [openai-dashboard-url]

---

**Last Updated:** August 27, 2025  
**Version:** 1.0  
**Next Review:** September 27, 2025
