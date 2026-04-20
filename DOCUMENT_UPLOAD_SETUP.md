# Multi-Document Upload System Setup Guide

## Overview
This system implements a robust document upload feature with Google Drive as primary storage and Cloudinary as fallback, with local storage as final fallback.

## Features Implemented

### Backend
- ✅ Multi-document upload with type mapping
- ✅ Google Drive integration with Service Account
- ✅ Cloudinary fallback mechanism
- ✅ Local storage as final fallback
- ✅ File validation (50MB max, PDF/JPG/PNG only)
- ✅ Secure document download API
- ✅ Document management in database
- ✅ Retry logic with exponential backoff
- ✅ Automatic cleanup of temporary files

### Frontend
- ✅ Multi-file selection with document type mapping
- ✅ File validation (size, type)
- ✅ Upload progress indication
- ✅ Document preview in admin panel
- ✅ Secure document download

### Database
- ✅ New `Documents` table with proper relationships
- ✅ Storage type tracking (drive/cloudinary/local)
- ✅ File metadata storage

## Setup Instructions

### 1. Database Migration

Run the migration to create the Documents table:

```bash
cd server
npm run db:migrate
```

This creates the `Documents` table with the following structure:
- `id` - Primary key
- `application_id` - Foreign key to Applications
- `document_type` - Type of document (passport, photo, etc.)
- `file_url` - URL or path to document
- `storage_type` - Where file is stored (drive/cloudinary/local)
- `file_name` - Original filename
- `mime_type` - File MIME type
- `file_size` - Size in bytes
- `drive_file_id` - Google Drive file ID (if applicable)
- `cloudinary_public_id` - Cloudinary public ID (if applicable)
- `created_at`, `updated_at` - Timestamps

### 2. Google Drive Setup

#### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

#### Step 2: Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in service account details:
   - Name: `visa-document-uploader`
   - Description: `Service account for uploading visa documents`
4. Click "Create and Continue"
5. Grant role: "Editor" or custom role with Drive permissions
6. Click "Done"

#### Step 3: Generate Service Account Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file

#### Step 4: Create Google Drive Folder
1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder for visa documents (e.g., "Visa Documents")
3. Right-click the folder > "Share"
4. Add the service account email (from JSON file) with "Editor" permissions
5. Copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

#### Step 5: Configure Environment Variables
Add to `server/.env`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
```

**Important**: 
- Copy the `client_email` from the JSON file
- Copy the `private_key` from the JSON file (keep the `\n` characters)
- Wrap the private key in double quotes

### 3. Cloudinary Setup

#### Step 1: Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email

#### Step 2: Get API Credentials
1. Go to Dashboard
2. Copy the following:
   - Cloud Name
   - API Key
   - API Secret

#### Step 3: Configure Environment Variables
Add to `server/.env`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Testing the Setup

#### Test 1: Local Storage (No Configuration)
If neither Google Drive nor Cloudinary is configured, files will be stored locally in `server/uploads/`.

```bash
# Start the server
cd server
npm start
```

Upload a document through the frontend - it should save locally.

#### Test 2: Google Drive Only
1. Configure only Google Drive credentials
2. Upload a document
3. Check server logs for `[Drive] Upload successful`
4. Verify file appears in Google Drive folder

#### Test 3: Cloudinary Fallback
1. Configure both Google Drive and Cloudinary
2. Temporarily break Google Drive (invalid credentials)
3. Upload a document
4. Check server logs for `[Upload] Falling back to Cloudinary...`
5. Verify file appears in Cloudinary dashboard

#### Test 4: Complete Flow
1. Configure both services correctly
2. Upload multiple documents with different types
3. Verify uploads in Google Drive
4. Test document download from admin panel
5. Check database for document records

### 5. Frontend Integration

The frontend has been updated to support:

#### Multi-File Upload with Document Types
```javascript
// User selects multiple files
// Each file is mapped to a document type
const documentTypes = ['passport', 'photo', 'bank_statement'];
formData.append('document_types', JSON.stringify(documentTypes));
```

#### File Validation
- Maximum file size: 50MB per file
- Allowed types: PDF, JPG, PNG
- Client-side validation before upload
- Server-side validation as backup

#### Admin Panel Features
- View all documents per application
- Download documents securely
- See storage type (Drive/Cloudinary/Local)
- File metadata display

## API Endpoints

### Public Endpoints

#### Upload Documents (Part of Application Creation)
```
POST /api/applications
Content-Type: multipart/form-data

Body:
- configuration_id: number
- user_data: JSON string
- document_types: JSON array of strings
- documents: File[] (multiple files)

Response:
{
  "message": "Application created successfully",
  "applicationId": 123,
  "documentsUploaded": 3,
  "documents": [
    {
      "id": 1,
      "document_type": "passport",
      "file_name": "passport.pdf",
      "storage_type": "drive"
    }
  ]
}
```

### Document Endpoints

#### Download Document
```
GET /api/document/:id

Response: File stream (download)
```

#### Get Document Info
```
GET /api/document/:id/info

Response:
{
  "id": 1,
  "document_type": "passport",
  "file_name": "passport.pdf",
  "mime_type": "application/pdf",
  "file_size": 1024000,
  "storage_type": "drive",
  "created_at": "2024-04-19T10:00:00Z"
}
```

#### Delete Document (Admin Only)
```
DELETE /api/document/:id
Authorization: Basic <credentials>

Response:
{
  "message": "Document deleted successfully",
  "deleted_from_storage": true
}
```

### Admin Endpoints

#### Get Application with Documents
```
GET /api/admin/applications/:id
Authorization: Basic <credentials>

Response:
{
  "id": 123,
  "configuration_id": 1,
  "user_data": {...},
  "payment_status": "completed",
  "documents": [
    {
      "id": 1,
      "document_type": "passport",
      "file_name": "passport.pdf",
      "storage_type": "drive",
      "mime_type": "application/pdf",
      "file_size": 1024000,
      "created_at": "2024-04-19T10:00:00Z"
    }
  ],
  ...
}
```

## Upload Flow

### 1. User Submits Application
```
User fills form → Selects multiple files → Maps to document types → Clicks Submit
```

### 2. Frontend Processing
```
Validate files (size, type) → Create FormData → Add document_types array → POST to /api/applications
```

### 3. Backend Processing
```
Create Application record
↓
For each file:
  ↓
  Try Google Drive (2 attempts with retry)
  ↓
  If fails → Try Cloudinary
  ↓
  If fails → Use Local Storage
  ↓
  Save Document record to DB
  ↓
  Clean up temp file (if uploaded to cloud)
↓
Return success with document list
```

### 4. Document Download Flow
```
Admin clicks Download
↓
GET /api/document/:id
↓
Fetch document from DB
↓
Check storage_type:
  - drive: Stream from Google Drive API
  - cloudinary: Redirect to secure URL
  - local: Stream from local filesystem
↓
Send file to browser
```

## Error Handling

### Upload Errors
- **File too large**: Rejected at multer level (50MB limit)
- **Invalid file type**: Rejected at multer level
- **Google Drive fails**: Automatic fallback to Cloudinary
- **Cloudinary fails**: Automatic fallback to Local
- **All fail**: Return error, don't create application

### Download Errors
- **Document not found**: 404 error
- **Storage unavailable**: 500 error with details
- **File missing**: 404 error

### Retry Logic
- Google Drive: 2 attempts with exponential backoff (1s, 2s)
- Cloudinary: Single attempt (fallback)
- Local: Always succeeds (final fallback)

## Security Considerations

### Google Drive
- Files are NOT made public
- Access only through service account
- Downloads streamed through API (not direct links)

### Cloudinary
- Files uploaded with `access_mode: authenticated`
- Secure URLs used
- Can be configured for signed URLs

### Local Storage
- Files stored in `server/uploads/`
- Served through Express static middleware
- Should be protected in production (use nginx, auth)

### API Security
- Document downloads should require authentication in production
- Consider adding application-specific tokens
- Rate limiting recommended

## Production Recommendations

### 1. Use Google Drive or Cloudinary (Not Local)
Local storage doesn't scale and files are lost on server restart (serverless).

### 2. Implement Proper Authentication
Add token-based or session-based auth for document downloads.

### 3. Add Rate Limiting
Prevent abuse of upload/download endpoints.

### 4. Monitor Storage Usage
- Google Drive: 15GB free per account
- Cloudinary: 25GB free tier
- Set up alerts for quota limits

### 5. Backup Strategy
- Regular backups of database (includes file references)
- Consider cross-cloud backup (Drive → Cloudinary or vice versa)

### 6. Logging and Monitoring
- Log all upload/download attempts
- Monitor success/failure rates
- Alert on repeated failures

## Troubleshooting

### Google Drive Upload Fails
1. Check service account credentials in .env
2. Verify service account has access to folder
3. Check Google Drive API is enabled
4. Verify folder ID is correct
5. Check API quotas in Google Cloud Console

### Cloudinary Upload Fails
1. Verify credentials in .env
2. Check Cloudinary dashboard for errors
3. Verify storage quota not exceeded
4. Check network connectivity

### Documents Not Showing in Admin Panel
1. Check database for Document records
2. Verify Application-Document relationship
3. Check browser console for API errors
4. Verify admin authentication

### Download Fails
1. Check document exists in database
2. Verify storage_type is correct
3. For Drive: Check service account still has access
4. For Cloudinary: Verify URL is still valid
5. For Local: Check file exists in uploads folder

## File Structure

```
server/
├── controllers/
│   ├── documentController.js      # Document download/delete
│   ├── publicController.js        # Updated with upload logic
│   └── adminController.js         # Updated with document queries
├── services/
│   └── uploadService.js           # Core upload logic with fallback
├── models/
│   ├── document.js                # Document model
│   └── application.js             # Updated with Document relation
├── migrations/
│   └── 20240419000001-create-documents.js
├── routes/
│   └── documentRoutes.js          # Document API routes
└── middlewares/
    └── upload.js                  # Updated multer config (50MB)
```

## Next Steps

1. **Run Migration**: `npm run db:migrate` in server folder
2. **Configure Services**: Add credentials to `.env`
3. **Test Upload**: Try uploading documents through frontend
4. **Verify Storage**: Check Google Drive/Cloudinary for files
5. **Test Download**: Download documents from admin panel
6. **Monitor Logs**: Watch server logs for upload flow

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test each storage provider independently
4. Review the troubleshooting section above
