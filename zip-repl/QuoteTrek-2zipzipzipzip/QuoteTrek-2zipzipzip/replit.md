# Roshan Tours & Travels - Quotation Management System

## Overview

A full-stack quotation management system for Roshan Tours & Travels designed to streamline the creation and management of travel quotations for Umrah, Ramadan Umrah, International, and Domestic travel packages. The application enables tour operators to quickly generate professional quotations with automatic pricing calculations, multi-currency support, PDF generation, and WhatsApp sharing capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Technology Stack**
- React 18 with TypeScript for type-safe UI development
- Vite as the build tool with Hot Module Replacement for fast development
- Wouter for lightweight client-side routing (alternative to React Router)
- TanStack Query (React Query) for server state management, data fetching, and caching
- React Hook Form with Zod for form validation

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS v4 with custom design tokens and CSS variables
- Design philosophy inspired by Linear and Notion with Material Design principles
- Typography: Inter font for UI text, JetBrains Mono for numerical/currency values
- Supports light/dark mode theming via CSS class toggle
- Consistent spacing scale using Tailwind units (2, 4, 6, 8, 12, 16)

**State Management Approach**
- Server state managed entirely through TanStack Query with aggressive caching
- Local component state via React hooks (useState, useReducer)
- Form state handled by React Hook Form
- Authentication state cached in TanStack Query with `/api/auth/user` endpoint

**Path Aliases**
- `@/*` maps to `client/src/*`
- `@shared/*` maps to `shared/*` (shared TypeScript types/schemas)
- `@assets/*` maps to `attached_assets/*`

### Backend Architecture

**Server Framework**
- Express.js with TypeScript running on Node.js
- HTTP server created using Node's native `http` module
- Session-based authentication with express-session
- JSON body parsing with 50mb limit for large quotation data

**Authentication Strategy**
- Simple username/password authentication (admin/admin@123)
- Session storage in memory during development
- Session cookies with httpOnly, secure flags in production
- `/api/login` endpoint for authentication
- `isAuthenticated` middleware protecting all API routes
- Fallback support for Replit Auth (conditionally enabled in Replit environment)

**API Design**
- RESTful API under `/api/*` namespace
- CRUD endpoints for all master data entities (hotels, transport, meals, visa, laundry, addons, pricing packages, service charges, company settings)
- Quotation endpoints for create, read, update, delete operations
- All endpoints return JSON responses
- Error handling with appropriate HTTP status codes

**Database Layer**
- Drizzle ORM for type-safe database queries
- PostgreSQL as the primary database (via `@neondatabase/serverless`)
- Schema defined in `shared/schema.ts` using Drizzle's schema builder
- Migrations stored in `/migrations` directory
- Connection pooling via `pg` Pool

### Data Model

**Core Entities**
- **Users**: Authentication and admin profile data
- **Hotels**: Accommodation with location (Makkah/Madina), star rating, room pricing by bed configuration
- **Transport**: Vehicle types with per-vehicle pricing
- **Meals**: Meal plans with per-person pricing for adults/children
- **Visa**: Visa types with processing costs and days
- **Laundry**: Laundry services with per-person pricing
- **Addons**: Optional services/items with unit pricing
- **Pricing Packages**: Package-level pricing templates
- **Service Charges**: Administrative fees and service charges
- **Company Settings**: Business details, logos, terms & conditions
- **Quotations**: Main quotation entity with traveler counts, dates, selections
- **Quotation Relations**: Many-to-many relationships for transport and addons

**Database Relationships**
- Quotations reference Hotels (Makkah and Madina separately)
- Quotations reference Visa, Meals, and Laundry via foreign keys
- QuotationTransport junction table for multiple transport selections
- QuotationAddons junction table for multiple addon selections
- All foreign keys use integer IDs with ON DELETE CASCADE

### Business Logic

**Pricing Calculator**
- Centralized pricing logic in `client/src/lib/pricingCalculator.ts`
- Calculates costs for: hotels (by nights and room beds), meals (by days and meal plan), laundry, visa, transport (by vehicle count), addons (by quantity)
- Service charge application (percentage or fixed amount)
- Discount support (percentage or fixed amount)
- Per-person vs per-unit pricing calculations
- Infant travelers count but don't incur costs
- Returns detailed breakdown of all cost components

**PDF Generation**
- Client-side PDF generation using html2canvas and jsPDF
- Renders quotation view component to canvas, then exports to PDF
- Professional formatting with company branding

**WhatsApp Integration**
- Message template generation in `client/src/lib/whatsappMessage.ts`
- Formats quotation details for WhatsApp sharing
- Includes package summary, accommodation, pricing, inclusions/exclusions

### Build & Deployment

**Development Mode**
- Vite dev server with HMR on client side
- tsx for running TypeScript server code directly
- Replit-specific plugins conditionally loaded in development
- API requests proxied through Vite dev server

**Production Build**
- Client: Vite builds to `dist/public` with code splitting and minification
- Server: esbuild bundles server code to `dist/index.cjs` with selective bundling
- Database migrations run via `drizzle-kit push` before build
- Build script in `script/build.ts` orchestrates both client and server builds

**Environment Variables**
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key
- `NODE_ENV`: Environment mode (development/production)
- Replit-specific variables for authentication (optional)

## External Dependencies

### Database
- **PostgreSQL**: Primary database using Neon serverless Postgres
- **Drizzle ORM**: Type-safe database queries and migrations
- **pg**: PostgreSQL client for Node.js connection pooling

### Authentication
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store (table: sessions)
- **Replit Auth**: Optional OAuth2 integration via openid-client and passport (conditionally enabled)

### UI Component Libraries
- **Radix UI**: Headless UI primitives (@radix-ui/react-*)
- **shadcn/ui**: Pre-built accessible components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Utilities
- **zod**: Runtime type validation for forms and API data
- **date-fns**: Date manipulation and formatting
- **clsx** + **tailwind-merge**: Conditional className utilities
- **nanoid**: Unique ID generation

### PDF & Document Generation
- **html2canvas**: HTML to canvas rendering
- **jsPDF**: Client-side PDF generation
- **dompdf** or **mPDF**: Server-side PDF options (referenced in requirements)

### Development Tools
- **TypeScript**: Type safety across full stack
- **Vite**: Fast build tool and dev server
- **esbuild**: Fast server bundling
- **tsx**: TypeScript execution for Node.js
- **Replit plugins**: Development tooling (@replit/vite-plugin-*)