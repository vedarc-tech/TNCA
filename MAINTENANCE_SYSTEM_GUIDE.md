# 🔧 TNCA Maintenance Management System Guide

## Overview

The TNCA Maintenance Management System provides comprehensive control over application maintenance modes, allowing developers to manage maintenance for individual routes, route groups, or the entire application.

## 🚀 Features

### ✅ **Individual Route Maintenance**
- Set maintenance mode for specific pages/routes
- Custom maintenance messages
- Scheduled maintenance with start/end times
- Real-time status checking

### ✅ **Group Maintenance**
- Bulk maintenance for route groups (admin, user, developer, public)
- Manage entire sections at once
- Group-specific maintenance messages

### ✅ **Global Maintenance**
- Application-wide maintenance mode
- Emergency maintenance capabilities
- Complete system shutdown

### ✅ **Real-time Monitoring**
- Live maintenance status dashboard
- Active maintenance count
- Scheduled maintenance tracking

## 🔗 API Endpoints

### Public Endpoints (No Authentication Required)

#### Check Route Maintenance Status
```http
GET /api/maintenance/check/{route_path}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "route_path": "/dashboard",
    "is_maintenance": true,
    "maintenance_info": {
      "is_maintenance": true,
      "message": "Dashboard is under maintenance",
      "start_time": "2024-01-15T10:00:00",
      "end_time": "2024-01-15T12:00:00"
    }
  }
}
```

#### Check Specific Route Status
```http
GET /api/maintenance/route/{route_path}/status
```

### Protected Endpoints (Developer Authentication Required)

#### Get All Routes
```http
GET /api/maintenance/routes
```

#### Get Maintenance Status
```http
GET /api/maintenance/status
```

#### Get Route Groups
```http
GET /api/maintenance/groups
```

#### Set Individual Route Maintenance
```http
POST /api/maintenance/route
```
**Body:**
```json
{
  "route_path": "/dashboard",
  "page_name": "User Dashboard",
  "is_maintenance": true,
  "message": "Dashboard is under maintenance",
  "start_time": "2024-01-15T10:00:00",
  "end_time": "2024-01-15T12:00:00"
}
```

#### Set Group Maintenance
```http
POST /api/maintenance/group
```
**Body:**
```json
{
  "group_name": "user_dashboard",
  "is_maintenance": true,
  "message": "User dashboard is under maintenance",
  "start_time": "2024-01-15T10:00:00",
  "end_time": "2024-01-15T12:00:00"
}
```

#### Set Global Maintenance
```http
POST /api/maintenance/global
```
**Body:**
```json
{
  "is_maintenance": true,
  "message": "The application is under maintenance",
  "start_time": "2024-01-15T10:00:00",
  "end_time": "2024-01-15T12:00:00"
}
```

#### Delete Maintenance Configuration
```http
DELETE /api/maintenance/route/{maintenance_id}
```

## 🎯 Route Groups

### Available Groups

1. **public_pages** - Public accessible pages
   - `/`, `/home`, `/about`, `/contact`, `/privacy`, `/login`, `/register`

2. **user_dashboard** - User-specific pages
   - `/user`, `/user/dashboard`, `/user/games`, `/user/matches`, etc.

3. **admin_dashboard** - Admin management pages
   - `/admin`, `/admin/dashboard`, `/admin/users`, `/admin/games`, etc.

4. **developer_dashboard** - Developer tools
   - `/developer`, `/developer/dashboard`, `/developer/system-control`, etc.

## 🖥️ Frontend Integration

### Maintenance Hook
```javascript
import useMaintenance from '../hooks/useMaintenance';

const MyComponent = () => {
  const { maintenanceInfo, isInMaintenance, loading, retry } = useMaintenance('/dashboard');
  
  if (isInMaintenance) {
    return <MaintenancePage maintenanceInfo={maintenanceInfo} onRetry={retry} />;
  }
  
  return <div>Normal content</div>;
};
```

### Maintenance Wrapper
```javascript
import MaintenanceWrapper from '../components/common/MaintenanceWrapper';

<MaintenanceWrapper routePath="/dashboard">
  <Dashboard />
</MaintenanceWrapper>
```

## 🔧 Usage Examples

### 1. Enable Maintenance for User Dashboard
```javascript
const response = await fetch('/api/maintenance/group', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    group_name: 'user_dashboard',
    is_maintenance: true,
    message: 'User dashboard is being updated',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
  })
});
```

### 2. Emergency Global Maintenance
```javascript
const response = await fetch('/api/maintenance/global', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    is_maintenance: true,
    message: 'Emergency maintenance - please check back later'
  })
});
```

### 3. Check if Route is in Maintenance
```javascript
const response = await fetch('/api/maintenance/check/dashboard');
const data = await response.json();

if (data.data.is_maintenance) {
  console.log('Route is in maintenance:', data.data.maintenance_info.message);
}
```

## 🛡️ Security Features

- **Authentication Required**: All maintenance management endpoints require developer authentication
- **Route Protection**: Developer routes are exempt from maintenance checks
- **Login/Register Protection**: Authentication pages are always accessible
- **Role-based Access**: Only developers can manage maintenance

## 📊 Monitoring

### Dashboard Statistics
- Total routes count
- Active maintenance count
- Scheduled maintenance count
- Maintenance history

### Real-time Updates
- Live status updates
- Automatic refresh
- Error handling and retry mechanisms

## 🚨 Emergency Procedures

### Quick Global Maintenance
1. Navigate to Developer Dashboard → Maintenance Management
2. Click "Global Maintenance" button
3. Set maintenance message and duration
4. Click "Enable Maintenance"

### Disable All Maintenance
1. Navigate to Developer Dashboard → Maintenance Management
2. Click "Global Maintenance" button
3. Set `is_maintenance: false`
4. Click "Disable Maintenance"

## 🔍 Troubleshooting

### Common Issues

1. **Maintenance not working**
   - Check if server is running
   - Verify database connection
   - Check authentication token

2. **Routes not showing in maintenance**
   - Ensure route is defined in the routes list
   - Check route path format (should start with `/`)

3. **Authentication errors**
   - Verify developer credentials
   - Check token expiration
   - Ensure proper authorization headers

### Testing

Run the maintenance system tests:
```bash
cd backend
python test_maintenance.py
python test_maintenance_full.py
```

## 📝 Best Practices

1. **Always set end times** for scheduled maintenance
2. **Use descriptive messages** to inform users
3. **Test maintenance mode** before applying to production
4. **Monitor maintenance status** regularly
5. **Have a rollback plan** for emergency situations

## 🔄 Maintenance Workflow

1. **Plan**: Determine scope (individual, group, or global)
2. **Schedule**: Set appropriate start/end times
3. **Notify**: Create informative maintenance messages
4. **Execute**: Enable maintenance mode
5. **Monitor**: Watch maintenance status
6. **Complete**: Disable maintenance when done

---

**Note**: This maintenance system is designed to be developer-friendly while ensuring system stability and user experience during maintenance windows. 