# VENDOORA API Specification

The current API layer is mounted under /api and is implemented using Express routers and controller modules.

## Existing API Endpoints

### Authentication

- POST /api/auth/register
  - Registers a new user account
  - Accepts email, password, name, and optional role
- POST /api/auth/login
  - Authenticates a user and returns a JWT
- GET /api/auth/me
  - Returns the authenticated user profile

### Vendors

- GET /api/vendors
  - Lists vendors with optional category, search, or location filters
- GET /api/vendors/:id
  - Fetches a single vendor profile with inventory and reels
- PUT /api/vendors/profile
  - Updates the authenticated vendor profile

### Inventory

- POST /api/inventory
  - Adds a new inventory item for a vendor
- PUT /api/inventory/:id/rates
  - Updates hourly and daily inventory rates
- DELETE /api/inventory/:id
  - Deletes an inventory item

### Bookings

- POST /api/bookings
  - Creates a booking inquiry for a vendor
- GET /api/bookings/vendor
  - Returns bookings for the authenticated vendor
- GET /api/bookings/client
  - Returns bookings for the authenticated client
- PUT /api/bookings/:id/status
  - Updates booking status
- POST /api/bookings/cancel
  - Authenticated customer cancellation; refunds eligible paid future bookings

### Payments (Razorpay)

- POST /api/payments/orders
  - Authenticated client creates or reuses an INR Razorpay order for an owned booking
  - Server derives the amount from Booking.totalPrice and returns 409 if already paid
- POST /api/payments/verify
  - Authenticated client submits Razorpay order/payment/signature values
  - Server verifies the HMAC signature, provider payment, amount, currency, and updates Payment and Booking.paymentStatus to PAID or FAILED
- POST /api/payments/failed
  - Records a failed or cancelled checkout for an owned unpaid booking
- GET /api/payments/bookings/:bookingId
  - Returns payment status for an owned booking
- GET /api/payments/vendor/summary
  - Returns paid booking count, paid/refunded amounts, and pending payment count for the authenticated vendor

### Orders & Fulfillment

- GET /api/orders/client
  - Returns fulfillment orders for the authenticated customer
- GET /api/orders/vendor
  - Returns fulfillment orders for the authenticated vendor
- PUT /api/orders/:id/status
  - Vendor-only lifecycle update for CONFIRMED, PREPARING, READY, IN_PROGRESS, COMPLETED, or valid CANCELLED transitions
  - May also update notes and trackingReference

Orders are created automatically only after both Booking.paymentStatus and the linked Payment status are PAID. Order status does not replace booking or payment state.

### Marketplace

- POST /api/marketplace/products
  - Lists a new marketplace product
- GET /api/marketplace/products
  - Fetches all marketplace products
- DELETE /api/marketplace/products/:id
  - Deletes a marketplace listing

### Notifications

- GET /api/notifications
  - Gets notifications for the authenticated user
- PUT /api/notifications/:id/read
  - Marks a notification as read
- PUT /api/notifications/read-all
  - Marks all notifications as read

### Reviews

- POST /api/reviews
  - Authenticated customer creates one 1-5 rating and optional comment for their completed order
  - Returns 403 when the order is not owned and completed, and 409 for duplicate reviews
- GET /api/reviews/client
  - Returns reviews created by the authenticated customer
- GET /api/reviews/vendor
  - Returns reviews received by the authenticated vendor
- GET /api/reviews/vendor/:vendorId
  - Publicly returns reviews for a vendor profile

Important booking, payment, cancellation, fulfillment, and review events create persisted notifications. Notification reads remain user-owned.

### Vibe Reels

- POST /api/reels
  - Publishes a new reel for a vendor
- GET /api/reels
  - Fetches reels
- DELETE /api/reels/:id
  - Deletes a reel

## Health Check

- GET /api/health
  - Returns a simple health payload

## Missing or Incomplete APIs

The current API surface is still early-stage. The following areas are not yet fully represented by dedicated endpoints:

- Google OAuth sign-in and OAuth callback handlers
- Category browsing and service discovery endpoints beyond vendor listings
- Reviews and ratings management
- Wishlist create/read/delete endpoints
- Vendor analytics summaries and reporting endpoints
- File upload endpoints for profile images, cover images, and product images
- Search ranking and recommendation APIs

## Suggested REST Endpoints (Documentation Only)

The following endpoints would fit the existing domain model and UI direction:

- GET /api/categories
- GET /api/services
- GET /api/services/:id
- POST /api/wishlist
- DELETE /api/wishlist/:id
- GET /api/reviews/vendor/:vendorId
- POST /api/reviews
- GET /api/analytics/vendor/:vendorId
- POST /api/auth/google
- POST /api/uploads/image

## Notes

The current backend is functional as a prototype layer, but the API contracts would benefit from stricter validation, clearer response schemas, and stronger alignment with Prisma field names.
