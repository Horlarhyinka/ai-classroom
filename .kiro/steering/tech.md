# Technology Stack

## Frontend (project/)
- **Framework**: Next.js 14 with App Router
- **Runtime**: React 18 with TypeScript
- **Build Tool**: Vite (hybrid setup with Next.js)
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives, Lucide React icons
- **State Management**: Zustand
- **Animations**: Framer Motion
- **File Handling**: React Dropzone, Formidable
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios
- **Document Processing**: Mammoth (DOCX), PDF-parse, Office Text Extractor, PDF.js
- **Authentication**: NextAuth.js
- **Notifications**: React Hot Toast
- **Markdown**: React Markdown
- **Routing**: React Router DOM

## Backend (server/)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Express Session with MongoDB store (connect-mongo)
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **AI Integration**: Google Generative AI
- **Voice Synthesis**: ElevenLabs
- **Real-time**: Socket.IO
- **Document Processing**: Office Text Extractor, PDF Thumbnail
- **Security**: JWT, CORS
- **Logging**: Jet Logger

## Development Tools
- **TypeScript**: Strict mode enabled for server, relaxed for frontend
- **Linting**: ESLint with Next.js config
- **Build Tools**: Next.js bundling, TypeScript compiler, Vite
- **Dev Server**: Nodemon with ts-node for server hot reload
- **Path Aliases**: `@/*` for frontend src directory

## Common Commands

### Frontend (project/)
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend (server/)
```bash
npm run start:dev    # Start development server with nodemon
npm run build        # Compile TypeScript to JavaScript (dist/)
npm run start        # Start production server from dist/
```

## Environment Configuration
- Frontend uses `.env` for environment variables
- Backend uses separate `development.env` and `production.env` files
- Session management with MongoDB store
- CORS configured for cross-origin requests
- TypeScript strict mode for backend, relaxed for frontend

## Key Dependencies
- **AI/ML**: @google/generative-ai, @elevenlabs/elevenlabs-js
- **File Processing**: mammoth, pdf-parse, office-text-extractor, file-type
- **UI/UX**: class-variance-authority, clsx, tailwind-merge, tailwindcss-animate
- **Real-time**: socket.io (both client and server)