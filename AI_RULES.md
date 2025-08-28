# AI Development Rules for Templo de Kimbanda Dragão Negro Application

This document outlines the technical stack and guidelines for developing features within this application. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of our chosen technologies.

## 🚀 Tech Stack Overview

Our application is built on a modern, robust stack designed for performance and developer experience:

*   **Frontend Framework:** Next.js 13 (App Router) with React for building user interfaces.
*   **Language:** TypeScript for type safety and improved code quality.
*   **Styling:** Tailwind CSS for utility-first styling, ensuring responsive and consistent designs.
*   **UI Components:** shadcn/ui, built on Radix UI primitives, for accessible and customizable UI components.
*   **Backend & Database:** Supabase (PostgreSQL database, Authentication, Storage, Realtime) as our primary backend service.
*   **Form Management:** React Hook Form for efficient form handling and Zod for schema validation.
*   **Icons:** Lucide React for a comprehensive set of customizable SVG icons.
*   **Date Handling:** React DayPicker for interactive date selection and date-fns for date formatting and manipulation.
*   **Charting:** Recharts for building responsive data visualizations.
*   **Toast Notifications:** shadcn/ui's toast system for user feedback.

## 🛠️ Library Usage Guidelines

To maintain consistency and efficiency, please follow these specific guidelines for library usage:

*   **UI Components:**
    *   **Always** prioritize components from `shadcn/ui` (e.g., `Button`, `Card`, `Input`, `Select`, `Dialog`, `Tabs`, `Switch`, `Checkbox`).
    *   If a required component is not available in `shadcn/ui`, create a new, small, and focused component in `src/components/` using Tailwind CSS and, if appropriate, Radix UI primitives.
    *   **Never** modify existing `shadcn/ui` component files directly.
*   **Styling:**
    *   **Exclusively** use Tailwind CSS classes for all styling.
    *   Avoid custom CSS files or inline styles unless absolutely necessary for global overrides (e.g., `app/globals.css`).
    *   Use the `cn` utility function from `@/lib/utils` for conditionally combining Tailwind classes.
*   **Forms & Validation:**
    *   Use `react-hook-form` for managing form state, validation, and submission.
    *   Integrate `zod` with `@hookform/resolvers` for robust schema-based form validation.
*   **Icons:**
    *   All icons should be imported and used from the `lucide-react` library.
*   **Date & Time:**
    *   For interactive date input and selection, use `react-day-picker`.
    *   For formatting, parsing, and manipulating dates, use `date-fns`.
*   **Database Interactions:**
    *   Use the `supabaseBrowser` client from `@/lib/supabase-browser` for client-side data fetching and mutations.
    *   For server-side operations requiring elevated privileges (e.g., creating admin users, updating system settings), use the `supabaseAdmin` client from `@/lib/supabase-admin` within Next.js API routes.
    *   Utilize the custom service files in `lib/` (e.g., `lib/auth.ts`, `lib/entities-service.ts`, `lib/supabase-client.ts`, `lib/settings-service.ts`, `lib/supabase-diagnostics.ts`) for structured database interactions.
*   **Authentication:**
    *   All authentication logic (signup, login, logout, session management) should be handled through the `authService` in `lib/auth.ts` and `supabaseBrowser.auth`.
*   **API Routes:**
    *   Implement server-side logic, especially for sensitive operations or complex data processing, within Next.js API routes (`app/api/`).
*   **Toast Notifications:**
    *   For displaying toast messages to the user, use the `useToast` hook from `@/hooks/use-toast` and render the `<Toaster />` component from `@/components/ui/toaster`. **Do not use `sonner` directly.**
*   **Routing:**
    *   Leverage Next.js's file-system based routing (`app/` directory) for defining application routes. Use `next/link` for client-side navigation.
*   **State Management:**
    *   For local component state, use React's `useState` and `useReducer` hooks. For shared state, consider prop drilling or React Context API for simpler cases. Avoid external global state management libraries unless a clear need arises for complex, application-wide state.
*   **External Integrations (via API Routes):**
    *   PagSeguro, WhatsApp Evolution API, and Brevo (Email) integrations should primarily be handled via Next.js API routes (`app/api/`) to protect API keys and secrets. Client-side code should interact with these services through these API routes.