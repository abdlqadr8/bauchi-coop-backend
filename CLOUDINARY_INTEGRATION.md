# Cloudinary Document Upload Integration

## Overview
Modified the user application implementation to automatically upload documents to Cloudinary and store the URLs in the database instead of storing local file paths.

## Changes Made

### 1. **CloudinaryService Enhancement** 
**File:** `src/modules/files/cloudinary.service.ts`

Added new `uploadFile()` method to handle server-side file uploads to Cloudinary:
```typescript
async uploadFile(
  fileBuffer: Buffer,
  filename: string,
  folder: string = 'documents',
): Promise<{ url: string; publicId: string }>
```

**Features:**
- Accepts file as Buffer and filename
- Automatically organizes files into folders (e.g., `documents/applicationId`)
- Uses upload preset for security
- Returns both the secure URL and public ID
- Full error logging and handling

### 2. **ApplicationsModule Update**
**File:** `src/modules/applications/applications.module.ts`

- Added `FilesModule` import to access CloudinaryService
- CloudinaryService is now available throughout the ApplicationsService

### 3. **ApplicationsService Modification**
**File:** `src/modules/applications/applications.service.ts`

**Injected:** CloudinaryService

**Updated submitApplication() method:**
- Documents now arrive as Base64-encoded data (field name: `data` instead of `fileUrl`)
- Each document is converted from Base64 to Buffer
- Document is uploaded to Cloudinary with folder structure: `applications/{applicationId}`
- The returned Cloudinary URL is stored in the database
- Documents are organized per application in Cloudinary
- Comprehensive error handling for upload failures

**Transaction Flow:**
1. Create application record
2. For each document:
   - Convert Base64 to Buffer
   - Upload to Cloudinary
   - Store returned URL in database
3. Return application details

### 4. **SubmitApplicationDto Update**
**File:** `src/modules/applications/dto/submit-application.dto.ts`

**Changed document structure:**
```typescript
// OLD - Expected pre-generated URLs
documents?: Array<{
  filename: string;
  fileUrl: string;        // Pre-generated URL
  documentType: string;
}>;

// NEW - Accepts Base64 encoded file data
documents?: Array<{
  filename: string;
  data: string;           // Base64 encoded file data
  documentType: string;
}>;
```

## Frontend Implementation Guide

### Uploading with Documents

```typescript
// 1. Read file from input
const fileInput = document.getElementById('document') as HTMLInputElement;
const file = fileInput.files?.[0];

// 2. Convert to Base64
const reader = new FileReader();
reader.onload = (e) => {
  const base64Data = e.target?.result as string;
  const base64String = base64Data.split(',')[1]; // Remove data:image/png;base64, prefix
  
  // 3. Send to backend
  const payload = {
    cooperativeName: 'Bauchi Farmers Coop',
    registrationNumber: 'REG-001',
    address: 'Bauchi, Nigeria',
    contactPerson: 'John Doe',
    phoneNumber: '08012345678',
    emailAddress: 'john@example.com',
    description: 'Application for membership',
    documents: [
      {
        filename: file.name,
        data: base64String,  // Base64 encoded data
        documentType: 'CONSTITUTION'
      }
    ]
  };
  
  const response = await fetch('/api/v1/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};

reader.readAsDataURL(file);
```

## Database Storage

### Document Records
Documents are now stored with Cloudinary URLs:

```sql
Document table:
- id: UUID
- applicationId: UUID
- filename: string (original filename)
- fileUrl: string (Cloudinary secure URL)
- documentType: string (CONSTITUTION, CERTIFICATE, etc.)
- uploadedAt: Date

Example fileUrl: https://res.cloudinary.com/dqy71jbij/image/upload/v1700079600/applications/app-id-here/document.pdf
```

## Cloudinary Folder Structure

Documents are organized as:
```
applications/
  └── {applicationId}/
      ├── document1.pdf
      ├── certificate.jpg
      └── charter.docx
```

## Benefits

1. **No Local Storage** - Files are hosted on Cloudinary CDN
2. **Secure URLs** - All URLs use HTTPS
3. **Automatic Scaling** - Images auto-scaled for different devices
4. **Version Control** - Upload versions tracked by Cloudinary
5. **Easy Cleanup** - Files can be deleted via publicId
6. **Organization** - Files grouped by application ID

## Error Handling

- Invalid Base64 data → Error thrown with message
- Cloudinary upload failure → Application submission fails
- Network issues → Caught and logged with retry capability

## Environment Variables Required

```bash
CLOUDINARY_CLOUD_NAME=dqy71jbij
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=bauchi-coops
```

## Testing the Integration

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "cooperativeName": "Test Coop",
    "registrationNumber": "TEST-001",
    "address": "Test Address",
    "contactPerson": "Test Person",
    "phoneNumber": "08012345678",
    "emailAddress": "test@example.com",
    "description": "Test",
    "documents": [{
      "filename": "test.pdf",
      "data": "JVBERi0xLjQKJeLjz9MNCjEg... (base64 encoded PDF)",
      "documentType": "CONSTITUTION"
    }]
  }'
```

### Response:
```json
{
  "id": "app-uuid",
  "cooperativeName": "Test Coop",
  "registrationNumber": "TEST-001",
  "email": "test@example.com",
  "phone": "08012345678",
  "address": "Test Address",
  "status": "NEW",
  "submittedAt": "2025-11-14T19:30:00.000Z"
}
```

Admin can then retrieve documents with URLs:
```bash
GET /api/v1/applications/applications/{applicationId}
```

Response includes:
```json
{
  "documents": [{
    "id": "doc-uuid",
    "filename": "test.pdf",
    "fileUrl": "https://res.cloudinary.com/dqy71jbij/image/upload/v1700079600/applications/app-id/test.pdf",
    "documentType": "CONSTITUTION",
    "uploadedAt": "2025-11-14T19:30:00.000Z"
  }]
}
```

## Next Steps

1. Update React frontend to send Base64 encoded files
2. Display Cloudinary URLs in admin dashboard
3. Implement document download links in user panel
4. Add file deletion functionality (revoke certificates)
5. Implement file versioning if needed
