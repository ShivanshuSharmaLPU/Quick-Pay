# FlexPay - Local Testing Guide

## ✅ Services Status

### Backend Server
- **URL**: http://localhost:3001
- **Status**: ✅ Running
- **Database**: PostgreSQL (flexpay)
- **Environment**: Development

### Frontend Server
- **URL**: http://localhost:5173
- **Status**: ✅ Running
- **Framework**: React + Vite
- **Environment**: Development

---

## 🧪 Testing Steps

### 1. Create a New Account (Signup)
1. Open http://localhost:5173 in your browser
2. You'll be redirected to the Signin page
3. Click "Sign Up" link
4. Fill in the signup form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: password123 (minimum 8 characters)
   - Confirm Password: password123
   - Wallet PIN: 1234 (4 digits)
5. Click "Create Account"
6. You should be automatically logged in and redirected to the Dashboard

### 2. Explore the Dashboard
- View your current balance (starts at ₹0.00)
- See quick action buttons (Send, Request, History)
- Check recent transactions (empty initially)
- View pending requests
- Check notifications

### 3. Create Another Test User
1. Logout (if there's a logout button) or open in incognito/another browser
2. Create another account:
   - First Name: Jane
   - Last Name: Smith
   - Email: jane@example.com
   - Password: password123
   - Wallet PIN: 5678

### 4. Test Send Money Feature
**Note**: To test sending money, we need to add some balance first. Let me add a manual balance update.

For now, you can test the UI flow:
1. Login as John (john@example.com)
2. Click "Send" button on dashboard
3. Search for Jane by name or email (jane@example.com)
4. Select Jane from search results
5. Enter amount (e.g., 100)
6. Enter wallet PIN (1234)
7. Click "Send Money"

**Note**: The transaction will fail because John has ₹0 balance. We need to manually add balance for testing.

### 5. Test Request Money Feature
1. Login as John
2. Click "Request" button
3. Search for Jane
4. Select Jane
5. Enter amount (e.g., 50)
6. Add optional message: "Lunch money"
7. Click "Send Request"
8. You should see success animation with paper plane

### 6. Test Accept/Reject Requests
1. Logout and login as Jane
2. Go to Dashboard - you should see a pending request notification
3. Click "Manage Requests" or go to Requests page
4. You should see John's request for ₹50
5. Click "Accept" (requires PIN) or "Reject"

### 7. Test Transaction History
1. Click "History" from quick actions
2. Use filters to filter by:
   - Transaction Type (Send/Receive)
   - Status (Pending/Completed/Failed)
   - Date Range
   - Search by name

### 8. Test Notifications
1. Click the notification bell icon (if implemented in nav)
2. Or navigate to /notifications
3. View all notifications
4. Click "Mark as read" on individual notifications
5. Click "Mark all as read" to clear all

---

## 🔧 Adding Test Balance (Manual Database Update)

To properly test sending money, let's add some balance to John's account:

```bash
# Open PostgreSQL
psql -U raj_kumar -d flexpay

# Add balance to John's account
UPDATE "User" SET balance = 1000.00 WHERE email = 'john@example.com';

# Verify
SELECT "firstName", "lastName", email, balance FROM "User";

# Exit
\q
```

Now John will have ₹1000.00 to test transactions!

---

## 🎨 Features to Test

### ✅ Authentication
- [x] Signup with validation
- [x] Signin with credentials
- [x] Protected routes (try accessing /dashboard without login)
- [x] Logout functionality

### ✅ Dashboard
- [x] Balance display
- [x] Quick actions
- [x] Recent transactions
- [x] Pending requests badge
- [x] Notifications count

### ✅ Send Money
- [x] User search with debouncing (type and wait 500ms)
- [x] Search results dropdown
- [x] Amount validation (min: ₹1, max: ₹100,000)
- [x] PIN verification
- [x] Success animation
- [x] Toast notifications

### ✅ Request Money
- [x] User search
- [x] Amount input
- [x] Optional message field
- [x] Paper plane success animation
- [x] Request appears in recipient's requests

### ✅ Requests Management
- [x] Tabs (Received/Sent)
- [x] Status filters
- [x] Accept request (with PIN modal)
- [x] Reject request
- [x] Cancel sent request
- [x] Status badges with colors

### ✅ Transaction History
- [x] Summary cards (Total Sent/Received/Count)
- [x] Type filter (Send/Receive)
- [x] Status filter
- [x] Date range filter
- [x] Search by name
- [x] Empty states

### ✅ Notifications
- [x] Type-based icons
- [x] Unread count
- [x] Mark as read
- [x] Mark all as read
- [x] Slide-in animations

---

## 🐛 Common Issues & Solutions

### Issue: "Authentication failed" error
**Solution**: Database credentials were updated. The .env file now uses:
```
DATABASE_URL="postgresql://raj_kumar:rajkumar123@localhost:5432/flexpay?schema=public"
```

### Issue: "Insufficient balance" when sending money
**Solution**: Add test balance using the SQL command above.

### Issue: Cannot find user in search
**Solution**: Make sure you've created multiple test accounts.

### Issue: Toast notifications not appearing
**Solution**: Check browser console for errors. Toaster component is configured in App.tsx.

### Issue: Page not loading
**Solution**: Check that both backend (port 3001) and frontend (port 5173) are running.

---

## 📊 Database Tables

You can inspect the database:
```bash
psql -U raj_kumar -d flexpay

# List all tables
\dt

# View users
SELECT * FROM "User";

# View transactions
SELECT * FROM "Transaction";

# View requests
SELECT * FROM "MoneyRequest";

# View notifications
SELECT * FROM "Notification";
```

---

## 🎯 Test Scenarios

### Scenario 1: Complete Money Transfer Flow
1. Login as User A
2. Add balance (₹1000) via SQL
3. Search for User B
4. Send ₹100 with PIN
5. Verify transaction in history
6. Login as User B
7. Check balance increased by ₹100
8. View transaction in history

### Scenario 2: Money Request Flow
1. Login as User A
2. Request ₹50 from User B
3. Logout and login as User B
4. View pending request
5. Accept with PIN
6. Verify balance decreased
7. Login as User A
8. Verify balance increased
9. Check notifications

### Scenario 3: Request Rejection
1. Login as User A
2. Request ₹75 from User B
3. Login as User B
4. Reject the request
5. Login as User A
6. Check notification about rejection

---

## 🚀 Next Steps

After testing, you can:
1. Add more test data (multiple users)
2. Test edge cases (negative amounts, duplicate emails, etc.)
3. Test concurrent transactions
4. Check responsive design on mobile
5. Test animations and transitions
6. Verify all toast notifications appear correctly
7. Test error handling (wrong PIN, insufficient balance, etc.)

---

## 📝 Notes

- Backend API documentation: See `backend/API_DOCUMENTATION.md`
- All passwords are hashed with bcrypt
- PINs are also hashed for security
- JWT tokens expire in 24 hours
- Rate limiting is active (check API docs for limits)
- CORS is configured for localhost:5173

Enjoy testing! 🎉
