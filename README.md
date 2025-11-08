# MGX Clone - AI Development Platform

A full-stack web application clone of MetaGPTX platform with Supabase integration, built with Next.js 14, TypeScript, and Shadcn-ui.

## Features

- 🔐 **Authentication**: Email/password authentication with Supabase Auth
- 📁 **Project Management**: Create, view, and manage development projects
- 💬 **Real-time Chat**: Live messaging with real-time updates
- 🎨 **Modern UI**: Beautiful interface built with Shadcn-ui and Tailwind CSS
- 🔒 **Secure**: Row Level Security (RLS) policies for data protection
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI Components**: Shadcn-ui, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (Auth, Database, Realtime)
- **Database**: PostgreSQL (via Supabase)

## Prerequisites

- Node.js 18+ and pnpm
- A Supabase account and project

## Getting Started

### 1. Clone and Install

```bash
cd /workspace/shadcn-ui
pnpm install
```

### 2. Supabase Setup

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:

1. Create a Supabase project
2. Set up the database schema
3. Configure Row Level Security policies
4. Enable realtime for messages

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase project settings (Project Settings > API).

### 4. Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Build for Production

```bash
pnpm run build
pnpm run start
```

## Project Structure

```
shadcn-ui/
├── src/
│   └── app/
│       ├── (auth)/
│       │   └── login/
│       │       └── page.tsx          # Login page
│       ├── chat/
│       │   └── page.tsx              # Chat interface
│       ├── layout.tsx                # Root layout
│       ├── page.tsx                  # Homepage
│       └── globals.css               # Global styles
├── components/
│   ├── layout/
│   │   └── Header.tsx                # Navigation header
│   └── ui/                           # Shadcn-ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   └── server.ts                 # Server Supabase client
│   ├── store/
│   │   ├── auth-store.ts             # Auth state management
│   │   ├── project-store.ts          # Project state management
│   │   └── chat-store.ts             # Chat state management
│   └── utils.ts                      # Utility functions
├── types/
│   └── index.ts                      # TypeScript type definitions
├── middleware.ts                     # Auth middleware
└── SUPABASE_SETUP.md                 # Supabase setup guide
```

## Key Features Explained

### Authentication

- Email/password sign up and sign in
- Automatic session management
- Protected routes with middleware
- Persistent authentication state

### Project Management

- Create new projects with name and description
- View all your projects in a grid layout
- Projects are user-specific (RLS enforced)

### Real-time Chat

- Create multiple conversations
- Send and receive messages in real-time
- Messages are organized by conversation
- Auto-scroll to latest messages
- User and assistant message roles

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint

## Database Schema

### Tables

1. **projects**
   - id (UUID, PK)
   - user_id (UUID, FK to auth.users)
   - name (VARCHAR)
   - description (TEXT)
   - created_at, updated_at (TIMESTAMP)

2. **conversations**
   - id (UUID, PK)
   - user_id (UUID, FK to auth.users)
   - title (VARCHAR)
   - created_at, updated_at (TIMESTAMP)

3. **messages**
   - id (UUID, PK)
   - conversation_id (UUID, FK to conversations)
   - user_id (UUID, FK to auth.users)
   - content (TEXT)
   - role (VARCHAR: 'user' | 'assistant')
   - created_at (TIMESTAMP)

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure authentication with Supabase Auth
- Server-side session validation
- Protected API routes

## Troubleshooting

### Common Issues

1. **Supabase connection errors**: Verify your environment variables are correct
2. **Authentication not working**: Check that Email provider is enabled in Supabase
3. **Real-time not updating**: Ensure replication is enabled for the messages table
4. **Build errors**: Run `pnpm install` to ensure all dependencies are installed

### Getting Help

- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions
- Review Supabase documentation: https://supabase.com/docs
- Check Next.js documentation: https://nextjs.org/docs

## Future Enhancements

- [ ] OAuth providers (Google, GitHub)
- [ ] File upload and storage
- [ ] Message editing and deletion
- [ ] Multi-user conversations
- [ ] Project collaboration features
- [ ] AI assistant integration
- [ ] Message search functionality
- [ ] Dark mode toggle

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.