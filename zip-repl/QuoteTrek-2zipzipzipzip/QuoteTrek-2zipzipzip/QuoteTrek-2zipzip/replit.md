# Roshan Tours & Travels - Quotation Management System

## Overview

This is a full-stack quotation management system for Roshan Tours & Travels, designed to streamline the creation and management of travel quotations for Umrah, Ramadan Umrah, International, and Domestic travel packages. The system provides CRUD operations for master data (hotels, transport, meals, visa, laundry, add-ons, exchange rates, and service charges) and enables automated quotation generation with professional PDF output.

The application is built as a modern web application with a React frontend and Express backend, using PostgreSQL for data persistence and Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for the UI layer
- **Vite** as the build tool and development server with HMR (Hot Module Replacement)
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query** (React Query) for server state management, data fetching, and caching

**UI Component Library**
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for styling with custom design tokens
- Component style: "new-york" variant with neutral base color
- Custom CSS variables for theming (light/dark mode support)

**Design System**
- Typography: Inter for UI text, JetBrains Mono for numerical/currency values
- Inspired by modern productivity tools (Linear, Notion) with Material Design principles
- Focus on data clarity and professional presentation for business use
- Consistent spacing using Tailwind's spacing scale (2, 4, 6, 8, 12, 16)

**State Management**
- TanStack Query handles all server state (quotations, master data)
- Local state managed with React hooks
- Form state managed by React Hook Form with Zod validation

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- HTTP server created with Node's native `http` module
- Middleware: JSON body parsing, URL encoding, request logging

**API Design**
- RESTful API endpoints under `/api/*` namespace
- Session-based authentication protecting all API routes
- CRUD operations for all master data entities
- Quotation management with complex data structures

**Database Layer**
- **Drizzle ORM** for type-safe database operations
- **Neon Serverless Postgres** as the database provider
- WebSocket connection pooling for serverless environments
- Schema-first approach with TypeScript type inference

**Development & Production**
- Development: Vite middleware mode with Express for unified dev server
- Production: Static file serving from pre-built `dist/public` directory
- Build process uses esbuild for server bundling with selective dependency bundling

### Data Storage

**Database Schema** (PostgreSQL via Neon)

Core tables:
- `users` - User authentication and profile data (Replit Auth integration)
- `sessions` - Session storage (connect-pg-simple)
- `hotels` - Hotel master data (name, location, star rating, pricing)
- `transport` - Transportation options (type, route, pricing)
- `meals` - Meal plans and pricing
- `visa` - Visa types and fees
- `laundry` - Laundry service options
- `addons` - Optional add-on services
- `exchange_rates` - Currency conversion rates
- `service_charges` - Service fee configurations
- `quotations` - Main quotation records
- `quotation_transport` - Join table for quotation-transport relationships
- `quotation_addons` - Join table for quotation-addon relationships

**Schema Features**
- Foreign key constraints for referential integrity
- Timestamp tracking (createdAt, updatedAt)
- Soft delete support (isActive flags)
- Decimal precision for currency values (10, 2)
- JSON/JSONB for flexible data structures

**ORM Strategy**
- Drizzle schema definitions in `shared/schema.ts`
- Zod schemas generated from Drizzle schemas for validation
- Type-safe queries with full TypeScript inference
- Storage abstraction layer in `server/storage.ts`

### Authentication & Authorization

**Replit Auth Integration**
- OpenID Connect (OIDC) based authentication
- Passport.js strategy for session management
- PostgreSQL session store using connect-pg-simple
- Session lifetime: 7 days with HTTP-only cookies
- Token refresh mechanism for long-lived sessions

**User Management**
- User profiles stored in `users` table
- Automatic user creation/update on authentication
- Role-based access (currently: admin role)
- Session data includes claims, access token, refresh token

**Route Protection**
- All `/api/*` routes protected with `isAuthenticated` middleware
- Unauthenticated requests return 401 status
- Frontend handles auth state via TanStack Query
- Automatic redirect to login page when unauthenticated

### External Dependencies

**Third-Party Services**
- **Neon Database** - Serverless PostgreSQL hosting
- **Replit Auth** - OAuth/OIDC authentication provider
- WebSocket support via `ws` library for database connections

**Key npm Packages**

Frontend:
- `@tanstack/react-query` - Data fetching and caching
- `@radix-ui/*` - Headless UI component primitives
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `date-fns` - Date manipulation
- `wouter` - Routing
- `tailwindcss` - Utility-first CSS

Backend:
- `express` - Web server framework
- `drizzle-orm` - Database ORM
- `@neondatabase/serverless` - Postgres client
- `passport` - Authentication middleware
- `openid-client` - OIDC implementation
- `express-session` - Session management
- `connect-pg-simple` - PostgreSQL session store

Build Tools:
- `vite` - Frontend build tool
- `esbuild` - Server bundling
- `typescript` - Type checking
- `tsx` - TypeScript execution

**PDF Generation**
- Planned integration with DOMPDF or mPDF (referenced in requirements)
- Current implementation includes PDF view route (`/quotations/:id/pdf`)

**Multi-Currency Support**
- Exchange rates table for currency conversion
- Designed for travel industry use cases (multiple currencies)

**Development Tools**
- Replit-specific plugins for cartographer and dev banner in development mode
- Runtime error overlay for better DX
- ESM module system throughout (type: "module" in package.json)