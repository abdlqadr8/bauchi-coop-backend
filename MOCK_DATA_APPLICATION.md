# Mock Data for Submit Application Endpoint Testing

## Test Scenario 1: Basic Application Without Documents

```bash
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "cooperativeName": "Bauchi Farmers Cooperative Union",
    "registrationNumber": "REG-BFC-2024-001",
    "address": "Bauchi, Bauchi State, Nigeria",
    "contactPerson": "Alhaji Muhammad Sani",
    "phoneNumber": "08012345678",
    "emailAddress": "contact@bauchifarmers.org",
    "description": "We are a cooperative focused on agricultural development and farmer support services in Bauchi State."
  }'
```

## Test Scenario 2: Application With Single Document

First, create a small PDF file and encode it to Base64:

```bash
# Create a small test PDF
echo "%PDF-1.4" > test.pdf
echo "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj" >> test.pdf
echo "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj" >> test.pdf
echo "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj" >> test.pdf
echo "xref" >> test.pdf
echo "0 4" >> test.pdf
echo "0000000000 65535 f" >> test.pdf
echo "0000000009 00000 n" >> test.pdf
echo "0000000058 00000 n" >> test.pdf
echo "0000000115 00000 n" >> test.pdf
echo "trailer<</Size 4/Root 1 0 R>>" >> test.pdf
echo "startxref" >> test.pdf
echo "185" >> test.pdf
echo "%%EOF" >> test.pdf

# Convert to Base64
BASE64_PDF=$(base64 < test.pdf | tr -d '\n')
```

Then test with the Base64 encoded PDF:

```bash
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "cooperativeName": "Lagos Women Fisheries Cooperative Association",
    "registrationNumber": "REG-LWFCA-2023-045",
    "address": "Epe, Lagos State, Nigeria",
    "contactPerson": "Mrs. Hauwa Abubakar",
    "phoneNumber": "08098765432",
    "emailAddress": "contact@lagosfish.org",
    "description": "Women-focused fisheries cooperative promoting sustainable fishing practices and economic empowerment in Lagos State.",
    "documents": [
      {
        "filename": "CONSTITUTION.pdf",
        "data": "JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iCjMgMCBvYmo8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC8+Pj5lbmRvYgp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDAwOSAwMDAwMCBuCjAwMDAwMDA1OCAwMDAwMCBuCjAwMDAwMDAxMTUgMDAwMDAgbgp0cmFpbGVyPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgpzdGFydHhlcmYKMTg1CiUlRU9G",
        "documentType": "CONSTITUTION"
      }
    ]
  }'
```

## Test Scenario 3: Application With Multiple Documents

```bash
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "cooperativeName": "Kaduna Grains Milling Cooperative",
    "registrationNumber": "REG-KGM-2022-089",
    "address": "Kaduna, Kaduna State, Nigeria",
    "contactPerson": "Malam Hassan Abdullahi",
    "phoneNumber": "07061234567",
    "emailAddress": "info@kadunagrains.org",
    "description": "Cooperative focused on grain milling, storage, and distribution services across northern Nigeria.",
    "documents": [
      {
        "filename": "CERTIFICATE_OF_INCORPORATION.pdf",
        "data": "JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iCjMgMCBvYmo8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC8+Pj5lbmRvYgp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDAwOSAwMDAwMCBuCjAwMDAwMDA1OCAwMDAwMCBuCjAwMDAwMDAxMTUgMDAwMDAgbgp0cmFpbGVyPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgpzdGFydHhlcmYKMTg1CiUlRU9G",
        "documentType": "CERTIFICATE"
      },
      {
        "filename": "BYLAWS_AND_CONSTITUTION.pdf",
        "data": "JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iCjMgMCBvYmo8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC8+Pj5lbmRvYgp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDAwOSAwMDAwMCBuCjAwMDAwMDA1OCAwMDAwMCBuCjAwMDAwMDAxMTUgMDAwMDAgbgp0cmFpbGVyPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgpzdGFydHhlcmYKMTg1CiUlRU9G",
        "documentType": "CONSTITUTION"
      },
      {
        "filename": "BANK_STATEMENT.pdf",
        "data": "JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iCjMgMCBvYmo8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC8+Pj5lbmRvYgp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDAwOSAwMDAwMCBuCjAwMDAwMDA1OCAwMDAwMCBuCjAwMDAwMDAxMTUgMDAwMDAgbgp0cmFpbGVyPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgpzdGFydHhlcmYKMTg1CiUlRU9G",
        "documentType": "BANK_STATEMENT"
      }
    ]
  }'
```

## Test Scenario 4: Honey Producer Cooperative

```bash
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "cooperativeName": "Niger Honey Producers Association",
    "registrationNumber": "REG-NHP-2024-012",
    "address": "Minna, Niger State, Nigeria",
    "contactPerson": "Mr. Jibrin Abubakar",
    "phoneNumber": "08055556789",
    "emailAddress": "info@nigerhoney.org",
    "description": "Association of honey producers dedicated to sustainable beekeeping and honey production in Niger State.",
    "documents": [
      {
        "filename": "MEMBERSHIP_LIST.pdf",
        "data": "JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iCjMgMCBvYmo8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC8+Pj5lbmRvYgp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDAwOSAwMDAwMCBuCjAwMDAwMDA1OCAwMDAwMCBuCjAwMDAwMDAxMTUgMDAwMDAgbgp0cmFpbGVyPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgpzdGFydHhlcmYKMTg1CiUlRU9G",
        "documentType": "MEMBERSHIP_LIST"
      }
    ]
  }'
```

## Test Scenario 5: Vegetable Farmers Cooperative

```bash
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "cooperativeName": "Osun State Vegetable Farmers Cooperative",
    "registrationNumber": "REG-OSVF-2023-067",
    "address": "Osogbo, Osun State, Nigeria",
    "contactPerson": "Mrs. Folake Adeyemi",
    "phoneNumber": "08034567890",
    "emailAddress": "info@osunveggies.org",
    "description": "Cooperative of vegetable farmers promoting organic farming methods and market access for smallholder farmers in Osun State.",
    "documents": [
      {
        "filename": "FARM_CERTIFICATION.pdf",
        "data": "JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iCjMgMCBvYmo8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC8+Pj5lbmRvYgp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDAwOSAwMDAwMCBuCjAwMDAwMDA1OCAwMDAwMCBuCjAwMDAwMDAxMTUgMDAwMDAgbgp0cmFpbGVyPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgpzdGFydHhlcmYKMTg1CiUlRU9G",
        "documentType": "CERTIFICATE"
      }
    ]
  }'
```

## Expected Success Response

```json
{
  "id": "cluxxxxxxxxxxxxxxx",
  "cooperativeName": "Bauchi Farmers Cooperative Union",
  "registrationNumber": "REG-BFC-2024-001",
  "email": "contact@bauchifarmers.org",
  "phone": "08012345678",
  "address": "Bauchi, Bauchi State, Nigeria",
  "status": "NEW",
  "submittedAt": "2025-11-14T19:30:45.123Z"
}
```

## How to Get Documents (Admin Only)

```bash
# First, get the application ID from the submit response above
# Then use this to fetch the application with documents

curl -X GET http://localhost:3000/api/v1/applications/applications/{APPLICATION_ID} \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json"
```

### Expected Response:

```json
{
  "id": "cluxxxxxxxxxxxxxxx",
  "cooperativeName": "Lagos Women Fisheries Cooperative Association",
  "registrationNumber": "REG-LWFCA-2023-045",
  "email": "contact@lagosfish.org",
  "phone": "08098765432",
  "address": "Epe, Lagos State, Nigeria",
  "status": "NEW",
  "submittedAt": "2025-11-14T19:31:22.456Z",
  "reviewedAt": null,
  "reviewedBy": null,
  "notes": null,
  "documents": [
    {
      "id": "doc-uuid-123",
      "filename": "CONSTITUTION.pdf",
      "fileUrl": "https://res.cloudinary.com/dqy71jbij/image/upload/v1700079600/bauchi_coops_documents/cluxxxxxxxxxxxxxxx/CONSTITUTION.pdf",
      "documentType": "CONSTITUTION",
      "uploadedAt": "2025-11-14T19:31:22.456Z"
    }
  ]
}
```

## Base64 Conversion Helper (JavaScript)

If you need to convert files to Base64 in JavaScript:

```javascript
// In your React component
function handleFileUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const base64String = e.target.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
    
    const documentData = {
      filename: file.name,
      data: base64String,
      documentType: 'CONSTITUTION' // or CERTIFICATE, etc.
    };
    
    console.log('Document ready for upload:', documentData);
    // Send this in your application submission
  };
  
  reader.readAsDataURL(file);
}
```

## Base64 Conversion Helper (Node.js)

```javascript
const fs = require('fs');

function fileToBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
}

// Usage
const base64String = fileToBase64('/path/to/file.pdf');
console.log(base64String);
```

## Testing Steps

1. **Test without documents:**
   - Use Test Scenario 1
   - Should return application ID with status "NEW"

2. **Test with one document:**
   - Use Test Scenario 2
   - Check that Cloudinary upload succeeds
   - Verify document URL is stored in database

3. **Test with multiple documents:**
   - Use Test Scenario 3
   - All documents should be uploaded to `bauchi_coops_documents/{appId}/`
   - Each document should have its own Cloudinary URL

4. **Verify document storage:**
   - Log into your Cloudinary dashboard
   - Navigate to the `bauchi_coops_documents` folder
   - You should see subfolders for each application ID

5. **Admin retrieval:**
   - Authenticate with admin JWT token
   - Fetch the application with admin endpoint
   - Verify all document URLs are accessible

## Document Types

Supported document types for categorization:
- `CONSTITUTION` - Cooperative bylaws and constitution
- `CERTIFICATE` - Certificate of incorporation/registration
- `BANK_STATEMENT` - Bank account statements
- `MEMBERSHIP_LIST` - List of members
- `FARM_CERTIFICATION` - Farm certifications
- `LICENSE` - Operating licenses
- `OTHER` - Any other document

## Troubleshooting

### Issue: Base64 data too large
**Solution:** Ensure files are under 50MB. For PDFs, consider compressing them first.

### Issue: Document upload fails
**Solution:** Check:
- Cloudinary credentials in `.env` file
- Network connectivity to Cloudinary API
- File format is supported

### Issue: File not appearing in Cloudinary
**Solution:** 
- Check if upload succeeded (look at application response)
- Verify `bauchi_coops_documents` folder exists in Cloudinary dashboard
- Check Cloudinary upload preset permissions

## Postman Collection Alternative

If using Postman, import this collection:

```json
{
  "info": {
    "name": "Bauchi Coop Applications API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Submit Application Basic",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/v1/applications",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"cooperativeName\": \"Bauchi Farmers Cooperative Union\",\"registrationNumber\": \"REG-BFC-2024-001\",\"address\": \"Bauchi, Bauchi State, Nigeria\",\"contactPerson\": \"Alhaji Muhammad Sani\",\"phoneNumber\": \"08012345678\",\"emailAddress\": \"contact@bauchifarmers.org\",\"description\": \"We are a cooperative focused on agricultural development and farmer support services in Bauchi State.\"}"
        }
      }
    }
  ]
}
```
