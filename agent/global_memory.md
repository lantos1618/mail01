# Mail-01 Global Memory

## Project Overview
- **Name**: Mail-01 (Enhanced AI Email Client)
- **Based On**: Mail-0/Zero architecture
- **UI Framework**: assistant-ui for chat-like email interface
- **Key Innovation**: Heavy AI integration for email intelligence

## Environment
- **SendGrid API**: Available in env
- **Email Config**:
  - From: agent@lambda.run
  - To: l.leong1618@gmail.com
  - Subject Pattern: ralph-mail01-[topic]

## Key Decisions
1. Using assistant-ui for email threads (chat-like interface)
2. AI-first approach for all email operations
3. Local storage in agent/inbox/ for email persistence
4. Monorepo structure with apps/api and apps/web

## AI Features Priority
1. Smart compose with context
2. Email summarization
3. Response suggestions
4. Priority detection
5. Meeting/task extraction

## Technical Constraints
- Keep it simple (KISS principle)
- DRY code patterns
- Frequent git commits
- 80% implementation, 20% testing
- Target 40% context window usage

## Current Status
- Existing basic structure in place
- Need to enhance with assistant-ui
- SendGrid integration pending
- AI features to be implemented