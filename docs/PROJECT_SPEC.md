# VENDOORA Project Specification

## Vision

Create a premium, AI-assisted event marketplace that makes it easier for customers to discover, compare, and book event services while giving vendors a modern control center for bookings, inventory, pricing, and community content.

## Mission

Provide a trusted, elegant, and mobile-first platform for event planning that blends discovery, logistics, marketplace commerce, and creator-style content in one experience.

## Target Users

- Customers planning weddings, parties, corporate events, and celebrations
- Vendors offering venues, decor, catering, lighting, sound, rentals, and related services
- Buyers and sellers participating in the used-equipment marketplace

## Business Model

The platform is positioned as a premium event discovery and transaction layer with opportunities for:

- Commission or service fees from bookings
- Vendor subscriptions or premium listings
- Secondary marketplace transaction fees
- Upsell services such as AI pricing and logistics optimization

## Customer Flow

1. Browse the landing experience for categories, featured vendors, reels, and marketplace products
2. Search by category, location, or keywords
3. Review vendor profiles and packages
4. Submit a budget or inquiry
5. Receive notifications and track booking progress

## Vendor Flow

1. Switch into vendor mode from the landing experience
2. Review analytics, bookings, inventory, pricing, and notifications
3. Publish inventory items and marketplace products
4. Manage reels and logistics workflows
5. Accept or decline incoming inquiries

## Marketplace Flow

1. Vendors publish used gear and event equipment
2. Customers browse equipment listings and view condition and pricing
3. Listings can be created and deleted through the current backend APIs

## Booking Flow

1. A customer submits an inquiry from the landing experience
2. The system creates a booking record and notifies the vendor
3. The vendor can update booking status from the command center
4. Booking lifecycle states are expressed through the Prisma booking model

## User Roles

- CLIENT: consumers who browse, inquire, and book
- VENDOR: service providers and sellers who manage listings and bookings
- ADMIN: reserved role in the auth and access control layer

## Future AI Features

The repository already hints at AI-driven functionality in the UI and environment examples, including:

- AI-assisted pricing recommendations
- Smart vendor matching for budgets and event requirements
- Automated opportunity summaries and customer recommendations
- AI-generated marketing hooks for reels and product listing support

## Application Architecture

The current architecture is a single-app, single-database experience with shared authentication and role-based access. The frontend is a React/Vite experience that switches between customer and vendor modes, while the backend exposes a REST-like API through Express and Prisma.
