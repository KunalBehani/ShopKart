# ShopKart — Frontend Authentication Lab (React + Express API)

Welcome to the **ShopKart** customer authentication and home flow application. This repository contains the complete frontend (React 18, Vite, React Router DOM, Axios, Tailwind CSS) integrated with the backend customer authentication service.

---

## 🚀 Features & Completed Tasks

### Task 1 — Customer Registration (`/register`) [25 Marks]
- Controlled form fields: Full Name, Email, Password, and Phone Number.
- Real-time client-side validation for mandatory fields, valid email format, minimum 6-character password, and phone formatting.
- Server-side error handling (handles duplicate 409 email conflict, 400 bad request, 500 server errors).
- Success notification state with automatic redirect to `/login`.
- Smooth toggle for password visibility and quick navigation link to login.

### Task 2 — Customer Login (`/login`) [30 Marks]
- Controlled form fields: Email and Password.
- Automatic cookie transmission via Axios `withCredentials: true`.
- Server-side authentication (`POST /customers/login`) setting a secure `HttpOnly` JWT cookie.
- Clear error notification displaying "Invalid credentials" upon authentication failure.
- Auto-redirection to `/home` on successful authentication.

### Task 3 — Protected Home Dashboard (`/home`) [30 Marks]
- Protected route wrapper checking authentication status via `GET /customers/me`.
- Automatic redirection to `/login` if unauthenticated or token expires.
- Displays logged-in customer details:
  - Welcome banner with customer name
  - Full Name, Email address, Phone number, and Customer ID
  - Active customer badge and session status
- Bonus: Integrated **Change Password** modal calling `PATCH /customers/change-password`.

### Task 4 — Logout Flow (`Navbar.jsx`) [15 Marks]
- Responsive navigation bar with active route highlighting and customer profile badge.
- Logout button triggering `POST /customers/logout`.
- Clears the `HttpOnly` cookie on the backend, updates auth state, and redirects user to `/login`.

---

## 🛒 Lab 03 — Product Discovery Features

### Backend Product APIs
- **Product Model** (`backend/models/product.model.js`): Mongoose schema validating `name`, `description`, `price` (> 0), `category`, `image`, and non-negative `stock` (>= 0).
- **Create Product** (`POST /products`): Status `201 Created` with created product; handles missing fields (400), invalid price (400), and invalid stock (400).
- **Get All Products** (`GET /products`): Returns `{ success: true, count, products }`.
- **Search, Category Filter & Sorting**:
  - `GET /products?search=keyboard` (case-insensitive name regex).
  - `GET /products?category=Electronics` (category matching).
  - `GET /products?sort=price_asc` and `GET /products?sort=price_desc` (price sorting).
  - Dynamically combined query building.
- **Get Single Product** (`GET /products/:id`): Validates MongoDB ObjectId (400), handles not found (404), returns product (200).
- **Auto-Seeder** (`backend/utils/seedProducts.js`): Automatically seeds 10 realistic products across Electronics, Fashion, Books, and Home on startup.

### Frontend Product Discovery UI
- **Product Listing Page** (`/products`):
  - Fetches dynamically from `GET /products` using Axios service `getProductsApi`.
  - **Product Card** (`src/components/ProductCard.jsx`): Image, title, formatted price (₹), category badge, stock status ("X units left" / "Out of stock"), and "View Details" button.
  - **Search & Filter Bar** (`src/components/SearchBar.jsx`): Real-time search bar, category dropdown & pills, price sort dropdown, and filter reset button.
  - **State Handling**:
    - **Loading State**: Skeletons & spinner while fetching ("Loading products...").
    - **Error State**: Error card with "Something went wrong while loading products." and a retry button.
    - **Empty State**: Friendly "No products found." card with a clear filters button.
- **Product Details Page** (`/products/:id`):
  - Dynamic route reading ID via `useParams()`.
  - Fetches product using `GET /products/:id`.
  - Displays large image, title, formatted price, description, category, stock badge, quantity selector, and interactive "Add to Cart" button.
  - Handles 404 / invalid product error states with navigation back to catalogue.

---

## 🛠️ Tech Stack & Folder Structure

- **Frontend**: React 18, Vite, React Router DOM v6, Axios, Tailwind CSS, Lucide React Icons.
- **Backend**: Express.js, MongoDB / MongoMemoryServer, JSON Web Tokens (JWT), Bcrypt.js, Cookie-Parser.

### Project Structure
```
ShopKart/
├── backend/
│   ├── config/db.js
│   ├── controllers/customer.controller.js
│   ├── middlewares/auth.middleware.js
│   ├── models/customer.model.js
│   ├── routes/customer.routes.js
│   ├── utils/generateToken.js
│   └── index.js
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🏃 Quick Start Guide

### 1. Start the Backend API (Port 5001)
```bash
npm run backend
# or
cd backend
npm install
npm start
```
> **Note for macOS users**: Port 5001 is used by default because macOS Monterey, Ventura, Sonoma, and Sequoia reserve port 5000 for Apple AirPlay Receiver.

### 2. Start the Frontend Dev Server
```bash
npm install
npm run dev
```

Visit the local URL shown by Vite (e.g., **`http://localhost:5173`** or **`http://localhost:5175`**) in your browser.

---

## 📋 TA Viva Questions & Answers

### 1. Why do we use `withCredentials: true`?
> **Answer**: By default, standard AJAX/Fetch/Axios requests do not send credentials (such as cookies, authorization headers, or TLS certificates) for cross-origin or proxy requests. Setting `withCredentials: true` instructs the browser to attach stored cookies (such as our `token` HttpOnly cookie) to outgoing requests and accept cookies set in response headers.

### 2. Why can't JavaScript read an `HttpOnly` cookie?
> **Answer**: The `HttpOnly` flag is a browser security mechanism designed to prevent client-side scripts (such as `document.cookie`) from reading or modifying the cookie. This provides vital protection against Cross-Site Scripting (XSS) attacks, preventing malicious scripts from stealing the user's session token.

### 3. Why is `/home` called a protected route?
> **Answer**: A protected route is a route that strictly requires an active, authenticated session. In our React application, `ProtectedRoute` verifies whether the customer is authenticated by validating the session via `GET /customers/me`. If the user is unauthenticated or the token is missing/expired, the route automatically blocks rendering and redirects the user to `/login`.

### 4. Why do we fetch `/customers/me` instead of storing the user manually in `localStorage`?
> **Answer**: Relying on `localStorage` to store user profiles can lead to stale, inaccurate, or tampered user data, and does not verify if the server session is actually still valid. Fetching `/customers/me` verifies the `HttpOnly` cookie directly with the backend, ensuring that only currently authorized sessions can fetch live customer details from the database (single source of truth).

### 5. What is the difference between authentication and authorization?
> **Answer**:
> - **Authentication (AuthN)**: Verifying **who** a user is (e.g. validating email and password during login, issuing a JWT).
> - **Authorization (AuthZ)**: Verifying **what** permissions or actions that authenticated user is permitted to perform (e.g. allowing customers to view only their own profile `/customers/me`, or restricting admin capabilities).
