# Service Images Feature Guide

## Overview

The service section has been redesigned to support multiple images per service with an expandable card interface. Users can click on any service card to view a gallery of images related to that service.

## Features

### Public Site (User-Facing)

1. **Expandable Service Cards**
   - Service cards display a primary thumbnail image
   - Cards with additional images show an image count badge (e.g., "📷 5")
   - Click on a card to expand and view all service images
   - Smooth animation when expanding/collapsing
   - Responsive grid layout for image gallery

2. **Visual Indicators**
   - Image count badge in top-right corner
   - Expand/collapse chevron icon in bottom-right
   - "View Images" / "Hide Images" button
   - Hover effects on gallery images

3. **Image Gallery**
   - Grid layout with responsive columns
   - Image captions displayed on hover
   - Smooth animations and transitions
   - Click outside to collapse (click on card again)

### Admin Panel

1. **Service Management**
   - Primary thumbnail image (required) - shown on service card
   - Multiple additional images (optional) - shown in expanded gallery
   - Image count badge on service list

2. **Service Image Manager**
   - Add multiple images to any service
   - Upload images with alt text and captions
   - View all images in a grid
   - Delete individual images
   - Automatic display order management

3. **Image Upload Flow**
   - Create service with primary image first
   - After creation, edit the service to add more images
   - Images are stored in the same bucket as testimonials
   - Each image can have alt text (for SEO) and caption (for display)

## Database Schema

### New Table: `service_images`

```sql
CREATE TABLE public.service_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);
```

### Relationships

- One service can have many service_images (one-to-many)
- Cascade delete: when a service is deleted, all its images are deleted
- Images are ordered by `display_order` field

## How to Use

### Adding a New Service with Images

1. **Navigate to Admin Panel**
   - Go to `/admin/services`
   - Click "+ Add Service"

2. **Create the Service**
   - Fill in service title and description
   - Upload a primary thumbnail image
   - Add alt text for SEO
   - Set display order
   - Save the service

3. **Add Additional Images**
   - After creating the service, click "Edit" on the service
   - Scroll down to "Service Images" section
   - Click "+ Add Image"
   - Upload image, add alt text and optional caption
   - Click "Add Image" to save
   - Repeat for all images you want to add

### Editing Service Images

1. **Navigate to Service Edit Page**
   - Go to `/admin/services`
   - Click "Edit" on the service you want to modify

2. **Manage Images**
   - View all existing images in the grid
   - Add new images using the "+ Add Image" button
   - Delete images using the "Delete" button on each image card
   - Images are automatically reordered

### Viewing on Public Site

1. **Visit the Homepage**
   - Scroll to "Our Featured Services" section
   - Services with multiple images show an image count badge

2. **Expand Service**
   - Click on any service card with images
   - The card expands to show the image gallery
   - Click again to collapse

## Technical Implementation

### Components

1. **FeaturedServices.tsx** (Public)
   - Client component with expandable state
   - Fetches services with related images
   - Handles expand/collapse logic
   - Responsive grid layout

2. **ServiceForm.tsx** (Admin)
   - Manages primary service details
   - Includes ServiceImageManager for editing
   - Shows image manager only when editing existing service

3. **ServiceImageManager.tsx** (Admin)
   - Handles multiple image uploads
   - Add/delete functionality
   - Grid display of all service images
   - Uses ImageUploader component for file uploads

### API Actions

- `createServiceImage(serviceId, formData)` - Add new image to service
- `updateServiceImage(imageId, formData)` - Update image details
- `deleteServiceImage(imageId)` - Remove image from service

### Data Fetching

Services are fetched with nested service_images:

```typescript
const { data: services } = await supabase
  .from('services')
  .select(`
    *,
    service_images (
      id,
      service_id,
      image_url,
      alt_text,
      caption,
      display_order,
      created_at,
      updated_at,
      created_by,
      updated_by
    )
  `)
  .eq('is_published', true)
  .order('display_order', { ascending: true })
```

## Migration

### Running the Migration

To add the service_images table to your database:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the migration
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/004_service_images.sql
```

### Existing Data

The migration automatically:
- Creates the `service_images` table
- Migrates existing service images to the new table
- Preserves the primary image in the `services` table

## Styling

The component uses CSS-in-JS with styled-jsx for scoped styles:

- Smooth transitions and animations
- Responsive grid layouts
- Hover effects and visual feedback
- Mobile-friendly design
- Accessible color contrasts

## SEO Considerations

- All images require alt text for accessibility
- Primary image alt text is used for the service card
- Additional images can have specific alt text
- Captions provide context for users and search engines

## Performance

- Images are lazy-loaded using Next.js Image component
- Gallery images only render when expanded
- Efficient database queries with proper indexing
- Automatic image optimization by Next.js

## Future Enhancements

Potential improvements:
- Drag-and-drop reordering of images
- Bulk image upload
- Image editing/cropping tools
- Lightbox/modal view for full-size images
- Video support in gallery
- Image compression before upload

## Troubleshooting

### Images not showing
- Check RLS policies in Supabase
- Verify image URLs are accessible
- Check browser console for errors

### Can't add images
- Ensure service is created first
- Check user permissions (admin/editor role)
- Verify storage bucket permissions

### Gallery not expanding
- Check JavaScript console for errors
- Ensure service has images in database
- Verify client component is properly hydrated

## Support

For issues or questions:
1. Check the database schema in `supabase/migrations/004_service_images.sql`
2. Review component code in `src/components/`
3. Check admin actions in `src/app/admin/actions.ts`
