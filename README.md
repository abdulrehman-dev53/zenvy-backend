# Zenvy Backend

Backend API for Zenvy, a modern eCommerce platform built using Node.js, Express.js, and MongoDB. This backend handles authentication, product management, cart functionality, order processing, user management, and secure API operations.

## 🚀 Features

- User Authentication & Authorization
- JWT-Based Secure Login System
- Role-Based Access Control (Admin & Customer)
- Product Management (CRUD Operations)
- Category Management
- Shopping Cart Functionality
- Order Management
- User Profile Management
- MongoDB Database Integration
- RESTful API Architecture
- Error Handling & Validation
- Secure Password Hashing
- Environment Variable Configuration

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js
- dotenv
- CORS

## 📂 Project Structure

```bash
backend/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── uploads/
├── utils/
├── .env
├── server.js
└── package.json
```

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/zenvy-backend.git
```

### Navigate to Project

```bash
cd zenvy-backend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Run Development Server

```bash
npm run dev
```

### Run Production Server

```bash
npm start
```

---

## 🔑 API Modules

### Authentication
- Register User
- Login User
- JWT Token Generation
- Protected Routes

### Products
- Create Product
- Get All Products
- Get Single Product
- Update Product
- Delete Product

### Cart
- Add To Cart
- Remove From Cart
- Update Quantity
- Get User Cart

### Orders
- Create Order
- View Orders
- Update Order Status

### Users
- User Profile
- User Management
- Admin Controls

---

## 📦 Database Models

- User
- Product
- Cart
- Order

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing with bcrypt
- Protected Routes
- Environment Variables
- Role-Based Authorization

---

## 🎯 Future Improvements

- Payment Gateway Integration
- Wishlist Functionality
- Product Reviews & Ratings
- Advanced Search & Filtering
- Email Notifications
- Analytics Dashboard

---

## 👩‍💻 Author

**Helya Saeed**

Full Stack MERN Developer

LinkedIn: https://linkedin.com/in/your-linkedin

GitHub: https://github.com/your-github

---

⭐ If you find this project useful, consider giving it a star.
