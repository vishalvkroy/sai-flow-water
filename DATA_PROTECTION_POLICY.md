# 🔒 Data Protection Policy

## ⚠️ CRITICAL: What Data is NEVER Deleted

### **PROTECTED DATA (Never Auto-Deleted)**:

#### 1. **User Accounts** ✅ PROTECTED
- ❌ **NEVER** auto-deleted
- ❌ **NEVER** archived
- ✅ User credentials safe forever
- ✅ Login information preserved
- ✅ User profiles maintained

**Why**: Users need to login and access their account anytime

---

#### 2. **Products** ✅ PROTECTED
- ❌ **NEVER** auto-deleted
- ❌ **NEVER** archived
- ✅ Product catalog always available
- ✅ Product details preserved
- ✅ Images stored on Cloudinary (permanent)

**Why**: Products are core business data

---

#### 3. **Active Orders** ✅ PROTECTED
- ❌ **NEVER** auto-deleted
- ✅ Orders in any active status preserved:
  - Pending
  - Confirmed
  - Processing
  - Shipped
  - Out for Delivery
  - Delivered (recent)

**Why**: Customers need order history and tracking

---

#### 4. **Payment Records** ✅ PROTECTED
- ❌ **NEVER** auto-deleted
- ✅ Payment transactions preserved
- ✅ Razorpay records maintained
- ✅ Financial data kept for compliance

**Why**: Legal requirement, tax records, audits

---

#### 5. **Cancelled Orders** ✅ PROTECTED (Changed!)
- ❌ **NOT** auto-deleted anymore
- ✅ Kept for refunds/disputes
- ✅ Manual cleanup only
- ✅ Business decision when to delete

**Why**: May need for refunds, disputes, customer service

---

#### 6. **Service Bookings** ✅ PROTECTED
- ❌ **NEVER** auto-deleted
- ✅ All booking history preserved
- ✅ Customer service records maintained

**Why**: Service history important for customers

---

#### 7. **Seller Data** ✅ PROTECTED
- ❌ **NEVER** auto-deleted
- ✅ Seller accounts preserved
- ✅ Seller credentials safe
- ✅ Business information maintained

**Why**: Business partners need permanent access

---

## ✅ What Data CAN Be Auto-Deleted (Safe)

### **1. Notifications** ✅ SAFE TO DELETE
- ✅ Auto-deleted after **30 days**
- ✅ Only temporary alerts
- ✅ Not critical business data
- ✅ Users already saw them

**Examples**:
- "New order received"
- "Order shipped"
- "Payment successful"

**Why Safe**: Notifications are just alerts, not records

---

### **2. Old Delivered Orders** ✅ SAFE TO ARCHIVE
- ✅ Archived after **6 months** (not deleted!)
- ✅ Moved to `orders_archive` collection
- ✅ Still accessible if needed
- ✅ Can be restored anytime

**Why Safe**: Old orders rarely accessed, but still preserved

---

### **3. Temporary Session Data** ✅ SAFE TO DELETE
- ✅ Shopping cart sessions (expired)
- ✅ Temporary tokens
- ✅ Password reset tokens (expired)

**Why Safe**: Temporary by nature

---

## 🛡️ Data Retention Policy

### **Permanent Storage** (Never Deleted):
```
Users
├── Credentials ✅ Forever
├── Profile ✅ Forever
└── Preferences ✅ Forever

Products
├── Details ✅ Forever
├── Images ✅ Forever (Cloudinary)
└── Pricing ✅ Forever

Orders (Active)
├── Pending ✅ Forever
├── Processing ✅ Forever
├── Shipped ✅ Forever
├── Delivered (< 6 months) ✅ Forever
└── Cancelled ✅ Forever (Changed!)

Payments
├── Transactions ✅ Forever
├── Receipts ✅ Forever
└── Refunds ✅ Forever
```

### **Temporary Storage** (Auto-Deleted):
```
Notifications
└── Older than 30 days ❌ Auto-deleted

Session Data
└── Expired sessions ❌ Auto-deleted
```

### **Archived Storage** (Moved, Not Deleted):
```
Orders (Old)
└── Delivered > 6 months 📦 Archived (still accessible)
```

---

## 🔧 TTL Index Configuration

### **Current Configuration**:

#### ✅ Enabled:
```javascript
// Notifications - Auto-delete after 30 days
{
  collection: 'notifications',
  field: 'createdAt',
  expireAfterSeconds: 2592000 // 30 days
}
```

#### ❌ Disabled:
```javascript
// Cancelled Orders - MANUAL cleanup only
// NOT auto-deleted anymore
// Reason: May need for refunds/disputes
```

---

## 📋 Manual Cleanup Options

### **When You Want to Clean Up**:

#### 1. **Old Cancelled Orders** (Manual Only):
```bash
# Review first
node scripts/listOldCancelledOrders.js

# Delete only if sure (> 1 year old)
node scripts/cleanupOldCancelledOrders.js
```

#### 2. **Archive Old Delivered Orders**:
```bash
# Archive orders > 6 months old
# (Moves to archive, doesn't delete)
node scripts/archiveOldOrders.js
```

#### 3. **Clean Test Data**:
```bash
# Only for development/testing
node scripts/cleanupAllOrders.js
```

---

## 🚨 What Happens If You Need Old Data?

### **Archived Orders**:
```javascript
// Query archived orders
const OrderArchive = mongoose.model('OrderArchive', {}, 'orders_archive');
const order = await OrderArchive.findOne({ orderNumber: 'ARROH-XXX' });

// Restore if needed
await Order.create(order);
```

### **Deleted Notifications**:
- ❌ Cannot be recovered
- ✅ But not important (just alerts)
- ✅ Order history still intact

---

## 📊 Data Lifecycle

```
User Creates Account
    ↓
✅ User Data: PERMANENT
    ↓
User Places Order
    ↓
✅ Order Data: PERMANENT
    ↓
Order Delivered
    ↓
✅ Keep for 6 months: ACTIVE
    ↓
After 6 months
    ↓
📦 Archive: MOVED (not deleted)
    ↓
✅ Still accessible in archive
```

```
System Sends Notification
    ↓
✅ User sees notification
    ↓
After 30 days
    ↓
❌ Auto-deleted (safe, just alert)
```

---

## 🔐 Compliance & Legal

### **Tax Records**:
- ✅ All orders preserved (7 years minimum)
- ✅ Payment records permanent
- ✅ Invoices always available

### **Customer Rights**:
- ✅ Users can access their data anytime
- ✅ Order history always available
- ✅ Can request data deletion (GDPR)

### **Business Records**:
- ✅ Financial data preserved
- ✅ Audit trail maintained
- ✅ Compliance requirements met

---

## ⚙️ How to Verify Protection

### **Check What's Protected**:
```bash
# Run this to see what will be deleted
node scripts/optimizeDatabase.js

# It will show:
# - What CAN be deleted (notifications)
# - What will be archived (old orders)
# - What is PROTECTED (everything else)
```

### **Check TTL Indexes**:
```bash
# See what auto-deletes
node scripts/setupTTLIndexes.js

# Shows:
# ✅ Notifications: 30 days
# ❌ Orders: DISABLED (protected)
```

---

## 🎯 Summary

### **NEVER Auto-Deleted**:
- ✅ Users
- ✅ Products
- ✅ Active Orders
- ✅ Cancelled Orders (Changed!)
- ✅ Payments
- ✅ Service Bookings
- ✅ Seller Data

### **Auto-Deleted** (Safe):
- ✅ Notifications (30 days)
- ✅ Expired sessions

### **Archived** (Not Deleted):
- ✅ Old delivered orders (6+ months)
- ✅ Still accessible
- ✅ Can be restored

---

## 🛠️ Emergency Recovery

### **If Something Gets Deleted**:

1. **Check Archive First**:
   ```bash
   node scripts/queryArchive.js ORDER_NUMBER
   ```

2. **Check MongoDB Backups**:
   - Atlas has automatic backups
   - Can restore from backup

3. **Contact Support**:
   - MongoDB Atlas support
   - Can help recover data

---

## ✅ Your Data is Safe!

**Key Points**:
1. ✅ User credentials NEVER deleted
2. ✅ Orders NEVER auto-deleted
3. ✅ Payments NEVER deleted
4. ✅ Only notifications auto-deleted (safe)
5. ✅ Old orders archived (not deleted)
6. ✅ Everything important is protected

**You can use this system confidently - all essential data is protected!** 🔒
