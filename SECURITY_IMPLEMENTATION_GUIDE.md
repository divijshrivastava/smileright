# Security Implementation Quick Start Guide

This guide will help you deploy the security enhancements to your Smile Right application.

## Prerequisites

- Database access to your Supabase project
- Admin access to Supabase Dashboard
- Node.js and npm installed
- Deployment access (Vercel or similar)

## Step 1: Database Migration

Run the security enhancement migration to add audit logging and storage policies.

### Option A: Via Supabase Dashboard (Recommended)

1. Log into Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/migrations/005_security_enhancements.sql`
4. Copy and paste the entire content
5. Click **Run** to execute the migration
6. Verify success (should see "Success. No rows returned")

### Option B: Via Command Line

```bash
# Using the SQL script runner
npm run sql supabase/migrations/005_security_enhancements.sql
```

### Verification

Check that the migration succeeded:

```sql
-- Check audit_logs table exists
SELECT * FROM audit_logs LIMIT 1;

-- Check storage policies exist
SELECT * FROM storage.policies WHERE bucket_id IN ('testimonial-images', 'trust-images', 'testimonial-videos');
```

## Step 2: Install Dependencies

No new dependencies needed! All security utilities use built-in Node.js features.

```bash
# Optional: Verify current dependencies are up to date
npm audit
npm update
```

## Step 3: Environment Variables

Verify your environment variables are correctly configured:

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=development

# Production (set in Vercel/hosting platform)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
```

The application will validate these on startup.

## Step 4: Test Locally

Before deploying, test the security features locally:

```bash
# Start development server
npm run dev
```

### Test Checklist

#### 1. Input Validation
- ✅ Try entering very long text (should be truncated)
- ✅ Try entering special characters (should be sanitized)
- ✅ Submit forms with empty required fields (should show errors)

#### 2. File Upload Security
- ✅ Try uploading a non-image file renamed as .jpg (should fail)
- ✅ Try uploading a file larger than 5MB (should fail)
- ✅ Upload a valid image (should succeed)

#### 3. Authentication & Authorization
- ✅ Access /admin without logging in (should redirect to /login)
- ✅ Log in with valid credentials (should succeed)
- ✅ Test admin actions work correctly

#### 4. Rate Limiting
```bash
# Test rate limiting (run multiple times quickly)
for i in {1..10}; do
  curl http://localhost:3000/api/revalidate -X POST
done
```

#### 5. Audit Logging
- ✅ Create a testimonial
- ✅ Check audit_logs table for entry:
```sql
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

## Step 5: Deploy to Staging

1. **Commit Changes**
```bash
git add .
git commit -m "feat: implement comprehensive security enhancements"
git push origin main
```

2. **Deploy**
   - If using Vercel, it will auto-deploy on push
   - If using another platform, follow their deployment process

3. **Verify Deployment**
   - Check that the site loads correctly
   - Test login functionality
   - Test creating content
   - Verify security headers are present

### Check Security Headers

Use your browser's Developer Tools or curl:

```bash
curl -I https://your-staging-site.com
```

Look for these headers:
- `Strict-Transport-Security`
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`

## Step 6: Security Testing

### Manual Testing

1. **XSS Prevention**
   - Try entering `<script>alert('XSS')</script>` in text fields
   - Should be sanitized/stripped

2. **SQL Injection Prevention**
   - Try entering `' OR '1'='1` in text fields
   - Should be sanitized or rejected

3. **File Upload**
   - Create a text file with `.jpg` extension
   - Try uploading - should fail validation

4. **Open Redirect**
   - Try accessing: `/auth/callback?next=https://evil.com`
   - Should redirect to `/admin` (not external site)

5. **Rate Limiting**
   - Rapidly click submit buttons
   - Should see rate limit errors after threshold

### Automated Testing (Optional)

Consider using security scanning tools:

```bash
# OWASP ZAP (free, open-source)
# Or use online services like:
# - SecurityHeaders.com
# - Mozilla Observatory
# - SSL Labs
```

## Step 7: Production Deployment

Once staging tests pass:

1. **Run Migration on Production Database**
   - Use Supabase Dashboard SQL Editor
   - Run `005_security_enhancements.sql`

2. **Deploy to Production**
```bash
# If manual deployment needed
npm run build
npm start

# Or use your CI/CD pipeline
git push origin production
```

3. **Post-Deployment Verification**
   - ✅ Site loads correctly
   - ✅ HTTPS is enforced
   - ✅ Login works
   - ✅ Content creation works
   - ✅ File uploads work
   - ✅ Audit logs are being created
   - ✅ Security headers are present

## Step 8: Configure Monitoring

### Audit Log Monitoring

Set up regular checks:

```sql
-- Suspicious activity check
SELECT * FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Failed operations
SELECT * FROM audit_logs 
WHERE details->>'error' IS NOT NULL
ORDER BY created_at DESC;
```

### Set Up Alerts (Optional)

Consider setting up alerts for:
- Multiple failed login attempts
- Large file uploads
- Unusual activity patterns
- Rate limit violations

## Step 9: Team Training

Share documentation with your team:

1. **Developers**: Review `SECURITY.md`
2. **Admins**: Review security best practices section
3. **All Users**: Password security guidelines

## Step 10: Regular Maintenance

Schedule these tasks:

### Weekly
```bash
# Check for dependency vulnerabilities
npm audit
```

### Monthly
```bash
# Update dependencies
npm update

# Review audit logs
# Access Supabase Dashboard > SQL Editor
SELECT 
  action, 
  COUNT(*) as count 
FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY action;
```

### Quarterly
- Review and rotate API keys
- Conduct security audit
- Update security documentation

## Troubleshooting

### Issue: Migration Fails

**Error**: "relation already exists"

**Solution**: The migration might have partially run. Check what exists:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs';
```

If it exists, you can skip that part or drop and recreate.

### Issue: File Uploads Not Working

**Check**:
1. Storage buckets exist in Supabase
2. Storage policies are applied
3. User is authenticated
4. File meets validation criteria

**Debug**:
```javascript
// Check browser console for detailed error messages
console.log('Upload validation result:', validationResult);
```

### Issue: Rate Limiting Too Strict

**Solution**: Adjust limits in `src/lib/security/rate-limit.ts`:

```typescript
export const rateLimitConfigs = {
  admin: {
    maxRequests: 50, // Increase from 30
    windowMs: 60 * 1000,
  },
}
```

### Issue: CSP Blocking Resources

**Symptom**: Images or scripts not loading

**Solution**: Update CSP in `vercel.json`:

```json
{
  "key": "Content-Security-Policy",
  "value": "... img-src 'self' data: https: your-cdn.com; ..."
}
```

### Issue: Audit Logs Growing Too Large

**Solution**: Clean old logs regularly:

```sql
-- Clean logs older than 90 days
SELECT cleanup_old_audit_logs(90);
```

Or set up a cron job to do this automatically.

## Support

For issues or questions:

1. Check `SECURITY.md` for detailed documentation
2. Review `SECURITY_FIXES_SUMMARY.md` for what was fixed
3. Check code comments in security modules
4. Review Supabase documentation

## Quick Reference

### Key Security Files

```
src/lib/security/
├── audit-log.ts          # Logging
├── csrf.ts               # CSRF protection
├── env-validation.ts     # Config validation
├── file-validation.ts    # File uploads
├── input-validation.ts   # Input sanitization
└── rate-limit.ts         # Rate limiting
```

### Important Commands

```bash
# Development
npm run dev

# Build
npm run build

# Run SQL migration
npm run sql supabase/migrations/005_security_enhancements.sql

# Security audit
npm audit

# Update dependencies
npm update
```

### Security Checklist

- [x] Database migration applied
- [x] Environment variables configured
- [x] Local testing completed
- [x] Staging deployment successful
- [x] Security testing passed
- [x] Production migration applied
- [x] Production deployment successful
- [x] Monitoring configured
- [x] Team trained
- [x] Documentation reviewed

---

## Success Criteria

Your security implementation is complete when:

✅ Database migration runs successfully  
✅ All security headers are present  
✅ File uploads validate content correctly  
✅ Audit logs are being created  
✅ Rate limiting is working  
✅ Input validation prevents XSS  
✅ No linter errors  
✅ All tests pass  
✅ Team is trained  

**Congratulations!** Your application is now significantly more secure. 🔒

For ongoing security, remember to:
- Keep dependencies updated
- Monitor audit logs regularly
- Review security policies quarterly
- Stay informed about new vulnerabilities

---

**Last Updated:** January 30, 2026  
**Version:** 1.0
