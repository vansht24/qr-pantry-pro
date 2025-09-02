# Overview

This is a full-stack inventory management system called "Pantry Pal" designed for Indian grocery stores. The application provides comprehensive features for managing products, billing, customers, and generating reports. It's built as a modern web application with a React frontend and Express.js backend, utilizing PostgreSQL for data persistence.

The system includes features like inventory tracking, low stock alerts, expiry date monitoring, QR code scanning, billing functionality, customer management, and business reporting. The application is specifically themed for Indian grocery stores with appropriate color schemes and cultural considerations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI components with shadcn/ui for accessible, customizable interface components
- **Styling**: Tailwind CSS with CSS custom properties for theming, featuring an Indian grocery store color palette (saffron orange, mint green, turmeric yellow)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: React Router for client-side navigation
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the entire stack
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Development**: Hot reloading with Vite integration for seamless development experience
- **Module System**: ES modules for modern JavaScript standards

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting for scalability
- **Schema Management**: Drizzle migrations with shared schema definitions between frontend and backend
- **Connection**: Connection pooling via Neon's serverless driver for optimal performance
- **Backup Storage**: In-memory storage implementation available as fallback during development

## Authentication and Authorization
- **Provider**: Supabase for user authentication and session management
- **Storage**: localStorage for session persistence with automatic token refresh
- **Security**: JWT-based authentication with secure token handling

## External Dependencies

### Database and ORM
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Drizzle ORM**: Type-safe database operations with excellent TypeScript integration
- **Drizzle Kit**: Database migration management and schema synchronization

### UI and Design System
- **Radix UI**: Comprehensive set of accessible React components
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Icon library for consistent iconography

### Authentication and Data Fetching
- **Supabase**: Backend-as-a-Service for authentication and real-time features
- **TanStack Query**: Powerful data synchronization for React applications

### Development and Build Tools
- **Vite**: Next-generation frontend build tool with HMR support
- **TypeScript**: Static type checking for improved code quality
- **ESBuild**: Fast JavaScript bundler for production builds

### Validation and Forms
- **Zod**: TypeScript-first schema validation library
- **React Hook Form**: Performant forms with easy validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Additional Libraries
- **date-fns**: Modern JavaScript date utility library
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Utility for conditionally joining classNames
- **cmdk**: Command palette component for enhanced user experience