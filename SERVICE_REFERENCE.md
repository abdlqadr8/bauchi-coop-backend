# Service Reference Guide

## PaystackService
**Location**: `src/modules/payments/paystack.service.ts`  
**Purpose**: Interface with Paystack payment API

### Methods

#### `initializePayment(email: string, amount: number, reference: string, metadata: object)`
Initializes a payment on Paystack and returns checkout details.

**Parameters**:
- `email` - User's email for payment
- `amount` - Amount in kobo (naira × 100)
- `reference` - Unique transaction reference
- `metadata` - Additional data (cooperativeName, etc.)

**Returns**:
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "code",
  "reference": "reference"
}
```

**Example**:
```typescript
const result = await this.paystackService.initializePayment(
  'user@example.com',
  1000000, // 10,000 naira
  'REF-1234567890',
  { cooperativeName: 'Test Coop' }
);
```

---

#### `verifyPayment(reference: string)`
Verifies a payment with Paystack using the transaction reference.

**Parameters**:
- `reference` - Transaction reference from initialization

**Returns**:
```json
{
  "status": "success",
  "message": "Authorization URL created",
  "data": {
    "reference": "reference",
    "status": "success",
    "amount": 1000000,
    "paid_at": "2024-01-01T00:00:00Z"
  }
}
```

**Throws**:
- `BadRequestException` - If payment not found
- `Error` - If Paystack API fails

---

#### `verifyWebhookSignature(signature: string, payload: string)`
Validates that a webhook came from Paystack (not tampered).

**Parameters**:
- `signature` - Signature from `x-paystack-signature` header
- `payload` - Raw request body as string

**Returns**: `boolean` - True if signature is valid

**Example**:
```typescript
const isValid = this.paystackService.verifyWebhookSignature(
  headers['x-paystack-signature'],
  JSON.stringify(body)
);
```

---

#### `generateReference()`
Generates a unique transaction reference using timestamp.

**Returns**: `string` - Unique reference (e.g., "1704067200-12345")

---

#### `getPaystackPublicKey()`
Returns the Paystack public key for frontend.

**Returns**: `string` - Public key

---

## EmailService
**Location**: `src/modules/email/email.service.ts`  
**Purpose**: Send transactional emails via Mailjet

### Methods

#### `sendRegistrationConfirmation(email: string, cooperativeName: string, applicationId: string)`
Sends confirmation email after application submission.

**Parameters**:
- `email` - Recipient email
- `cooperativeName` - Cooperative name
- `applicationId` - Application ID (for linking)

**Returns**: `Promise<void>`

---

#### `sendPaymentSuccessful(email: string, cooperativeName: string, amount: number, transactionRef: string)`
Sends email confirming successful payment.

**Parameters**:
- `email` - Recipient email
- `cooperativeName` - Cooperative name
- `amount` - Amount paid (in naira)
- `transactionRef` - Transaction reference

**Returns**: `Promise<void>`

---

#### `sendPaymentFailed(email: string, cooperativeName: string, reason: string)`
Sends email notifying payment failure.

**Parameters**:
- `email` - Recipient email
- `cooperativeName` - Cooperative name
- `reason` - Reason for failure

**Returns**: `Promise<void>`

---

#### `sendAdminVerificationNotice(cooperativeName: string, amount: number, transactionRef: string)`
Sends email to admin for payment verification review.

**Parameters**:
- `cooperativeName` - Cooperative name
- `amount` - Amount paid
- `transactionRef` - Transaction reference

**Returns**: `Promise<void>`

---

#### `sendApplicationApproved(email: string, cooperativeName: string, certificateUrl: string, registrationNo: string)`
Sends approval email with certificate download link.

**Parameters**:
- `email` - Recipient email
- `cooperativeName` - Cooperative name
- `certificateUrl` - Certificate download URL
- `registrationNo` - Registration number

**Returns**: `Promise<void>`

---

#### `sendApplicationRejected(email: string, cooperativeName: string, reason: string)`
Sends rejection email with reason.

**Parameters**:
- `email` - Recipient email
- `cooperativeName` - Cooperative name
- `reason` - Rejection reason

**Returns**: `Promise<void>`

---

## CloudinaryService
**Location**: `src/modules/files/cloudinary.service.ts`  
**Purpose**: Manage certificate storage and URLs

### Methods

#### `getPresignedUploadUrl(folder: string)`
Gets presigned URL for client-side file upload.

**Parameters**:
- `folder` - Folder path (e.g., "certificates")

**Returns**:
```json
{
  "upload_url": "https://api.cloudinary.com/v1_1/.../image/upload",
  "api_key": "key",
  "folder": "certificates",
  "timestamp": 1704067200
}
```

---

#### `getCertificateUrl(publicId: string, format: string = 'pdf')`
Generates optimized certificate URL.

**Parameters**:
- `publicId` - File public ID in Cloudinary
- `format` - File format (default: pdf)

**Returns**: `string` - Public URL

**Example**:
```typescript
const url = this.cloudinaryService.getCertificateUrl(
  'certificates/app-123',
  'pdf'
);
// Returns: https://res.cloudinary.com/.../image/upload/certificates/app-123.pdf
```

---

#### `deleteFile(publicId: string)`
Removes file from Cloudinary.

**Parameters**:
- `publicId` - File public ID

**Returns**: `Promise<void>`

---

#### `getSignedDownloadUrl(publicId: string, expirationMinutes: number = 10080)`
Creates time-limited download URL.

**Parameters**:
- `publicId` - File public ID
- `expirationMinutes` - Expiration time (default: 7 days)

**Returns**: `string` - Signed download URL

**Example**:
```typescript
const downloadUrl = this.cloudinaryService.getSignedDownloadUrl(
  'certificates/app-123',
  10080 // 7 days
);
```

---

## CertificateGenerationService
**Location**: `src/modules/certificates/certificate-generation.service.ts`  
**Purpose**: Generate and manage certificates

### Methods

#### `generateCertificate(applicationId: string, certificatePdfUrl: string)`
Creates certificate record after payment approval.

**Parameters**:
- `applicationId` - Application UUID
- `certificatePdfUrl` - URL to certificate PDF

**Returns**:
```json
{
  "id": "certificate-id",
  "registrationNo": "REG-2024-000001",
  "certificateUrl": "https://...",
  "issuedAt": "2024-01-01T00:00:00Z"
}
```

---

#### `generateRegistrationNumber()`
Creates auto-incrementing registration number.

**Returns**: `string` - Format: "REG-YYYY-XXXXXX"

**Example**: "REG-2024-000042"

---

#### `revokeCertificate(certificateId: string, reason: string)`
Marks certificate as revoked.

**Parameters**:
- `certificateId` - Certificate ID
- `reason` - Revocation reason

**Returns**: `Promise<void>`

---

#### `verifyCertificate(registrationNo: string)`
Public method to verify certificate validity.

**Parameters**:
- `registrationNo` - Registration number

**Returns**:
```json
{
  "valid": true,
  "registrationNo": "REG-2024-000001",
  "cooperativeName": "Test Coop",
  "issuedAt": "2024-01-01T00:00:00Z",
  "revoked": false
}
```

---

## PaymentsService
**Location**: `src/modules/payments/payments.service.ts`  
**Purpose**: Full payment lifecycle management

### Methods

#### `initializePayment(dto: InitializePaymentDto)`
Initializes payment and returns Paystack checkout URL.

**Parameters**:
```json
{
  "applicationId": "app-uuid",
  "email": "user@example.com",
  "amount": 10000,
  "cooperativeName": "Coop Name"
}
```

**Returns**:
```json
{
  "paymentUrl": "https://checkout.paystack.com/...",
  "reference": "REF-1234567890",
  "accessCode": "access_code"
}
```

---

#### `verifyPayment(dto: VerifyPaymentDto)`
Verifies payment and updates database.

**Parameters**:
```json
{
  "reference": "REF-1234567890"
}
```

**Returns**:
```json
{
  "status": "COMPLETED",
  "reference": "REF-1234567890",
  "amount": 10000
}
```

---

#### `getPaymentByReference(reference: string)`
Retrieves payment details with application info.

**Parameters**:
- `reference` - Transaction reference

**Returns**:
```json
{
  "id": "payment-id",
  "amount": 10000,
  "status": "COMPLETED",
  "application": {
    "id": "app-id",
    "cooperativeName": "Coop Name"
  }
}
```

---

#### `findAll(skip?: number, take?: number, status?: string)`
Lists all payments with pagination and filtering.

**Parameters**:
- `skip` - Number of records to skip (default: 0)
- `take` - Number of records to return (default: 10)
- `status` - Filter by status (optional)

**Returns**:
```json
{
  "payments": [...],
  "total": 42,
  "skip": 0,
  "take": 10
}
```

---

#### `getStats()`
Gets payment statistics for dashboard.

**Returns**:
```json
{
  "totalAmount": 420000,
  "completedCount": 42,
  "failedCount": 3,
  "pendingCount": 2,
  "averageAmount": 10000
}
```

---

#### `getPaystackPublicKey()`
Returns Paystack public key.

**Returns**: `string` - Public key

---

#### `processPaystackWebhook(payload: object, signature: string)`
Processes webhook from Paystack.

**Parameters**:
- `payload` - Webhook payload
- `signature` - Signature for verification

**Returns**: `Promise<void>`

---

#### `handleWebhook(payload: object, signature: string)`
Wrapper method for controller endpoint.

**Returns**:
```json
{
  "status": "success|error",
  "reference": "reference",
  "message": "Message"
}
```

---

## AdminPaymentApprovalService
**Location**: `src/modules/payments/admin-payment-approval.service.ts`  
**Purpose**: Admin payment review and approval

### Methods

#### `getPendingPayments(skip?: number, take?: number)`
Lists payments awaiting admin review.

**Parameters**:
- `skip` - Number to skip (default: 0)
- `take` - Number to take (default: 10)

**Returns**:
```json
{
  "data": [...],
  "pagination": {
    "total": 5,
    "skip": 0,
    "take": 10,
    "hasMore": false
  }
}
```

---

#### `getPaymentDetails(paymentId: string)`
Gets full payment details.

**Parameters**:
- `paymentId` - Payment UUID

**Returns**:
```json
{
  "id": "payment-id",
  "amount": 10000,
  "status": "COMPLETED",
  "application": {
    "id": "app-id",
    "cooperativeName": "Coop Name",
    "email": "user@example.com"
  }
}
```

---

#### `approvePayment(paymentId: string, adminNotes?: string)`
Approves payment and generates certificate.

**Parameters**:
- `paymentId` - Payment UUID
- `adminNotes` - Optional admin notes

**Returns**:
```json
{
  "payment": { ... },
  "application": { ... },
  "certificate": {
    "registrationNo": "REG-2024-000001",
    "certificateUrl": "https://...",
    "issuedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### `rejectPayment(paymentId: string, rejectionReason: string)`
Rejects payment with reason.

**Parameters**:
- `paymentId` - Payment UUID
- `rejectionReason` - Required reason for rejection

**Returns**: Updated payment object

---

#### `getApprovalStats()`
Gets approval workflow statistics.

**Returns**:
```json
{
  "pending": 5,
  "completed": 42,
  "failed": 3,
  "total": 50
}
```

---

## Usage Examples

### Complete Payment Flow

```typescript
// 1. Initialize Payment
const paymentInit = await this.paymentsService.initializePayment({
  applicationId: 'app-123',
  email: 'user@example.com',
  amount: 10000,
  cooperativeName: 'Test Coop'
});
// Return paymentInit.paymentUrl to frontend

// 2. Receive Webhook
app.post('/webhook', (req, res) => {
  const result = await this.paymentsService.handleWebhook(
    req.body,
    req.headers['x-paystack-signature']
  );
  res.json(result);
});

// 3. Admin Reviews Payment
const pending = await this.adminService.getPendingPayments();

// 4. Admin Approves
const approved = await this.adminService.approvePayment('payment-id');
// This generates certificate and sends email

// 5. User Downloads Certificate
const url = await this.certificateService.getCertificateUrl('cert-id');
```

---

## DTOs

### InitializePaymentDto
```typescript
{
  applicationId: string;      // @IsUUID()
  email: string;              // @IsEmail()
  amount: number;             // @IsNumber() @Min(100)
  cooperativeName: string;    // @IsString() @MinLength(3)
}
```

### VerifyPaymentDto
```typescript
{
  reference: string;          // @IsString() @IsNotEmpty()
}
```

---

## Error Handling

All services throw descriptive errors:
- `NotFoundException` - Resource not found
- `BadRequestException` - Invalid request
- `UnauthorizedException` - Auth failed
- `InternalServerErrorException` - Server error

Example:
```typescript
try {
  await this.paymentsService.initializePayment(dto);
} catch (error) {
  if (error instanceof NotFoundException) {
    // Application not found
  } else if (error instanceof BadRequestException) {
    // Invalid amount or other validation
  }
}
```

---

## Logging

All services use Logger for debugging:
```typescript
this.logger.log('Payment initialized');
this.logger.warn('Invalid webhook signature');
this.logger.error('Payment processing failed', error);
```

Check logs: `docker logs bauchi-coop-backend`

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: Production Ready
