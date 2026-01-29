# Deployment Checklist - Service Images Feature

## Pre-Deployment

### 1. Review Changes
- [ ] Read `CHANGES-SUMMARY.md` for overview
- [ ] Read `SERVICE-IMAGES-GUIDE.md` for usage details
- [ ] Review `SERVICE-DESIGN-EXAMPLE.md` for visual guide

### 2. Backup Database
```bash
# Create a backup before running migration
pg_dump -h your-db-host -U postgres -d postgres > backup_$(date +%Y%m%d).sql
```

### 3. Test Locally
- [ ] Run migration on local database
- [ ] Test service creation
- [ ] Test image upload
- [ ] Test expand/collapse functionality
- [ ] Test on mobile devices
- [ ] Check browser console for errors

## Deployment Steps

### Step 1: Database Migration

#### Option A: Using Supabase CLI (Recommended)
```bash
# Make sure you're in the project directory
cd /Users/divij/code/ai/smile-right

# Login to Supabase (if not already)
supabase login

# Link to your project (if not already)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

#### Option B: Manual SQL Execution
```bash
# Connect to your database
psql -h your-db-host -U postgres -d postgres

# Run the migration
\i supabase/migrations/004_service_images.sql

# Verify tables were created
\dt service_images

# Check RLS policies
\d+ service_images
```

#### Option C: Supabase Dashboard
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/004_service_images.sql`
4. Paste and run

### Step 2: Verify Migration
```sql
-- Check table exists
SELECT COUNT(*) FROM service_images;

-- Check existing images were migrated
SELECT s.title, COUNT(si.id) as image_count
FROM services s
LEFT JOIN service_images si ON s.id = si.service_id
GROUP BY s.id, s.title;

-- Test RLS policies (as public user)
SELECT * FROM service_images;
```

### Step 3: Deploy Code

#### If using Vercel
```bash
# Commit changes
git add .
git commit -m "Add service images feature with expandable gallery"

# Push to repository
git push origin main

# Vercel will auto-deploy
```

#### If using other hosting
```bash
# Build the project
npm run build

# Test the build locally
npm start

# Deploy using your platform's CLI or dashboard
```

### Step 4: Post-Deployment Verification

#### Public Site
- [ ] Visit homepage
- [ ] Scroll to Services section
- [ ] Verify services display correctly
- [ ] Check if image count badges appear (if services have images)
- [ ] Test expand/collapse on a service
- [ ] Verify gallery displays correctly
- [ ] Test on mobile device
- [ ] Check page load performance

#### Admin Panel
- [ ] Login to `/admin`
- [ ] Navigate to Services
- [ ] Verify service list shows image counts
- [ ] Create a new test service
- [ ] Edit the test service
- [ ] Add multiple images to the service
- [ ] Verify images appear in gallery
- [ ] Delete a test image
- [ ] Verify deletion works
- [ ] Check the service on public site

### Step 5: Add Images to Existing Services

For each service that needs multiple images:

1. **Prepare Images**
   - Collect high-quality images
   - Optimize file sizes (< 1MB each recommended)
   - Prepare alt text for SEO
   - Write captions if needed

2. **Upload Process**
   - Go to `/admin/services`
   - Click "Edit" on the service
   - Scroll to "Service Images" section
   - Click "+ Add Image"
   - Upload image and add details
   - Repeat for all images

3. **Verify**
   - Check service on public site
   - Verify images display correctly
   - Test expand/collapse
   - Check mobile view

## Rollback Plan

### If Issues Occur

#### Quick Fix (Keep Table, Revert Code)
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Services will work with primary image only
# service_images table remains but is unused
```

#### Full Rollback (Remove Table)
```sql
-- Connect to database
psql -h your-db-host -U postgres -d postgres

-- Drop the table (this will delete all service images!)
DROP TABLE IF EXISTS service_images CASCADE;

-- Then revert code as above
```

## Monitoring

### After Deployment

#### Check Logs
```bash
# Vercel logs
vercel logs

# Or check your hosting platform's logs
```

#### Monitor Performance
- [ ] Check page load times
- [ ] Monitor database query performance
- [ ] Check error rates in logs
- [ ] Monitor user engagement with expanded galleries

#### Database Health
```sql
-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('service_images'));

-- Check number of images
SELECT COUNT(*) FROM service_images;

-- Check images per service
SELECT 
  s.title,
  COUNT(si.id) as image_count
FROM services s
LEFT JOIN service_images si ON s.id = si.service_id
GROUP BY s.id, s.title
ORDER BY image_count DESC;
```

## Troubleshooting

### Common Issues

#### Images Not Showing on Public Site
```sql
-- Check RLS policies
SELECT * FROM service_images WHERE service_id = 'your-service-id';

-- Verify service is published
SELECT is_published FROM services WHERE id = 'your-service-id';

-- Check image URLs are valid
SELECT image_url FROM service_images WHERE service_id = 'your-service-id';
```

#### Can't Add Images in Admin
```sql
-- Check user role
SELECT role FROM profiles WHERE id = 'your-user-id';

-- Verify RLS policies allow insert
SELECT * FROM pg_policies WHERE tablename = 'service_images';
```

#### Gallery Not Expanding
- Check browser console for JavaScript errors
- Verify service has images in database
- Clear browser cache
- Check if service_images are being fetched in the query

### Performance Issues
```sql
-- Check if indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'service_images';

-- Add indexes if missing
CREATE INDEX IF NOT EXISTS idx_service_images_service_id 
  ON service_images(service_id);
CREATE INDEX IF NOT EXISTS idx_service_images_display_order 
  ON service_images(service_id, display_order);
```

## Success Criteria

### Deployment is Successful When:
- [x] Migration runs without errors
- [x] All tests pass
- [x] Public site displays services correctly
- [x] Admin panel can add/edit/delete images
- [x] No errors in logs
- [x] Page performance is acceptable
- [x] Mobile view works correctly
- [x] Images load properly
- [x] Expand/collapse works smoothly

## Next Steps After Deployment

1. **Add Images to Services**
   - Start with most popular services
   - Add 3-5 images per service minimum
   - Use high-quality, relevant images

2. **Monitor Analytics**
   - Track user engagement with galleries
   - Monitor conversion rates
   - Check bounce rates on service section

3. **Gather Feedback**
   - Ask users about the new feature
   - Monitor support tickets
   - Check for any usability issues

4. **Optimize**
   - Compress images if needed
   - Adjust gallery layout based on usage
   - Add more images based on feedback

## Support Contacts

- **Technical Issues**: Check GitHub issues or contact dev team
- **Database Issues**: Check Supabase dashboard and logs
- **Hosting Issues**: Check Vercel/hosting platform dashboard

## Documentation References

- Main Guide: `SERVICE-IMAGES-GUIDE.md`
- Changes: `CHANGES-SUMMARY.md`
- Design: `SERVICE-DESIGN-EXAMPLE.md`
- This Checklist: `DEPLOYMENT-CHECKLIST.md`

---

**Last Updated**: January 30, 2026
**Version**: 1.0
**Feature**: Service Images with Expandable Gallery
