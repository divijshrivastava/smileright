# Setup Guide for New Features

This guide will help you set up the new admin-editable Trust Section and enhanced Testimonials with image/video support.

## Features Added

### 1. Trust Section - Admin Editable Carousel
- Admin can upload and manage multiple images for the Trust Section
- Images display in a beautiful carousel with captions
- Full CRUD operations (Create, Read, Update, Delete)

### 2. Testimonials - Image, Video, and Text Support
- Testimonials now support multiple media types:
  - Text only
  - Image only
  - Video only
  - Image + Text
  - Video + Text
- Videos and images display in the carousel

## Setup Instructions

### Step 1: Run Database Migration

Run the new migration to create the `trust_images` table and update the `testimonials` table:

```bash
# Apply the migration in Supabase Dashboard
# Copy the contents of: supabase/migrations/002_trust_and_media.sql
# Paste and run in: Supabase Dashboard > SQL Editor
```

### Step 2: Create Storage Buckets

You need to create two new storage buckets in Supabase:

#### Bucket 1: trust-images
1. Go to Supabase Dashboard > Storage
2. Click "New bucket"
3. Name: `trust-images`
4. Public: ✓ (checked)
5. File size limit: 5 MB (5242880 bytes)
6. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

#### Bucket 2: testimonial-videos
1. Go to Supabase Dashboard > Storage
2. Click "New bucket"
3. Name: `testimonial-videos`
4. Public: ✓ (checked)
5. File size limit: 50 MB (52428800 bytes)
6. Allowed MIME types: `video/mp4`, `video/quicktime`, `video/webm`

**Alternative: Run via SQL**

You can also create these buckets via SQL in the Supabase SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('trust-images', 'trust-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('testimonial-videos', 'testimonial-videos', true, 52428800, ARRAY['video/mp4', 'video/quicktime', 'video/webm']);
```

### Step 3: Set Storage Policies (Optional)

If you want more control over who can upload/delete files, you can set custom storage policies. By default, authenticated users with the admin/editor role can upload and manage files.

### Step 4: Test the Features

1. **Trust Images:**
   - Log into admin panel: `/admin/login`
   - Navigate to "Trust Images" in the sidebar
   - Click "Add Trust Image"
   - Upload an image, add a caption, and publish
   - Visit the homepage to see the carousel in the Trust Section

2. **Testimonials with Media:**
   - Navigate to "Testimonials" or "Add Testimonial"
   - Select a media type (text, image, video, etc.)
   - Upload media based on the type selected
   - Add testimonial text and details
   - Publish and view on the homepage

## New Admin Pages

- `/admin/trust-images` - Manage trust section images
- `/admin/trust-images/new` - Add new trust image
- `/admin/trust-images/[id]/edit` - Edit existing trust image

## Updated Components

### Trust Section
- Now fetches and displays admin-uploaded images in a carousel
- Original trust grid items still display below the carousel

### Testimonials
- Supports image and video display
- Conditional rendering based on media type
- Enhanced carousel with media preview

## Database Schema Changes

### New Table: `trust_images`
```sql
- id (UUID)
- image_url (TEXT)
- alt_text (TEXT)
- caption (TEXT)
- display_order (INTEGER)
- is_published (BOOLEAN)
- created_at, updated_at (TIMESTAMPTZ)
- created_by, updated_by (UUID)
```

### Updated Table: `testimonials`
```sql
- video_url (TEXT) - NEW
- media_type (TEXT) - NEW
  Options: 'text', 'image', 'video', 'image_text', 'video_text'
```

## Troubleshooting

### Images/Videos Not Uploading
- Check that storage buckets are created and public
- Verify file size limits
- Check MIME types are allowed

### Images Not Displaying
- Ensure images are marked as "Published"
- Check browser console for errors
- Verify image URLs are accessible

### Migration Errors
- Make sure you're connected to the correct Supabase project
- Run migrations in order (001 before 002)
- Check for any existing table conflicts

## Next Steps

1. Upload trust section images showcasing your clinic
2. Update existing testimonials with photos/videos
3. Create new video testimonials for better engagement
4. Monitor the admin panel for easy content management

---

For questions or issues, check the main README.md or consult the code comments.
