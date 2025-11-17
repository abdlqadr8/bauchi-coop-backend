# Paystack Payment Integration Setup Guide

## Overview
This guide provides step-by-step instructions for setting up the Paystack payment gateway, Mailjet email service, and Cloudinary file storage integration with the Bauchi Cooperative Backend.

## Prerequisites
- Backend environment variables configured (.env file)
- Active accounts with:
  - [Paystack](https://paystack.com)
  - [Mailjet](https://www.mailjet.com)
  - [Cloudinary](https://cloudinary.com)

---

## 1. Paystack Payment Gateway Setup

### 1.1 Get API Keys
1. Log in to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings → Developer**
3. Copy your API keys:
   - **Public Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

### 1.2 Configure Environment Variables
Add to `.env`:
```env
PAYSTACK_PUBLIC_KEY=pk_live_your_key_here
PAYSTACK_SECRET_KEY=sk_live_your_secret_here
```

### 1.3 API Endpoints

#### Initialize Payment
```bash
POST /api/v1/payments/initialize
Content-Type: application/json

{
  "applicationId": "application-uuid",
  "email": "cooperative@example.com",
  "amount": 10000,
  "cooperativeName": "Cooperative Name"
}
```

**Response:**
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "access_code_here",
  "reference": "payment-reference"
}
```

#### Verify Payment
```bash
POST /api/v1/payments/verify
Content-Type: application/json

{
  "reference": "payment-reference"
}
```

#### Webhook Endpoint
Paystack will send webhook notifications to:
```
POST {BASE_URL}/api/v1/payments/webhook
```

Set this URL in Paystack Dashboard: **Settings → Webhooks**

### 1.4 Payment Flow
1. User initiates payment after application submission
2. Frontend redirects to Paystack checkout using `authorization_url`
3. Paystack notifies backend via webhook
4. Backend verifies payment and updates application status
5. Email notifications sent to user and admin

---

## 2. Mailjet Email Configuration

### 2.1 Get API Credentials
1. Log in to [Mailjet Console](https://app.mailjet.com)
2. Navigate to **Account Settings → API Keys**
3. Copy:
   - **API Key** (Master API Key)
   - **API Secret** (Master API Secret)

### 2.2 Configure Environment Variables
Add to `.env`:
```env
MAILJET_API_KEY=your_api_key_here
MAILJET_API_SECRET=your_api_secret_here
SENDER_EMAIL=noreply@bauchicooperative.ng
SENDER_NAME=Bauchi Cooperative Registry
ADMIN_EMAIL=admin@bauchicooperative.ng
```

### 2.3 Email Templates
The system sends 6 types of transactional emails:

1. **Registration Confirmation** - Sent when application submitted
2. **Payment Successful** - Sent when payment completed
3. **Payment Failed** - Sent when payment fails
4. **Admin Verification Notice** - Sent to admin for payment review
5. **Application Approved** - Sent with certificate download link
6. **Application Rejected** - Sent with rejection reason

All templates are generated dynamically in the EmailService with proper HTML formatting.

### 2.4 Setting Up Sender Email
1. Add sender email in Mailjet Dashboard: **Senders & Domains**
2. Verify the domain if required
3. Use the verified email in `SENDER_EMAIL` variable

---

## 3. Cloudinary File Storage Setup

### 3.1 Get API Credentials
1. Log in to [Cloudinary Console](https://cloudinary.com/console)
2. Copy from **Dashboard**:
   - **Cloud Name** (displayed at top)
   - **API Key**
   - **API Secret**

### 3.2 Create Upload Preset
1. Navigate to **Settings → Upload**
2. Click **Add upload preset**
3. Configure:
   - **Name**: `bauchi_certificates`
   - **Folder**: `certificates/`
   - **Resource type**: Image
   - **Format**: PDF
4. Copy the preset name

### 3.3 Configure Environment Variables
Add to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=bauchi_certificates
```

### 3.4 Certificate Storage
Certificates are stored in Cloudinary after admin approval:
- **Folder**: `certificates/`
- **Format**: PDF
- **URL Pattern**: `https://res.cloudinary.com/{CLOUD_NAME}/image/upload/certificates/...`

---

## 4. Backend Services Overview

### 4.1 PaystackService
**Location**: `src/modules/payments/paystack.service.ts`

Methods:
- `initializePayment(email, amount, reference, metadata)` - Create payment checkout
- `verifyPayment(reference)` - Verify payment with Paystack
- `verifyWebhookSignature(signature, payload)` - Validate webhook authenticity
- `generateReference()` - Create unique transaction reference
- `getPaystackPublicKey()` - Get public key for frontend

### 4.2 EmailService
**Location**: `src/modules/email/email.service.ts`

Methods:
- `sendRegistrationConfirmation(email, cooperativeName, applicationId)`
- `sendPaymentSuccessful(email, cooperativeName, amount, transactionRef)`
- `sendPaymentFailed(email, cooperativeName, reason)`
- `sendAdminVerificationNotice(cooperativeName, amount, transactionRef)`
- `sendApplicationApproved(email, cooperativeName, certificateUrl, registrationNo)`
- `sendApplicationRejected(email, cooperativeName, reason)`

### 4.3 CloudinaryService
**Location**: `src/modules/files/cloudinary.service.ts`

Methods:
- `getPresignedUploadUrl(folder)` - Get upload endpoint for client
- `getCertificateUrl(publicId, format)` - Generate certificate URL
- `deleteFile(publicId)` - Remove file
- `getSignedDownloadUrl(publicId, expirationMinutes)` - Create time-limited download link

### 4.4 CertificateGenerationService
**Location**: `src/modules/certificates/certificate-generation.service.ts`

Methods:
- `generateCertificate(applicationId, certificatePdfUrl)` - Create certificate record
- `generateRegistrationNumber()` - Auto-increment registration number
- `revokeCertificate(certificateId, reason)` - Revoke certificate
- `verifyCertificate(registrationNo)` - Public verification endpoint

### 4.5 AdminPaymentApprovalService
**Location**: `src/modules/payments/admin-payment-approval.service.ts`

Methods:
- `getPendingPayments(skip, take)` - List payments awaiting admin review
- `getPaymentDetails(paymentId)` - Get single payment details
- `approvePayment(paymentId, adminNotes)` - Approve and generate certificate
- `rejectPayment(paymentId, rejectionReason)` - Reject with reason
- `getApprovalStats()` - Admin dashboard statistics

---

## 5. Payment Status Workflow

```
PENDING → (User pays) → COMPLETED → (Admin review) → APPROVED
                                  → FAILED
                                  → REFUNDED
```

### Status Descriptions:
- **PENDING**: Payment initialized, awaiting user completion
- **COMPLETED**: Payment successful, awaiting admin verification
- **APPROVED**: Admin approved, certificate issued
- **FAILED**: Payment failed or rejected by admin
- **REFUNDED**: Refund processed

---

## 6. Admin Dashboard Endpoints

### 6.1 List Pending Payments
```bash
GET /api/v1/admin/payments
Authorization: Bearer {JWT_TOKEN}
```

### 6.2 Get Payment Details
```bash
GET /api/v1/admin/payments/{paymentId}
Authorization: Bearer {JWT_TOKEN}
```

### 6.3 Approve Payment
```bash
POST /api/v1/admin/payments/{paymentId}/approve
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "adminNotes": "Payment verified and approved"
}
```

### 6.4 Reject Payment
```bash
POST /api/v1/admin/payments/{paymentId}/reject
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "rejectionReason": "Payment verification failed"
}
```

### 6.5 Approval Statistics
```bash
GET /api/v1/admin/payments/stats
Authorization: Bearer {JWT_TOKEN}
```

---

## 7. Frontend Integration

### 7.1 Payment Initialization
1. After user completes application, show payment prompt
2. Call backend initialize endpoint
3. Open Paystack checkout using `authorization_url`
4. User completes payment on Paystack
5. Paystack redirects back to application

### 7.2 Payment Success Confirmation
1. Backend receives webhook from Paystack
2. Verifies payment authenticity
3. Updates application status
4. Sends confirmation emails
5. Frontend polls for status update

### 7.3 Admin Approval Flow
1. Admin logs into dashboard
2. Views pending payments list
3. Reviews payment details
4. Approves or rejects
5. User receives email with certificate link (if approved)

---

## 8. Troubleshooting

### Issue: Webhook Not Being Received
**Solution:**
- Verify webhook URL in Paystack Dashboard
- Check firewall allows incoming requests from Paystack IPs
- Verify PAYSTACK_SECRET_KEY is correct
- Check backend logs for signature verification errors

### Issue: Emails Not Sending
**Solution:**
- Verify MAILJET_API_KEY and MAILJET_API_SECRET
- Confirm SENDER_EMAIL is verified in Mailjet Dashboard
- Check email templates in EmailService
- Verify mailjet credentials have send permission

### Issue: Certificate URL Not Working
**Solution:**
- Verify CLOUDINARY_CLOUD_NAME is correct
- Check file uploaded to correct folder
- Ensure upload preset is configured correctly
- Verify API secret has correct permissions

---

## 9. Security Considerations

1. **Never commit .env file** - Use .env.example as template
2. **Use environment variables** - All secrets loaded from .env
3. **Webhook signature verification** - All Paystack webhooks verified
4. **HTTPS only** - Always use HTTPS in production
5. **Role-based access** - Admin endpoints require ADMIN role
6. **Rate limiting** - Consider adding rate limits in production
7. **Audit logging** - All payment actions logged in ActivityLog

---

## 10. Testing Payment Flow

### Test Mode (Paystack)
Use test keys for development:
```
Public Key: pk_test_...
Secret Key: sk_test_...
```

Test card numbers available on [Paystack Documentation](https://paystack.com/docs)

### Local Testing Webhook
Use a service like [ngrok](https://ngrok.com) to expose local API:
```bash
ngrok http 3000
# Update webhook URL in Paystack Dashboard with ngrok URL
```

---

## 11. Production Checklist

- [ ] All environment variables set correctly
- [ ] Using live Paystack keys (pk_live_, sk_live_)
- [ ] Email sender domain verified in Mailjet
- [ ] Cloudinary production credentials configured
- [ ] Webhook URL points to production backend
- [ ] HTTPS enabled on all endpoints
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Rate limiting enabled
- [ ] CORS properly configured for frontend URL

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review service logs: `docker logs bauchi-coop-backend`
3. Check external service dashboards (Paystack, Mailjet, Cloudinary)
4. Contact development team with error logs and steps to reproduce
