# VENDOORA Database Specification

This document reflects the current Prisma schema and the backend controllers that interact with it.

## Core Models

### User

Represents a registered account in the system.

Key fields:
- id, name, email, phone, password, googleId, profileImage, city, state, role, isVerified

Relationships:
- One optional Vendor profile
- Many Bookings as client
- Many Notifications
- Many Products as seller
- Many Reviews and Wishlists

Notes:
- Email is unique.
- Role defaults to CLIENT.

### Vendor

Represents a vendor business profile.

Key fields:
- id, userId, businessName, businessDescription, ownerName, category, phone, email, gstNumber, city, state, address, logo, coverImage, rating, totalReviews, totalBookings, verified, acceptingBookings

Relationships:
- One User
- Many Bookings
- Many InventoryItems
- Many Services
- Many VibeReels
- Many Reviews

Notes:
- The current controllers appear to use older field names such as name, location, and image in some places, which suggests the schema and controller layer are not fully aligned.

### Category

Catalog category for services.

Key fields:
- id, name, slug, description, icon, image

Relationships:
- Many Services

### Service

A vendor-offered service with pricing and availability information.

Key fields:
- id, vendorId, categoryId, title, description, startingPrice, priceType, duration, location, coverImage, isAvailable

Relationships:
- One Vendor
- One Category
- Many Bookings
- Many Wishlists

### InventoryItem

Inventory owned by a vendor and surfaced through the vendor dashboard.

Key fields:
- id, vendorId, name, units, hourlyRate, dailyRate, image

Relationships:
- One Vendor

### Product

A secondary-market listing for used or pre-owned event equipment.

Key fields:
- id, sellerId, name, description, price, aiSuggestedPrice, condition, location, image, available

Relationships:
- One User as seller

### Booking

Represents a booking or inquiry created by a client for a vendor.

Key fields:
- id, clientId, vendorId, serviceId, eventName, eventDate, startTime, endTime, guestCount, venue, specialRequest, totalPrice, paymentStatus, status, otp, cancellationReason

Relationships:
- One Client User
- One Vendor
- Optional Service

### Notification

User-facing alerts and system messages.

Key fields:
- id, userId, title, message, time, type, read

Relationships:
- One User

### VibeReel

Short-form vendor content for the reels experience.

Key fields:
- id, vendorId, title, thumbnail, views, duration

Relationships:
- One Vendor

### Review

Customer feedback for a vendor.

Key fields:
- id, userId, vendorId, rating, comment

Relationships:
- One User
- One Vendor

### Wishlist

Stores user favorites for services.

Key fields:
- id, userId, serviceId

Relationships:
- One User
- One Service

## Enums

- Role: CLIENT, VENDOR, ADMIN
- BookingStatus: PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, DECLINED
- PriceType: FIXED, HOURLY, DAILY
- ProductCondition: MINT, EXCELLENT, GOOD, FAIR
- PaymentStatus: PENDING, PAID, FAILED, REFUNDED

## Indexes

The schema defines indexes for:
- User email and role
- Vendor city, state, category, rating
- Service vendorId, categoryId, startingPrice
- Booking clientId, vendorId, serviceId, status
- Review vendorId

## Suggested Improvements (No Schema Changes Yet)

The following are observations for future refinement rather than immediate implementation:

- Align controller field names with the Prisma schema so vendor profile updates and queries use the same contract.
- Add richer booking search and filtering support for dates, status, and geography.
- Introduce composite indexes for common lookup patterns such as vendor category + city + rating.
- Consider storing audit metadata for booking state transitions and notifications.
- Add soft-delete or archival support for marketplace products and bookings if the product grows.
