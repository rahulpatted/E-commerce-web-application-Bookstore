# 📚 ShelfVerse — Premium Online Bookstore

A full-stack e-commerce bookstore application with a **React + TypeScript** frontend and a **FastAPI + MongoDB** backend. Features a complete shopping experience for customers and a powerful admin dashboard.

---

## ✨ Features

### Customer (USER)
- 🏠 Landing page with featured & newest books
- 🔍 Browse, filter & search books by category, price, rating, stock
- 📖 Book detail page with ratings, related books, add-to-cart & wishlist
- 🛒 Cart management (add, update quantity, remove, clear)
- ❤️ Wishlist
- 📦 Checkout with shipping details & payment method
- 🗒️ Order history & live order tracking
- 👤 Profile management (name, address, preferences)
- 🎯 Personalised recommendations based on favourite genres
- 🎫 Support ticket submission

### Admin (ADMIN)
- 📊 Dashboard — revenue, total orders, pending orders, stock alerts
- 📈 Analytics — category performance, top-selling books, recent orders
- 📚 Full book CRUD (create, edit, delete)
- 🏭 Inventory management — bulk stock updates
- 🧾 All-orders view with status & payment updates (Pending → Shipped → Delivered)
- 👥 User management — browse, view, activate/deactivate accounts
- 🎫 Support ticket management — respond and resolve

### General
- 🔐 JWT-based authentication (signup / login)
- 🌗 Dark / Light theme toggle
- 📱 Fully responsive design
- 🎨 Glassmorphism, smooth Framer Motion animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 8 |
| **Styling** | Vanilla CSS, Framer Motion |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Notifications** | React Hot Toast |
| **Routing** | React Router DOM v7 |
| **Backend** | FastAPI (Python 3.11+) |
| **Database** | MongoDB (via Motor async driver) |
| **Auth** | JWT (PyJWT) + bcrypt |
| **Validation** | Pydantic v2 |
| **Dev Server** | Uvicorn |

---

## 📁 Project Structure

```
Bookstore/
├── backend/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py          # Signup, login, profile
│   │   ├── books.py         # Book CRUD + rating + recommendations
│   │   ├── cart.py          # Cart management
│   │   ├── wishlist.py      # Wishlist management
│   │   ├── orders.py        # Order placement & tracking
│   │   ├── admin.py         # Admin-only endpoints
│   │   ├── search.py        # Fuzzy search
│   │   ├── support.py       # Support tickets
│   │   └── dependencies.py  # JWT auth dependencies
│   ├── db/
│   │   ├── mongo.py         # MongoDB connection
│   │   └── models.py        # Pydantic schemas
│   ├── main.py              # FastAPI app entry point
│   ├── seed_data.py         # Sample book data (25 books)
│   ├── seed_mongo.py        # MongoDB seeder script
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/      # Navbar, Footer
    │   │   └── ui/          # BookCard, Rating, Loader, EmptyState
    │   ├── context/
    │   │   ├── AuthContext.tsx
    │   │   └── CartContext.tsx
    │   ├── pages/
    │   │   ├── Home.tsx
    │   │   ├── Books.tsx
    │   │   ├── BookDetail.tsx
    │   │   ├── Cart.tsx
    │   │   ├── Checkout.tsx
    │   │   ├── Orders.tsx
    │   │   ├── OrderTracking.tsx
    │   │   ├── Wishlist.tsx
    │   │   ├── Profile.tsx
    │   │   ├── Support.tsx
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.tsx
    │   │       ├── AdminBooks.tsx
    │   │       ├── AdminOrders.tsx
    │   │       ├── AdminUsers.tsx
    │   │       └── AdminSupport.tsx
    │   ├── utils/
    │   │   └── api.ts       # Fetch wrapper with JWT interceptor
    │   ├── types.ts
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| MongoDB | 6.0+ (running locally or Atlas) |

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shelfverse.git
cd shelfverse
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=bookstore
JWT_SECRET=your_super_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

#### Seed the Database

```bash
python seed_mongo.py
```

This inserts 25 curated books and a default admin user into MongoDB.

#### Start the Backend Server

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API is now live at **http://127.0.0.1:8000**
Interactive docs: **http://127.0.0.1:8000/docs**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend is now live at **http://localhost:5173**

---

## 🔑 Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@shelfverse.com` | `Admin@123` |
| User | `user@shelfverse.com` | `User@123` |

> ⚠️ Change these credentials before deploying to production.

---

## 🌐 API Overview

All routes are served directly (no `/api` prefix).

### Auth — `/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/signup` | Public | Register a new user |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | User | Get current user profile |
| PUT | `/auth/profile` | User | Update profile |

### Books — `/books`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/books/` | Public | List books (filter, sort, paginate) |
| GET | `/books/featured` | Public | Top-rated books |
| GET | `/books/categories` | Public | All categories |
| GET | `/books/search?q=` | Public | Search by title/author/category |
| GET | `/books/{id}` | Public | Book detail |
| GET | `/books/{id}/related` | Public | Related books |
| GET | `/books/recommendations` | User | Personalised recommendations |
| POST | `/books/{id}/rate` | User | Submit a rating |
| POST | `/books/` | Admin | Create a book |
| PUT | `/books/{id}` | Admin | Update a book |
| DELETE | `/books/{id}` | Admin | Delete a book |

### Cart — `/cart`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/cart/` | User | Get cart |
| POST | `/cart/add` | User | Add item |
| PUT | `/cart/{item_id}` | User | Update quantity |
| DELETE | `/cart/{item_id}` | User | Remove item |
| DELETE | `/cart/` | User | Clear cart |

### Orders — `/orders`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/orders/` | User | My orders |
| POST | `/orders/` | User | Place an order |
| GET | `/orders/{id}` | User | Order detail |

### Admin — `/admin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Stats overview |
| GET | `/admin/analytics` | Sales analytics |
| GET/POST/PUT/DELETE | `/admin/books` | Book management |
| GET/PUT | `/admin/inventory/{id}` | Stock management |
| GET/PUT | `/admin/orders` | Order management |
| GET/PUT | `/admin/users` | User management |
| GET/PUT | `/admin/support` | Support tickets |

---

## 👤 User vs Admin

Both roles use the same `User` document in MongoDB. The only difference is the `role` field:

- `"USER"` — customer access (shop, cart, orders, profile)
- `"ADMIN"` — full access including all `/admin/*` endpoints

The `get_current_admin` dependency in `api/dependencies.py` enforces this — any request to an admin route from a USER account returns `403 Forbidden`.

---

## 🧪 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URL` | `mongodb://localhost:27017` | MongoDB connection string |
| `DATABASE_NAME` | `bookstore` | MongoDB database name |
| `JWT_SECRET` | — | Secret key for JWT signing (**change in prod!**) |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token expiry in minutes |

---

## 📦 Building for Production

### Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Backend
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

> 💡 For production, update `allow_origins` in `main.py` from `["*"]` to your actual frontend domain.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/my-feature`
3. Commit your changes — `git commit -m "feat: add my feature"`
4. Push to the branch — `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.


