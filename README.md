# Indiana Bazaar

Indiana Bazaar is a full-stack MERN e-commerce application for browsing products, managing a cart and wishlist, placing Razorpay or Cash on Delivery orders in INR, and writing verified customer reviews. It also includes protected admin tools for products, orders, and users.

## Features

### Customer features

- Public animated home page with hero and store-benefit sections
- Navbar product search
- Product catalog and product detail pages
- Product ratings and customer reviews
- MongoDB-backed shopping cart
- MongoDB-backed wishlist
- INR pricing
- Checkout payment choice: Razorpay or Cash on Delivery
- Server-side Razorpay payment verification
- Order history
- Responsive Bootstrap UI

### Admin features

- Protected admin dashboard
- Product creation, editing, and deletion
- Cloudinary product-image uploads
- Order management and status updates
- User directory

## Tech stack

- React 19
- React Router
- Redux Toolkit
- React Bootstrap and Bootstrap 5
- Framer Motion
- Node.js
- Express 5
- MongoDB and Mongoose
- JWT authentication
- Razorpay
- Cloudinary
- Multer

## Project structure

```text
Indiana-Bazaar/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── admin/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── redux/
│       └── utils/
├── package.json
└── README.md
```

## Practical requirements

- Node.js 18 or newer
- npm
- MongoDB Atlas or a local MongoDB instance
- Razorpay account and keys to accept online payments
- Cloudinary account

## Installation

Clone the repository and install dependencies at the project root:

```bash
git clone https://github.com/<your-username>/<your-repository>.git
cd <your-repository>
npm install
```

The root install command installs dependencies for both backend and frontend.

## Environment variables

Create `backend/.env` using the following template:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/indiana-bazaar
JWT_SECRET=replace-with-a-long-random-secret

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

RAZORPAY_KEY_ID=rzp_test_or_live_key_id
RAZORPAY_KEY_SECRET=rzp_test_or_live_key_secret

FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Do not commit real credentials or `.env` files.
Razorpay keys are required for online payments. Cash on Delivery can be used without an online payment gateway.

## Running locally

Start both frontend and backend with:

```bash
npm run dev
```

The services run at:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

Run either service separately:

```bash
npm run dev:client
npm run dev:server
```

## Seed sample products

After configuring MongoDB:

```bash
cd backend
npm run seed
```

## Build frontend

From the project root:

```bash
npm run build
```

The production build is generated in `frontend/dist`.

## Main API areas

| Area | Base path |
| --- | --- |
| Authentication | `/api/auth` |
| Products | `/api/products` |
| Orders | `/api/orders` |
| Payments | `/api/payment` |
| Cart | `/api/cart` |
| Wishlist | `/api/wishlist` |
| Reviews | `/api/reviews` |
| Analytics | `/api/analytics` |

At checkout, customers can pay with Razorpay or choose Cash on Delivery. Razorpay uses `POST /api/payment/order` and `POST /api/payment/verify`; COD uses the authenticated `POST /api/payment/cod-order` endpoint.

## Security notes

- Keep JWT and payment secrets out of source control.
- Use Razorpay test keys in development.
- Restrict environment credentials to server-side use.
- Add stronger rate limiting and validation before public production deployment.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run backend and frontend concurrently |
| `npm run dev:server` | Run the backend only |
| `npm run dev:client` | Run the frontend only |
| `npm run build` | Build the frontend |
| `npm install` | Install backend and frontend dependencies |
=======
# Indiana Bazaar
Indiana Bazaar is a full-stack MERN e-commerce platform offering product browsing, search, database-backed cart and wishlist management, secure INR payments through Razorpay, verified customer reviews, ratings, order history, and an admin portal for managing products, orders, and users.
