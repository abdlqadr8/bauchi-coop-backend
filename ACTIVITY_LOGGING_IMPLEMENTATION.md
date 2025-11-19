# Activity Logging Implementation

## Overview
This document describes the comprehensive activity logging system implemented in the Bauchi Cooperative Backend application.

## Features Implemented

### 1. ActivityLog Database Model
The `ActivityLog` model captures:
- `userId` - The user who performed the action
- `applicationId` - Related application (if applicable)
- `action` - Action type (e.g., LOGIN, CREATE_USER, UPDATE_APPLICATION_STATUS)
- `description` - Human-readable description
- `metadata` - JSON metadata for additional context
- `ipAddress` - User's IP address
- `createdAt` - Timestamp

### 2. Activity Logs Service
**Location**: `/src/modules/activity-logs/activity-logs.service.ts`

Key methods:
- `logActivity()` - Create activity log entries
- `getActivityLogs()` - Retrieve filtered activity logs
- `getUserRecentActivity()` - Get recent activity for a specific user
- `getActivityStats()` - Get statistics about activities

### 3. Activity Logs Controller
**Location**: `/src/modules/activity-logs/activity-logs.controller.ts`

**Endpoints**:
- `GET /api/v1/admin/activity-logs` - List activity logs with filters
- `GET /api/v1/admin/activity-logs/stats` - Get activity statistics

**Access**: SYSTEM_ADMIN and ADMIN roles only

### 4. Tracked Activities

#### Authentication Activities
- **LOGIN** - User login with IP address tracking
- **LOGOUT** - User logout

#### User Management Activities
- **CREATE_USER** - New user creation
- **UPDATE_USER** - User information update
- **UPDATE_USER_STATUS** - User status change (activate/deactivate)
- **DELETE_USER** - User deletion

#### Application Management Activities
- **SUBMIT_APPLICATION** - New application submission
- **UPDATE_APPLICATION_STATUS** - Application status change (NEW → UNDER_REVIEW → APPROVED/REJECTED/FLAGGED)

#### Certificate Management Activities
- **GENERATE_CERTIFICATE** - Certificate generation
- **REVOKE_CERTIFICATE** - Certificate revocation

## API Endpoints

### Get Activity Logs
```http
GET /api/v1/admin/activity-logs
Authorization: Bearer <access_token>

Query Parameters:
- skip: number (pagination offset)
- take: number (number of records)
- userId: string (filter by user)
- applicationId: string (filter by application)
- action: string (filter by action type)
- startDate: ISO date string
- endDate: ISO date string

Response:
{
  "logs": [
    {
      "id": "string",
      "userId": "string",
      "userName": "John Doe",
      "userRole": "ADMIN",
      "applicationId": "string",
      "cooperativeName": "string",
      "action": "LOGIN",
      "description": "User john@example.com logged in",
      "ipAddress": "192.168.1.1",
      "createdAt": "2025-11-18T10:30:00Z"
    }
  ],
  "total": 100
}
```

### Get Activity Statistics
```http
GET /api/v1/admin/activity-logs/stats
Authorization: Bearer <access_token>

Query Parameters:
- startDate: ISO date string
- endDate: ISO date string

Response:
{
  "totalActivities": 500,
  "byAction": [
    { "action": "LOGIN", "count": 150 },
    { "action": "UPDATE_APPLICATION_STATUS", "count": 75 }
  ],
  "byUser": [
    { "userId": "xxx", "userName": "John Doe", "count": 50 }
  ]
}
```

## Usage Examples

### Logging an Activity
```typescript
await this.activityLogsService.logActivity({
  userId: req.user?.userId,
  applicationId: 'app-id',
  action: 'UPDATE_APPLICATION_STATUS',
  description: 'Changed application status to APPROVED',
  metadata: {
    previousStatus: 'UNDER_REVIEW',
    newStatus: 'APPROVED'
  },
  ipAddress: '192.168.1.1'
});
```

### Retrieving Activity Logs
```typescript
const result = await this.activityLogsService.getActivityLogs({
  skip: 0,
  take: 20,
  userId: 'user-id',
  startDate: new Date('2025-11-01'),
  endDate: new Date('2025-11-30')
});
```

## Integration Points

### Modules with Activity Logging
1. **Auth Module** - Login/logout tracking
2. **Users Module** - User management operations
3. **Applications Module** - Application lifecycle tracking
4. **Certificates Module** - Certificate operations

### IP Address Tracking
The `@IpAddress()` decorator extracts IP addresses from requests, checking:
- `x-forwarded-for` header (for proxied requests)
- `x-real-ip` header
- Direct connection IP

## Frontend Integration

The frontend `ActivityLogTable` component displays:
- User name and role
- Action performed
- Timestamp
- IP address

The data is currently mocked but ready to connect to the backend endpoints.

## Security Considerations

1. **Role-Based Access**: Only SYSTEM_ADMIN and ADMIN can view activity logs
2. **Immutable Records**: Activity logs cannot be modified or deleted
3. **IP Tracking**: Captures IP for security auditing
4. **Sensitive Data**: Passwords and tokens are never logged
5. **Error Handling**: Activity logging failures don't break main operations

## Future Enhancements

1. **Activity Log Retention Policy** - Auto-archive old logs
2. **Advanced Filtering** - Full-text search in descriptions
3. **Export Functionality** - CSV/PDF export of activity logs
4. **Real-time Notifications** - Alert admins of suspicious activities
5. **Dashboard Widgets** - Activity heatmaps and charts
6. **Audit Compliance Reports** - Generate compliance reports

## Database Indexes

The ActivityLog table has indexes on:
- `userId` - Fast user activity queries
- `applicationId` - Fast application activity queries
- `action` - Fast action-type filtering
- `createdAt` - Efficient time-based queries

## Testing

To test the activity logging:

1. **Login**: Check for LOGIN activity
2. **Create User**: Verify CREATE_USER activity
3. **Update Application**: Check UPDATE_APPLICATION_STATUS activity
4. **Generate Certificate**: Verify GENERATE_CERTIFICATE activity
5. **Query Logs**: Use GET /api/v1/admin/activity-logs endpoint

## Troubleshooting

If activity logs are not being created:
1. Check that ActivityLogsModule is imported in the feature module
2. Verify ActivityLogsService is injected in the service constructor
3. Check application logs for activity logging errors
4. Ensure database migrations are up to date
