# Separate Media Upload - Complete Implementation Guide

## FILES CHANGED/CREATED

### Backend (ServiceApp)

#### New Files:
1. `dto/MediaUploadDTO.java` - Response DTO for media uploads
2. `dto/PropertyMediaDTO.java` - DTO for property media metadata
3. `util/ImageThumbnailUtil.java` - Image thumbnail generation utility
4. `controller/MediaUploadController.java` - Separate upload endpoints

#### Modified Files:
1. `model/PropertyMedia.java` - Added: thumbnailUrl, s3Key, thumbnailS3Key fields
2. `controller/PropertyController.java` - Added: createPropertyWithMedia() JSON endpoint

### Frontend (WebApp)

#### New Files:
1. `services/mediaUploadService.js` - Upload service with progress tracking
2. `components/AddPropertyNew.js` - Refactored component with separate uploads

#### Modified Files:
1. `services/propertyService.js` - Updated createProperty() to use JSON
2. `build.js` - Added mediaUploadService.js to build files

## API ENDPOINTS

### New Upload Endpoints:
```
POST /api/uploads/image
- Accepts: multipart/form-data (file)
- Returns: { mediaUrl, thumbnailUrl, s3Key, thumbnailS3Key, mediaType, fileName, fileSize }
- Validation: Max 5MB, JPG/JPEG/PNG only
- Auto-generates 300x300 thumbnail

POST /api/uploads/video
- Accepts: multipart/form-data (file)
- Returns: { mediaUrl, s3Key, mediaType, fileName, fileSize }
- Validation: Max 50MB, MP4/MPEG/MOV only
```

### New Property Save Endpoint:
```
POST /api/properties (Content-Type: application/json)
- Accepts: {
    title, description, propertyType, location, city, eircode, county,
    furnishType, price, bedrooms, bathrooms, availableFrom, amenities,
    media: [{ mediaUrl, thumbnailUrl, s3Key, thumbnailS3Key, mediaType, displayOrder, isPrimary }]
  }
- Returns: ResponseDTO with propertyId
```

## DATABASE MIGRATION

Run this SQL before deploying:

```sql
ALTER TABLE property_media 
ADD COLUMN thumbnail_url VARCHAR(500),
ADD COLUMN s3_key VARCHAR(500),
ADD COLUMN thumbnail_s3_key VARCHAR(500);
```

## DEPLOYMENT STEPS

### 1. Backend Deployment:
```bash
cd ServiceApp
mvn clean package -DskipTests
# Deploy serviceapp.jar
```

### 2. Database Migration:
```sql
-- Run the ALTER TABLE statement above
```

### 3. Frontend Deployment:

**Option A: Use New Component (Recommended)**
Replace AddProperty.js with AddPropertyNew.js:
```bash
cd WebApp/src/main/resources/react-frontend/components
mv AddProperty.js AddProperty.old.js
mv AddPropertyNew.js AddProperty.js
```

**Option B: Keep Both**
Update build.js to use AddPropertyNew:
```javascript
const files = [
  // ...
  'components/AddPropertyNew.js',  // Instead of AddProperty.js
  // ...
];
```

Then build:
```bash
cd WebApp
mvn clean package -DskipTests
# Deploy webapp.jar
```

## TESTING GUIDE

### 1. Test Image Upload:
- Navigate to Add Property page
- Click "Click to upload images"
- Select 1-3 images
- Verify progress bar shows
- Verify thumbnail appears
- Verify no errors

### 2. Test Video Upload:
- Click "Click to upload video"
- Select a video file
- Verify progress bar shows
- Verify video name appears
- Verify no errors

### 3. Test File Validation:
- Try uploading >5MB image (should fail)
- Try uploading >50MB video (should fail)
- Try uploading .txt file as image (should fail)

### 4. Test Property Save:
- Fill all required fields
- Upload at least 1 image
- Click "Save Property"
- Verify redirects to My Properties
- Verify property appears with thumbnail

### 5. Test Remove Media:
- Upload an image
- Click X button on image
- Verify image removed
- Upload again
- Verify works

## FEATURES IMPLEMENTED

✅ Separate image upload with progress tracking
✅ Separate video upload with progress tracking
✅ Automatic thumbnail generation (300x300)
✅ File type validation
✅ File size validation
✅ Upload progress per file
✅ Error handling per file
✅ Remove uploaded media before save
✅ Disable save button while uploading
✅ JSON-based property save with media metadata
✅ S3 storage with proper keys
✅ Backward compatibility (old multipart endpoint still works)

## FEATURES NOT IMPLEMENTED (Future Enhancements)

❌ Video thumbnail auto-generation (structure supports it)
❌ Edit mode media management
❌ Drag-and-drop reordering
❌ Image cropping/editing
❌ Local storage support for separate uploads
❌ Retry failed uploads
❌ Pause/resume uploads

## CONFIGURATION

### Required application.properties:
```properties
# S3 Configuration (required for separate uploads)
app.storage.mode=s3
aws.s3.bucket-name=your-bucket-name
aws.s3.region=eu-west-1
aws.access-key-id=your-access-key
aws.secret-access-key=your-secret-key
```

## TROUBLESHOOTING

### Issue: "Only S3 storage mode supported"
**Solution**: Set `app.storage.mode=s3` in application.properties

### Issue: Upload fails with 401
**Solution**: Ensure user is logged in, check session

### Issue: Upload fails with 400
**Solution**: Check file size and type constraints

### Issue: Thumbnail not generated
**Solution**: Verify Java AWT is available, check server logs

### Issue: Property save fails
**Solution**: Verify all required fields filled, check media array format

## BACKWARD COMPATIBILITY

The old multipart upload endpoint still works:
```
POST /api/properties (Content-Type: multipart/form-data)
```

This allows gradual migration. You can:
1. Deploy backend with both endpoints
2. Test new flow
3. Switch frontend when ready
4. Remove old endpoint later

## PERFORMANCE NOTES

- Image thumbnail generation adds ~100-200ms per image
- Uploads happen sequentially (can be parallelized if needed)
- Progress tracking uses axios onUploadProgress
- Thumbnails stored separately in S3 (doubles storage but improves listing performance)

## SECURITY NOTES

- All uploads require authentication
- File type validation on backend
- File size limits enforced
- S3 keys use UUID to prevent collisions
- No direct S3 access from frontend

## NEXT STEPS

1. Test thoroughly in development
2. Run database migration in staging
3. Deploy to staging
4. Perform UAT
5. Deploy to production
6. Monitor for errors
7. Consider adding video thumbnail generation
8. Consider adding edit mode support
