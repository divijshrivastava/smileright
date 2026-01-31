# Security Documentation

## Overview

This document outlines the security measures implemented in the Smile Right application and best practices for maintaining security.

## Security Features Implemented

### 1. Authentication & Authorization

#### Supabase Authentication
- Uses Supabase Auth for secure user authentication
- Row Level Security (RLS) policies enforce data access control
- Only authenticated admin/editor users can modify content
- Session management handled securely by Supabase

#### Role-Based Access Control (RBAC)
- **Admin Role**: Full access to all resources including deletion
- **Editor Role**: Can create and update content, but cannot delete
- Roles enforced at database level via RLS policies

### 2. Input Validation & Sanitization

All user inputs are validated and sanitized before processing:

#### Location
- **File**: `src/lib/security/input-validation.ts`

#### Features
- **String Sanitization**: Removes null bytes, control characters
- **HTML Sanitization**: Strips script tags and event handlers
- **URL Validation**: Validates protocol and checks for dangerous patterns
- **Integer Validation**: Type checking with range validation
- **Length Limits**: Enforces maximum lengths to prevent DoS
- **SQL Injection Detection**: Basic pattern matching for SQL injection attempts

#### Usage Example
```typescript
import { sanitizeString, validateEmail } from '@/lib/security/input-validation'

const cleanName = sanitizeString(userInput, 100)
const isValid = validateEmail(email)
```

### 3. File Upload Security

#### Location
- **File**: `src/lib/security/file-validation.ts`

#### Features
- **Content Validation**: Validates actual file content using magic numbers (file signatures)
- **MIME Type Validation**: Checks declared file type
- **File Size Limits**: 
  - Images: 5MB max
  - Videos: 50MB max
- **Image Dimension Validation**: Prevents extremely large images (max 4096x4096)
- **Allowed File Types**:
  - Images: JPEG, PNG, WebP
  - Videos: MP4, QuickTime (MOV), WebM

#### Usage Example
```typescript
import { validateFile, fileValidationConfigs } from '@/lib/security/file-validation'

const result = await validateFile(file, fileValidationConfigs.image)
if (!result.valid) {
  throw new Error(result.error)
}
```

### 4. Rate Limiting

#### Location
- **File**: `src/lib/security/rate-limit.ts`

#### Configuration
- **Authentication**: 5 requests per 15 minutes
- **API Endpoints**: 100 requests per minute
- **File Uploads**: 10 requests per minute
- **Admin Actions**: 30 requests per minute

#### Implementation
Currently uses in-memory storage. For production with multiple instances, migrate to Redis:

```typescript
import { checkRateLimit, rateLimitConfigs } from '@/lib/security/rate-limit'

const result = checkRateLimit(userId, rateLimitConfigs.auth)
if (!result.success) {
  throw new Error('Rate limit exceeded')
}
```

### 5. CSRF Protection

#### Location
- **File**: `src/lib/security/csrf.ts`

#### Features
- Token-based CSRF protection
- Secure, HttpOnly cookies
- Timing-safe token comparison
- 24-hour token expiration

#### Usage Example
```typescript
import { verifyCSRFToken, setCSRFToken } from '@/lib/security/csrf'

// Generate and set token
await setCSRFToken()

// Verify token
const isValid = await verifyCSRFToken(token)
```

### 6. Security Headers

#### Configured In
- `next.config.ts`
- `vercel.json`

#### Headers Implemented
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: [Strict policy configured]
```

### 7. Open Redirect Protection

#### Location
- **File**: `src/app/auth/callback/route.ts`

#### Implementation
- Whitelist of allowed redirect paths
- Same-origin enforcement
- Validation of redirect parameter

### 8. Audit Logging

#### Location
- **File**: `src/lib/security/audit-log.ts`
- **Database**: `audit_logs` table

#### Logged Events
All admin actions are logged:
- Content creation, updates, deletion
- Publish/unpublish actions
- Authentication events

#### Audit Log Fields
- Action type
- User ID
- Resource type and ID
- Action details (JSON)
- IP address
- User agent
- Timestamp

#### Usage Example
```typescript
import { logAuditEvent } from '@/lib/security/audit-log'

await logAuditEvent({
  action: 'testimonial.create',
  user_id: user.id,
  resource_type: 'testimonial',
  resource_id: testimonialId,
  details: { name: 'Patient Name' },
})
```

### 9. Database Security

#### Row Level Security (RLS)
All tables have RLS enabled with policies:
- Public users can only read published content
- Authenticated users with proper roles can modify content
- Admins have full access

#### Storage Bucket Policies
- Only authenticated admin/editor users can upload files
- Public read access for viewing content
- User-scoped file management

#### Database Constraints
- Length constraints on all text fields
- Foreign key constraints
- Check constraints on enums and ranges

### 10. Environment Variable Validation

#### Location
- **File**: `src/lib/security/env-validation.ts`

#### Features
- Validates all required environment variables on startup
- Type checking (URL, string, number, boolean)
- Prevents application start with invalid configuration

## Best Practices

### For Developers

1. **Never Trust User Input**
   - Always validate and sanitize
   - Use provided validation utilities
   - Enforce limits at multiple layers (client, server, database)

2. **Use Parameterized Queries**
   - Supabase client handles this automatically
   - Never construct SQL manually

3. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm update
   ```

4. **Environment Variables**
   - Never commit `.env` files
   - Use different keys for dev/staging/prod
   - Rotate keys regularly

5. **Error Handling**
   - Don't expose sensitive information in errors
   - Log errors securely
   - Return generic error messages to users

6. **Authentication Flow**
   - Always verify user authentication in server actions
   - Check user roles before sensitive operations
   - Use middleware for route protection

### For Content Administrators

1. **Password Security**
   - Use strong, unique passwords
   - Enable 2FA if available
   - Never share credentials

2. **Content Review**
   - Review all content before publishing
   - Be cautious with external URLs
   - Verify image sources

3. **Access Control**
   - Use principle of least privilege
   - Regular access audits
   - Remove access for departed staff

4. **File Uploads**
   - Only upload trusted media files
   - Compress large files before upload
   - Use descriptive alt text

## Security Incident Response

### If You Suspect a Security Issue

1. **Do Not Panic**
   - Document what you observed
   - Note time and affected resources

2. **Immediate Actions**
   - Rotate compromised credentials
   - Review audit logs
   - Check for unauthorized changes

3. **Containment**
   - Disable affected accounts if needed
   - Review and revert unauthorized changes
   - Block suspicious IP addresses

4. **Investigation**
   - Review audit logs in database
   - Check server logs
   - Analyze patterns

5. **Recovery**
   - Apply security patches
   - Update compromised credentials
   - Restore from backup if needed

6. **Post-Incident**
   - Document incident
   - Update security measures
   - Train team on lessons learned

## Regular Security Maintenance

### Weekly
- Review audit logs for suspicious activity
- Check for failed login attempts

### Monthly
- Update dependencies
- Review user access
- Audit published content

### Quarterly
- Security audit of codebase
- Penetration testing
- Review and update security policies
- Rotate service keys

### Annually
- Comprehensive security review
- Third-party security assessment
- Update security documentation

## Compliance Considerations

### GDPR (if applicable)
- User data is stored securely
- Audit logs track data access
- Users can request data deletion

### Data Retention
- Audit logs older than 90 days can be archived
- Use `cleanup_old_audit_logs()` function
- Backup before deletion

## Reporting Security Vulnerabilities

If you discover a security vulnerability:

1. **Do Not** disclose publicly
2. Contact the technical team immediately
3. Provide detailed information:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Checklist for Deployment

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled on all tables
- [ ] Storage bucket policies configured
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Audit logging enabled
- [ ] Rate limiting configured
- [ ] Dependencies up to date
- [ ] Security testing completed
- [ ] Backup strategy in place
- [ ] Monitoring and alerts configured

## Additional Resources

### Supabase Security
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

### Next.js Security
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Next.js Content Security Policy](https://nextjs.org/docs/advanced-features/content-security-policy)

### General Security
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)

## Version History

- **v1.0** (2026-01-30): Initial security implementation
  - Input validation and sanitization
  - File upload security
  - Rate limiting
  - CSRF protection
  - Security headers
  - Audit logging
  - Storage policies
  - Open redirect protection
