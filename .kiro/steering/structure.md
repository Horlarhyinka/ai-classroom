# Project Structure

## Root Directory
```
ai-classroom/
├── project/          # Next.js frontend application
├── server/           # Express.js backend API
├── .kiro/           # Kiro AI assistant configuration
└── .vscode/         # VS Code workspace settings
```

## Frontend Structure (project/)
```
project/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/signin/       # Sign-in page and components
│   │   ├── classroom/[id]/    # Dynamic classroom routes
│   │   ├── documents/         # Document management page
│   │   ├── upload/            # File upload interface
│   │   ├── layout.tsx         # Root layout component
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable React components
│   │   ├── auth/              # Authentication components
│   │   └── ui/                # UI primitives and controls
│   ├── db/                    # Database connection/models (frontend)
│   │   └── models/            # Frontend data models
│   ├── lib/                   # Utility libraries
│   ├── public/                # Static assets (empty)
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Helper functions and hooks
│       └── hooks/             # Custom React hooks
├── uploads/                   # Local file uploads (development)
├── .next/                     # Next.js build output
└── node_modules/              # Dependencies
```

## Backend Structure (server/)
```
server/
├── src/
│   ├── config/                # Configuration files (DB, env vars)
│   ├── controllers/           # Route handlers (auth, documents, upload)
│   ├── lib/                   # Shared libraries (Gemini AI, upload utils)
│   ├── middlewares/           # Express middlewares (auth)
│   ├── models/                # Mongoose schemas (8 models)
│   ├── routers/               # Express route definitions
│   ├── services/              # Business logic services (6 services)
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Helper functions and utilities
│   └── index.ts               # Application entry point
├── dist/                      # Compiled JavaScript output
├── development.env            # Development environment variables
├── production.env             # Production environment variables
└── node_modules/              # Dependencies
```

## Key Architectural Patterns

### Frontend Conventions
- **App Router**: Next.js 14 app directory structure
- **Components**: Feature-based organization with auth/ and ui/ subdirectories
- **Styling**: Tailwind CSS with utility classes
- **State**: Zustand for global state, React hooks for local state
- **API Calls**: Centralized in lib/api.ts using Axios
- **Path Aliases**: `@/*` maps to `src/*` for clean imports

### Backend Conventions
- **MVC Pattern**: Controllers handle routes, services contain business logic
- **Middleware**: Authentication, CORS, session management
- **Models**: 8 Mongoose schemas (chapter, discussion, doc, message, persona, section, simulation, user, voice)
- **Services**: 6 specialized services (auth, cloudinary, persona, resource, socket, token, voice)
- **Configuration**: Environment-based config with separate dev/prod files

### File Naming
- **Components**: PascalCase (e.g., `DocumentCard.tsx`, `FileUploader.tsx`)
- **Pages**: Next.js convention - `page.tsx` in route folders
- **Utilities**: camelCase (e.g., `textToSpeech.ts`, `fetchWrapper.ts`)
- **Models**: lowercase (e.g., `user.ts`, `discussion.ts`)
- **Services**: camelCase (e.g., `cloudinary.ts`, `voice.ts`)

### Import Organization
1. External libraries (React, Next.js, etc.)
2. Internal utilities/services
3. Components
4. Types
5. Relative imports

### TypeScript Configuration
- **Frontend**: Relaxed strict mode, path aliases enabled
- **Backend**: Full strict mode, Node.js module resolution
- **Build**: Frontend uses Next.js, backend compiles to `dist/`