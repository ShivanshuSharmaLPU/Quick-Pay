# FlexPay API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📌 Authentication Endpoints

### 1. Sign Up
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "walletPin": "1234"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "upiId": "john@flexpay",
      "balance": "5000.00"
    },
    "token": "eyJhbGc..."
  }
}
```

### 2. Sign In
**POST** `/auth/signin`

Login to existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

### 3. Get Profile
**GET** `/auth/profile` 🔒

Get current user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "upiId": "john@flexpay",
      "balance": "5000.00"
    }
  }
}
```

---

## 👤 User Endpoints

### 1. Search Users
**GET** `/user/search?q=john` 🔒

Search users by name, email, or UPI ID.

**Query Parameters:**
- `q` (string, required, min 2 chars)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 2,
        "firstName": "John",
        "lastName": "Smith",
        "email": "johnsmith@example.com",
        "upiId": "johnsmith@flexpay"
      }
    ]
  }
}
```

### 2. Check User Exists
**GET** `/user/check?userEmail=john@example.com` 🔒

Check if a user exists by email or UPI ID.

**Query Parameters:**
- `userEmail` (string, required)

**Response (200):**
```json
{
  "success": true,
  "message": "User exists",
  "data": {
    "user": { ... }
  }
}
```

### 3. Get User Balance
**GET** `/user/balance` 🔒

Get current user's balance.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": "5000.00"
  }
}
```

---

## 💸 Transaction Endpoints

### 1. Send Money
**POST** `/transactions/send` 🔒

Send money to another user.

**Request Body:**
```json
{
  "receiverEmail": "jane@example.com",
  "amount": 500,
  "walletPin": "1234",
  "description": "Payment for lunch"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Money sent successfully",
  "data": {
    "transaction": {
      "id": 1,
      "senderId": 1,
      "receiverId": 2,
      "amount": "500.00",
      "type": "SEND",
      "status": "COMPLETED",
      "description": "Payment for lunch",
      "createdAt": "2025-11-15T10:30:00Z",
      "sender": { ... },
      "receiver": { ... }
    }
  }
}
```

### 2. Get All Transactions
**GET** `/transactions` 🔒

Get all transactions with filters.

**Query Parameters:**
- `type` (optional): ALL, SEND, RECEIVE
- `status` (optional): ALL, PENDING, COMPLETED, FAILED, CANCELLED
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### 3. Get Transaction by ID
**GET** `/transactions/:id` 🔒

Get specific transaction details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transaction": { ... }
  }
}
```

### 4. Get Transaction Summary
**GET** `/transactions/summary` 🔒

Get user's transaction summary.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSent": "2500.00",
    "totalReceived": "3000.00",
    "transactionCount": 45
  }
}
```

---

## 🙏 Money Request Endpoints

### 1. Create Request
**POST** `/requests` 🔒

Create a money request.

**Request Body:**
```json
{
  "requestedFromEmail": "john@example.com",
  "amount": 500,
  "message": "Lunch payment please"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Money request created successfully",
  "data": {
    "request": {
      "id": 1,
      "requesterId": 2,
      "requestedFromId": 1,
      "amount": "500.00",
      "message": "Lunch payment please",
      "status": "PENDING",
      "createdAt": "2025-11-15T10:30:00Z",
      "expiresAt": "2025-11-22T10:30:00Z",
      "requester": { ... },
      "requestedFrom": { ... }
    }
  }
}
```

### 2. Get Received Requests
**GET** `/requests/received` 🔒

Get requests from others to you.

**Query Parameters:**
- `status` (optional): ALL, PENDING, ACCEPTED, REJECTED, CANCELLED, EXPIRED
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "requests": [ ... ],
    "pagination": { ... }
  }
}
```

### 3. Get Sent Requests
**GET** `/requests/sent` 🔒

Get your requests to others.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "requests": [ ... ],
    "pagination": { ... }
  }
}
```

### 4. Get Request by ID
**GET** `/requests/:id` 🔒

Get specific request details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "request": { ... }
  }
}
```

### 5. Accept Request
**POST** `/requests/:id/accept` 🔒

Accept a money request and transfer money.

**Request Body:**
```json
{
  "walletPin": "1234"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Request accepted and payment completed",
  "data": {
    "transaction": { ... },
    "request": { ... }
  }
}
```

### 6. Reject Request
**POST** `/requests/:id/reject` 🔒

Reject a money request.

**Response (200):**
```json
{
  "success": true,
  "message": "Request rejected",
  "data": {
    "request": { ... }
  }
}
```

### 7. Cancel Request
**POST** `/requests/:id/cancel` 🔒

Cancel your own request (by requester).

**Response (200):**
```json
{
  "success": true,
  "message": "Request cancelled",
  "data": {
    "request": { ... }
  }
}
```

---

## 🔔 Notification Endpoints

### 1. Get All Notifications
**GET** `/notifications` 🔒

Get all user notifications.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "TRANSACTION_RECEIVED",
        "title": "Money Received",
        "message": "You received ₹500 from John Doe",
        "isRead": false,
        "relatedId": 10,
        "createdAt": "2025-11-15T10:30:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": { ... }
  }
}
```

### 2. Get Unread Count
**GET** `/notifications/unread/count` 🔒

Get count of unread notifications.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

### 3. Mark as Read
**PUT** `/notifications/:id/read` 🔒

Mark a specific notification as read.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notification": { ... }
  }
}
```

### 4. Mark All as Read
**PUT** `/notifications/read-all` 🔒

Mark all notifications as read.

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 🏥 Health Check

### Health Check
**GET** `/health`

Check if API is running.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T10:30:00Z"
}
```

---

## ⚠️ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## 🔐 Rate Limits

- **General API**: 100 requests per 15 minutes
- **Auth Endpoints** (signup/signin): 5 attempts per 15 minutes
- **Transactions/Requests**: 20 per hour

---

## 📝 Notes

1. All amounts are in decimal format (e.g., "500.00")
2. All dates are in ISO 8601 format
3. Passwords are hashed using bcrypt
4. Wallet PINs are hashed using bcrypt
5. JWT tokens expire after 24 hours (configurable)
6. Money requests expire after 7 days (configurable)
7. UPI ID format: `{email_username}@flexpay`
