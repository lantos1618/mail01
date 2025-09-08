# Mail-01

AI-powered email client built with assistant-ui - a next-generation email experience with conversational interface.

## Features

- **AI-Powered Assistant**: Natural language email management through chat interface
- **Smart Compose**: AI-assisted email writing and replies
- **Email Organization**: Intelligent categorization and filtering
- **Thread Summarization**: Quick summaries of long email threads
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Multi-Account Support**: Manage multiple email accounts in one place

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI**: assistant-ui, Vercel AI SDK, OpenAI
- **Backend**: Hono, SQLite, Drizzle ORM
- **Email**: SendGrid API
- **Build**: Turbo, pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- SendGrid API key (optional, for sending emails)
- OpenAI API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/lantos1618/mail01.git
cd mail01

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Development

```bash
# Run both frontend and backend
pnpm dev

# Run specific apps
pnpm --filter @mail-01/web dev    # Frontend only
pnpm --filter @mail-01/api dev    # Backend only
```

### Build

```bash
pnpm build
```

## Project Structure

```
mail-01/
├── apps/
│   ├── web/          # Next.js frontend with assistant-ui
│   └── api/          # Hono backend API
├── packages/         # Shared packages
│   ├── ui/          # Shared UI components
│   ├── email-core/  # Email handling logic
│   └── ai-engine/   # AI processing
└── .agent/          # Agent data and local storage
    └── inbox/       # Email storage
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Database
DATABASE_URL=file:./.agent/mail01.db
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Built with [assistant-ui](https://www.assistant-ui.com/)
- Original inspiration from [Mail-0/Zero](https://github.com/Mail-0/Zero)