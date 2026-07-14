# VENDOORA Documentation Hub

This document set captures the current state of the VENDOORA repository as of 2026-07-14. The project is a premium, AI-inspired event marketplace that combines a customer-facing discovery experience with a vendor command center, backed by a Node.js/Express API and a Prisma/PostgreSQL data layer.

## What VENDOORA is

VENDOORA is a premium marketplace for event vendors and customers. It is designed to help users discover vendors, browse event services, place inquiries, review event gear in a secondary marketplace, and manage vendor operations from a unified experience.

## Current Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion-style animation via Motion
- Backend: Node.js, Express
- Database: PostgreSQL, Prisma
- Authentication: JWT-based auth flow with placeholder/early-stage integration points
- Storage/AI: Cloudinary and Gemini-style AI hooks are referenced in environment examples but are not yet fully wired as core product flows

## Project Structure

- src/: React app entry, pages, components, data, and type definitions
- server/: Express controllers, routes, middleware, and DB config
- prisma/: Prisma schema and migrations
- assets/: static assets

## Installation

1. Install dependencies
   ```bash
   npm install
   ```
2. Configure environment variables in a local .env file based on .env.example
3. Ensure PostgreSQL is available and set DATABASE_URL
4. Run Prisma migrations
   ```bash
   npx prisma migrate dev
   ```
5. Start the app
   ```bash
   npm run dev
   ```

## Running Locally

The app runs locally through a Vite-powered frontend and an Express server entrypoint:

- Frontend and API: http://localhost:3000

## Environment Variables

The current example file lists the following variables:

- GEMINI_API_KEY: placeholder for AI capabilities
- APP_URL: app base URL
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: JWT signing secret

## Development Workflow

- Keep the current frontend and backend architecture intact unless a change is explicitly requested.
- Prefer small, documented changes that preserve existing UI and routing behavior.
- Update Prisma schema only when a scoped migration plan is approved.
- Keep documentation in sync with functional changes.
