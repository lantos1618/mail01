# Mail-01 Migration Project

## Project Overview
Migrating Mail0 email client to use assistant-ui framework instead of current UI implementation.

## Key Information
- Original repo: https://github.com/Mail-0/Zero
- New name: mail-01
- Tech stack: React, TypeScript, Vite, tRPC, Drizzle ORM
- Current UI: Custom components with Radix UI primitives
- Target UI: assistant-ui framework

## Architecture Notes
- Frontend: React Router v7, TanStack Query, Tiptap editor
- Backend: Server with tRPC, Drizzle ORM
- Email providers: Google, Microsoft integration
- AI features: Compose assistance, chat, summaries

## Migration Strategy
1. Preserve backend functionality
2. Replace UI components with assistant-ui equivalents
3. Maintain email composition and thread management
4. Keep AI features integrated
5. Update branding to mail-01