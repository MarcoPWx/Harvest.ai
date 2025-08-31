# Troubleshooting Runbook - Harvest.ai

## 🚨 **Critical Issues - Immediate Response**

### **1. API Completely Down**
**Symptoms:**
- All API calls returning 500 errors
- Health endpoint not responding
- Frontend showing "Service Unavailable"

**Immediate Actions:**
```bash
# 1. Check health endpoint
curl https://your-app.vercel.app/api/health

# 2. Check Vercel status
# Visit: https://vercel-status.com

# 3. Check environment variables
vercel env ls

# 4. Check deployment logs
vercel logs --limit=50
```

**Common Causes:**
- Environment variables missing
- OpenAI API key expired
- Vercel deployment failed
- Redis connection issues

### **2. Navigation Broken**
**Symptoms:**
- Missing navigation on pages
- Demo link not working
- Mobile menu not functional

**Immediate Actions:**
```bash
# 1. Check all pages have navigation
curl https://your-app.vercel.app/
curl https://your-app.vercel.app/demo
curl https://your-app.vercel.app/code
curl https://your-app.vercel.app/system
curl https://your-app.vercel.app/roadmap

# 2. Check for JavaScript errors
# Open browser dev tools and check console
```

**Common Causes:**
- Missing navigation components
- JavaScript compilation errors
- CSS loading issues

## 🔧 **Common Issues & Solutions**

### **API Issues**

#### **1. Redis Connection Errors**
**Error Message:**
```
[Redis] Client not configured. Failed to execute command.
Rate limit check failed: TypeError: Failed to parse URL from /pipeline
```

**Solution:**
```bash
# Option 1: Set Redis environment variable
# REDIS_URL=redis://...

# Option 2: Disable Redis (system will work without it)
# REDIS_URL=
```

**Verification:**
```bash
curl https://your-app.vercel.app/api/health
# Should show: "redis": {"status": "connected"} or "not_configured"
```

#### **2. OpenAI API Errors**
**Error Message:**
```
Error: 401 Incorrect API key provided: test-key
```

**Solution:**
```bash
# 1. Check environment variable
echo $OPENAI_API_KEY

# 2. Update in Vercel
vercel env add OPENAI_API_KEY

# 3. Redeploy
vercel --prod
```

**Verification:**
```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"test","format":"summary","apiKey":"your-real-key"}'
```

#### **3. Rate Limiting Issues**
**Error Message:**
```
Rate limit exceeded. Please try again in 1 hour.
```

**Solution:**
- Wait for rate limit to reset (1 hour)
- Use different API key
- Check rate limit status in health endpoint

**Verification:**
```bash
curl https://your-app.vercel.app/api/health
# Check "rate_limits" section
```

### **Frontend Issues**

#### **1. Navigation Missing**
**Symptoms:**
- No navigation bar on pages
- Missing Demo link
- Mobile menu not working

**Solution:**
```bash
# 1. Check if navigation components exist
ls frontend/src/app/*/page.tsx

# 2. Verify navigation imports
grep -r "Navigation" frontend/src/app/

# 3. Check for compilation errors
npm run build
```

**Common Fixes:**
- Add missing navigation components
- Fix import statements
- Ensure all pages have navigation

#### **2. Dark Mode Not Working**
**Symptoms:**
- Dark mode toggle not responding
- Mode not persisting between sessions

**Solution:**
```bash
# 1. Check localStorage
# Open browser dev tools → Application → Local Storage

# 2. Check dark mode implementation
grep -r "darkMode" frontend/src/app/
```

**Common Fixes:**
- Fix localStorage implementation
- Check CSS classes
- Verify state management

#### **3. API Integration Issues**
**Symptoms:**
- Demo not generating content
- Error messages not clear
- Loading states not working

**Solution:**
```bash
# 1. Test API directly
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"test","format":"summary","apiKey":"test"}'

# 2. Check frontend API calls
# Open browser dev tools → Network tab
```

**Common Fixes:**
- Fix API endpoint URLs
- Update error handling
- Improve loading states

### **Performance Issues**

#### **1. Slow Response Times**
**Symptoms:**
- API calls taking > 10 seconds
- Frontend feels sluggish
- Timeout errors

**Diagnosis:**
```bash
# 1. Check API response time
curl -w "@curl-format.txt" -o /dev/null -s https://your-app.vercel.app/api/health

# 2. Check Redis performance
curl https://your-app.vercel.app/api/health
# Look for Redis latency

# 3. Check OpenAI API status
# Visit: https://status.openai.com
```

**Solutions:**
- Enable Redis caching
- Optimize prompts
- Check OpenAI API limits

#### **2. High Error Rates**
**Symptoms:**
- Many failed API calls
- User complaints about errors
- Error rate > 5%

**Diagnosis:**
```bash
# 1. Check error logs
vercel logs --limit=100 | grep "error"

# 2. Monitor health endpoint
curl https://your-app.vercel.app/api/health

# 3. Check rate limits
# Look for rate limit errors in logs
```

**Solutions:**
- Fix API key issues
- Adjust rate limits
- Improve error handling

## 🛠 **Debug Commands**

### **System Health Check**
```bash
# Complete system check
echo "=== System Health Check ==="
echo "1. Health endpoint:"
curl -s https://your-app.vercel.app/api/health | jq .

echo "2. Environment variables:"
vercel env ls

echo "3. Recent logs:"
vercel logs --limit=10

echo "4. Deployment status:"
vercel ls
```

### **API Testing**
```bash
# Test content generation
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input": "This is a test content for API validation",
    "format": "summary",
    "apiKey": "your-openai-api-key",
    "options": {
      "tone": "professional",
      "length": "medium"
    }
  }' | jq .

# Test rate limiting
for i in {1..5}; do
  curl -X POST https://your-app.vercel.app/api/generate \
    -H "Content-Type: application/json" \
    -d '{"input":"test","format":"summary","apiKey":"test"}' \
    -w "Request $i: %{http_code}\n"
done
```

### **Frontend Testing**
```bash
# Test all pages
echo "=== Frontend Page Tests ==="
pages=("" "demo" "code" "system" "roadmap")
for page in "${pages[@]}"; do
  echo "Testing /$page:"
  curl -s -o /dev/null -w "%{http_code}" https://your-app.vercel.app/$page
  echo " - Status: $?"
done
```

## 📊 **Monitoring & Alerts**

### **Key Metrics to Monitor**
- **API Response Time**: < 5 seconds
- **Error Rate**: < 1%
- **Cache Hit Rate**: > 80%
- **Uptime**: > 99.9%

### **Alert Conditions**
```bash
# Response time alert
if [ $(curl -w "%{time_total}" -o /dev/null -s https://your-app.vercel.app/api/health) -gt 5 ]; then
  echo "ALERT: API response time > 5 seconds"
fi

# Error rate alert
error_rate=$(curl -s https://your-app.vercel.app/api/health | jq -r '.error_rate // 0')
if (( $(echo "$error_rate > 0.01" | bc -l) )); then
  echo "ALERT: Error rate > 1%"
fi
```

### **Health Check Script**
```bash
#!/bin/bash
# health-check.sh

APP_URL="https://your-app.vercel.app"
WEBHOOK_URL="https://hooks.slack.com/your-webhook"

# Check health endpoint
response=$(curl -s "$APP_URL/api/health")
status=$(echo "$response" | jq -r '.status')

if [ "$status" != "healthy" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 Harvest.ai health check failed: $status\"}" \
    "$WEBHOOK_URL"
fi
```

## 🔄 **Recovery Procedures**

### **Service Outage Recovery**
1. **Check health endpoint**
2. **Verify environment variables**
3. **Check external service status**
4. **Rollback to previous deployment if needed**
5. **Notify team and users**

### **Data Loss Recovery**
- **No user data stored** - Privacy-first approach
- **API keys** - Users provide their own
- **Generated content** - Not stored, regenerate as needed

### **Performance Recovery**
1. **Enable Redis caching**
2. **Optimize API prompts**
3. **Scale resources if needed**
4. **Monitor performance metrics**

## 📞 **Escalation Procedures**

### **Level 1: Developer**
- Basic troubleshooting
- Environment variable fixes
- Simple configuration changes

### **Level 2: Lead Developer**
- Complex API issues
- Performance optimization
- Infrastructure problems

### **Level 3: External Support**
- Vercel support for deployment issues
- OpenAI support for API issues
- Redis provider support (if applicable)

## 📋 **Maintenance Checklist**

### **Daily**
- [ ] Check health endpoint
- [ ] Monitor error rates
- [ ] Review API usage
- [ ] Check navigation functionality

### **Weekly**
- [ ] Update dependencies
- [ ] Review performance metrics
- [ ] Check Redis memory usage
- [ ] Test all pages

### **Monthly**
- [ ] Rotate API keys
- [ ] Review security settings
- [ ] Update documentation
- [ ] Performance optimization

---

**Last Updated:** August 27, 2025  
**Version:** 1.0  
**Next Review:** September 27, 2025
