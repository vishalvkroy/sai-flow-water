# 💧 Water Filter E-Commerce & Service Platform

A professional full-stack e-commerce platform for water purifier sales and services with integrated payment gateway, automated booking system, and shipping integration.

---

## 🚀 Features

### 🛒 E-Commerce
- Product catalog with categories
- Shopping cart & wishlist
- Secure checkout process
- Order tracking
- Multiple payment methods (Razorpay, COD, UPI)
- Automated order confirmation emails

### 🔧 Service Booking System
- **Distance-based pricing** (0-10km: ₹300, 10-20km: ₹400, 20+km: ₹500)
- **50% advance payment** required
- **Auto-confirmation** after payment
- Professional email notifications
- Technician assignment
- Service tracking
- **Cancellation policy** (₹100 fee after visit)
- Automated refund processing

### 💳 Payment Integration
- **Razorpay** payment gateway
- Online payments (Cards, UPI, Net Banking)
- **Mock payment mode** for development
- Secure payment verification
- Automatic refund processing

### 📦 Shipping Integration
- **Shipmozo API** integration
- Real-time shipping rates
- Automated AWB generation
- Order tracking
- Webhook notifications

### 📧 Email System
- Professional HTML email templates
- Booking confirmations
- Order confirmations
- Technician assignment notifications
- Service completion emails
- Password reset emails

### 👥 User Management
- Customer registration & login
- Seller dashboard
- Profile management
- Order history
- Service booking history

### 📊 Seller Dashboard
- Order management
- Service booking management
- Product management
- Customer management
- Analytics & reports
- Revenue tracking

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Styled Components** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - API calls
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Razorpay SDK** - Payment processing
- **Shipmozo API** - Shipping integration

---

## 📁 Project Structure

```
Water Filter copyy/
├── backend/
│   ├── controllers/        # Business logic
│   ├── models/            # Database schemas
│   ├── routes/            # API routes
│   ├── services/          # External services (email, etc.)
│   ├── utils/             # Utility functions
│   ├── middleware/        # Auth, error handling
│   └── server.js          # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── utils/         # Helper functions
│   │   └── App.js         # Main app component
│   └── public/            # Static files
│
└── Documentation/
    ├── AUTOMATED_CONFIRMATION_SYSTEM.md
    ├── SERVICE_PAYMENT_SUMMARY.md
    ├── PRODUCTION_SETUP.md
    └── RAZORPAY_SETUP_GUIDE.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gmail account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   cd "Water Filter copyy"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**
   
   Create `backend/.env`:
   ```env
   # Server
   NODE_ENV=development
   PORT=5000

   # Database
   MONGODB_URI=mongodb://localhost:27017/arroh-water-filter

   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d

   # Razorpay (Test Mode)
   RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
   RAZORPAY_KEY_SECRET=YOUR_SECRET

   # Email
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Company Info
   COMPANY_NAME=Sai Enterprises
   COMPANY_EMAIL=your_email@gmail.com
   COMPANY_PHONE=+91 1234567890
   COMPANY_LOCATION=Your City, State

   # Frontend URL
   FRONTEND_URL=http://localhost:3000

   # Shipmozo (Optional)
   SHIPMOZO_PUBLIC_KEY=your_public_key
   SHIPMOZO_PRIVATE_KEY=your_private_key
   ```

5. **Start Development Servers**

   **Backend:**
   ```bash
   cd backend
   npm start
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## 📖 Key Features Documentation

### Service Booking Flow

1. **Customer creates booking** → Status: `pending`
2. **Customer pays advance** → Status: `confirmed` (auto)
3. **Email sent** with booking details
4. **Seller assigns technician** → Status: `assigned`
5. **Service starts** → Status: `in_progress`
6. **Service completed** → Status: `completed`

### Payment Flow

1. **Customer selects service** → Distance calculated
2. **Pricing displayed** → Total, advance, remaining
3. **Terms accepted** → Cancellation policy shown
4. **Payment processed** → Razorpay/Mock payment
5. **Booking confirmed** → Email sent automatically

### Order Flow

**Online Payment:**
- Order placed → Payment → Auto-confirmed → Email sent

**COD:**
- Order placed → Seller confirms → Email sent

---

## 🔐 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Payment signature verification
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 📧 Email Templates

Professional HTML emails for:
- Service booking confirmation
- Technician assignment
- Service completion
- Order confirmation
- Password reset

---

## 💰 Payment Methods

### Razorpay Integration
- Credit/Debit cards
- UPI (Google Pay, PhonePe, etc.)
- Net Banking
- Wallets

### Mock Payment (Development)
- Automatic for test credentials
- No Razorpay account needed
- Perfect for testing

### COD
- Cash on Delivery
- Seller confirmation required

---

## 📦 Shipping Integration

### Shipmozo Features
- Real-time rate calculation
- Automated AWB generation
- Order tracking
- Webhook notifications
- Multiple courier support

---

## 🎯 User Roles

### Customer
- Browse products
- Place orders
- Book services
- Track orders
- Manage profile
- View history

### Seller
- Manage products
- Process orders
- Assign technicians
- View analytics
- Manage customers
- Track revenue

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password/:token` - Reset password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)
- `DELETE /api/products/:id` - Delete product (seller)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update status (seller)

### Services
- `POST /api/services` - Create service booking
- `GET /api/services/my` - Get user bookings
- `GET /api/services/:id` - Get booking details
- `POST /api/services/calculate-pricing` - Calculate pricing
- `POST /api/services/:id/payment/create-order` - Create payment
- `POST /api/services/:id/payment/verify` - Verify payment
- `PUT /api/services/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

---

## 🧪 Testing

### Mock Payment Mode
- Automatically enabled with test credentials
- No Razorpay account needed
- Confirmation dialog instead of payment gateway
- Perfect for development

### Test Credentials
```
Email: test@example.com
Password: test123
```

---

## 🚀 Production Deployment

1. **Get Razorpay Live Credentials**
   - Complete KYC
   - Get live API keys
   - Update `.env`

2. **Configure Email**
   - Use Gmail App Password
   - Or configure SMTP

3. **Setup Shipmozo**
   - Get API credentials
   - Configure pickup location

4. **Deploy Backend**
   - Use Heroku, AWS, or DigitalOcean
   - Set environment variables
   - Enable HTTPS

5. **Deploy Frontend**
   - Use Netlify, Vercel, or AWS S3
   - Update API URL
   - Build production bundle

---

## 📊 Database Models

### User
- name, email, password
- role (customer/seller)
- phone, address
- isActive, timestamps

### Product
- name, description, price
- category, images
- stock, ratings
- seller reference

### Order
- user, items, totalPrice
- shippingAddress
- paymentMethod, paymentStatus
- orderStatus, trackingInfo

### ServiceBooking
- user, serviceType, productType
- preferredDate, timeSlot
- address, distance
- serviceCost, advanceAmount
- paymentStatus, assignedTechnician

---

## 🤝 Contributing

This is a private project. For any queries, contact the development team.

---

## 📝 License

Proprietary - All rights reserved

---

## 📞 Support

For support, email: saienterprises8084924834@gmail.com
Phone: +91 8084924834

---

## 🎉 Credits

Developed by: Professional Development Team
Company: Sai Enterprises
Location: Aurangabad, Bihar

---

**🚀 Ready to revolutionize water purifier sales and services! 💧**
