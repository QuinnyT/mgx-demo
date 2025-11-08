# MGX Clone Implementation TODO

## MVP Implementation Plan

Based on the system design document, this is a simplified MVP version focusing on:
- User authentication (email/password only)
- Basic project listing on homepage
- Simple chat interface with real-time messaging
- Clean navigation with Header component

## Files to Create/Modify

### 1. Configuration & Setup Files
- [x] Template initialized with shadcn-ui
- [ ] `.env.local` - Supabase environment variables (user needs to configure)
- [ ] `next.config.js` - Next.js configuration for images and API

### 2. Type Definitions (types/)
- [ ] `types/index.ts` - All TypeScript interfaces (User, Project, Message, Conversation)

### 3. Supabase Client Layer (lib/supabase/)
- [ ] `lib/supabase/client.ts` - Browser-side Supabase client
- [ ] `lib/supabase/server.ts` - Server-side Supabase client

### 4. Utilities (lib/utils/)
- [x] `lib/utils.ts` - Already exists with cn() function

### 5. State Management (lib/store/)
- [ ] `lib/store/auth-store.ts` - Authentication state with Zustand
- [ ] `lib/store/project-store.ts` - Project management state
- [ ] `lib/store/chat-store.ts` - Chat and messaging state

### 6. Layout Components (components/layout/)
- [ ] `components/layout/Header.tsx` - Top navigation bar with auth status

### 7. App Pages (src/app/)
- [ ] `src/app/layout.tsx` - Root layout with providers
- [ ] `src/app/page.tsx` - Homepage with project list
- [ ] `src/app/(auth)/login/page.tsx` - Login page
- [ ] `src/app/chat/page.tsx` - Chat interface page

### 8. Middleware
- [ ] `middleware.ts` - Auth middleware for protected routes

### 9. Documentation
- [ ] `README.md` - Update with Supabase setup instructions
- [ ] `SUPABASE_SETUP.md` - Database schema and RLS policies

## Implementation Order

1. Setup type definitions
2. Create Supabase client configurations
3. Implement state management stores
4. Build Header component
5. Create authentication pages (login)
6. Build homepage with project list
7. Implement chat page with real-time messaging
8. Add middleware for route protection
9. Update documentation

## Key Features

### Authentication
- Email/password login
- Session management
- Protected routes
- Logout functionality

### Homepage
- Display user's projects
- Create new project button
- Navigation to chat

### Chat Page
- List of conversations
- Real-time message display
- Send messages
- Auto-scroll to latest message

## Simplifications for MVP
- No OAuth providers (Google/GitHub)
- No file upload
- No message editing/deletion
- No multi-user chat
- No project collaboration features
- Simple pagination (load all messages)