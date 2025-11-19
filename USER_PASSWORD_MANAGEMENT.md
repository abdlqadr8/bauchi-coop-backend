# User Creation with Mandatory Password Change Implementation

## Overview
This document describes the secure user creation flow with automatic password generation and mandatory password change on first login.

## Features Implemented

### 1. Database Schema Update
Added `mustChangePassword` field to the User model:
```prisma
model User {
  // ... other fields
  mustChangePassword    Boolean   @default(false)
  // ... other fields
}
```

### 2. Automatic Password Generation
When creating a new user, if no password is provided:
- A secure temporary password is automatically generated
- Password includes: uppercase, lowercase, numbers, and symbols
- Minimum length: 12 characters
- Password is securely hashed before storage
- `mustChangePassword` flag is set to `true`

### 3. Welcome Email
New users receive a welcome email containing:
- Their login credentials (email and temporary password)
- Their assigned role
- Login link to the admin portal
- Security notice about mandatory password change
- Professional HTML template with branding

### 4. Login Flow with Password Check
**Login Response now includes:**
```json
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "mustChangePassword": true
}
```

**JWT Payload includes:**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "ADMIN",
  "firstName": "John",
  "lastName": "Doe",
  "userId": "user_id",
  "mustChangePassword": true
}
```

### 5. Change Password Endpoint
**Endpoint:** `POST /api/v1/auth/change-password`

**Request:**
```json
{
  "currentPassword": "temporary_password",
  "newPassword": "new_secure_password"
}
```

**Features:**
- Validates current password
- Enforces minimum 8 character length for new password
- Hashes new password securely
- Clears `mustChangePassword` flag
- Revokes all existing refresh tokens (forces re-login)
- Logs activity for audit trail

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

## User Flow

### Admin Creating New User
1. Admin goes to Users page
2. Clicks "Add User"
3. Fills in: email, firstName, lastName, role
4. **No need to provide password** - it's auto-generated
5. Submits form
6. System:
   - Generates secure temporary password
   - Creates user with `mustChangePassword = true`
   - Sends welcome email to new user
   - Returns success message to admin

### New User First Login
1. User receives welcome email
2. Copies temporary password from email
3. Goes to login page
4. Enters email and temporary password
5. System responds with `mustChangePassword: true`
6. Frontend redirects to "Change Password" page
7. User enters:
   - Current password (temporary)
   - New password (2x for confirmation)
8. Submits password change
9. System:
   - Validates current password
   - Updates to new password
   - Clears `mustChangePassword` flag
   - Revokes all tokens
10. User is redirected to login page
11. User logs in with new password
12. Normal app access granted

## Frontend Implementation Requirements

### 1. Login Page Updates
After successful login, check `mustChangePassword` in response:
```typescript
const response = await api.post('/auth/login', credentials);
if (response.data.mustChangePassword) {
  // Redirect to change password page
  navigate('/change-password', { 
    state: { accessToken: response.data.accessToken } 
  });
} else {
  // Normal login flow
  navigate('/dashboard');
}
```

### 2. Change Password Page (New)
Create a new page at `/change-password`:
- Form fields: currentPassword, newPassword, confirmNewPassword
- Validation: newPassword must match confirmNewPassword
- On submit: Call `POST /api/v1/auth/change-password`
- On success: Show success message and redirect to login
- Display helpful message: "You must change your password before accessing the system"

### 3. Add User Modal Updates
Make password field optional or remove it entirely:
```typescript
interface CreateUserForm {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  // password is now optional/removed
}
```

Show success message mentioning email was sent:
```
"User created successfully! A welcome email with login credentials has been sent to {email}"
```

### 4. Protected Routes
Add check for `mustChangePassword` in protected routes:
```typescript
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" />;
  }
  
  return children;
};
```

## Security Features

### Password Generation
- ✅ 12+ character length
- ✅ Mix of uppercase, lowercase, numbers, symbols
- ✅ Cryptographically secure randomization
- ✅ Never logged or stored in plain text

### Email Security
- ⚠️ Temporary password sent via email (acceptable for initial setup)
- ✅ User forced to change immediately
- ✅ Clear security warning in email

### Password Change Security
- ✅ Requires current password verification
- ✅ Minimum 8 character requirement for new password
- ✅ All refresh tokens revoked after change
- ✅ Forces re-authentication
- ✅ Activity logged for audit

## API Endpoints

### Create User
```http
POST /api/v1/admin/users
Authorization: Bearer <admin_token>

{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STAFF"
  // password is optional - auto-generated if omitted
}
```

### Login
```http
POST /api/v1/auth/login

{
  "email": "john@example.com",
  "password": "temporary_or_new_password"
}

Response:
{
  "accessToken": "...",
  "refreshToken": "...",
  "mustChangePassword": true/false
}
```

### Change Password
```http
POST /api/v1/auth/change-password
Authorization: Bearer <access_token>

{
  "currentPassword": "current_password",
  "newPassword": "new_secure_password"
}

Response:
{
  "message": "Password changed successfully"
}
```

## Email Template

The welcome email includes:
- Greeting with user's name
- Login credentials box (email + temporary password)
- User's role
- Security warning banner
- Login button/link
- Support contact information
- Professional branding

## Activity Logging

The following activities are logged:
- `CREATE_USER` - When new user is created
- `CHANGE_PASSWORD` - When user changes password
- `LOGIN` - Every login attempt (includes mustChangePassword status)

## Testing Checklist

- [ ] Create user without password - verify email sent
- [ ] Verify welcome email contains temporary password
- [ ] Login with temporary password
- [ ] Verify `mustChangePassword: true` in response
- [ ] Change password with correct current password
- [ ] Verify password change fails with wrong current password
- [ ] Verify new password minimum length validation
- [ ] Verify all tokens revoked after password change
- [ ] Login with new password
- [ ] Verify `mustChangePassword: false` after change
- [ ] Verify activity logs created

## Environment Variables

Ensure these are set for email functionality:
```env
MAILJET_API_KEY=your_key
MAILJET_API_SECRET=your_secret
SENDER_EMAIL=noreply@bauchicooperative.ng
SENDER_NAME=Bauchi Cooperative Registry
FRONTEND_URL=http://localhost:5173
```

## Database Migration

Migration created: `20251118070703_add_must_change_password_to_user`

Adds column: `mustChangePassword BOOLEAN DEFAULT FALSE`

## Future Enhancements

1. **Password Complexity Rules**
   - Enforce uppercase, lowercase, number, symbol requirements
   - Check against common password dictionaries
   - Prevent reuse of last N passwords

2. **Password Reset Flow**
   - Forgot password functionality
   - Password reset via email link
   - Time-limited reset tokens

3. **Account Lockout**
   - Lock account after X failed login attempts
   - Admin unlock functionality
   - Automatic unlock after time period

4. **Password Expiry**
   - Force password change every N days
   - Email reminders before expiry
   - Grace period after expiry

5. **Two-Factor Authentication**
   - Optional 2FA for enhanced security
   - SMS or authenticator app support
   - Backup codes

## Troubleshooting

**Email not received:**
- Check MAILJET credentials in .env
- Verify email service is not in sandbox mode
- Check spam folder
- Review application logs for email errors

**Password change fails:**
- Verify current password is correct
- Check new password meets minimum requirements
- Ensure user is authenticated (valid JWT)

**Still seeing mustChangePassword after change:**
- Clear browser cache/localStorage
- Verify database field updated
- Check JWT token is refreshed after login
