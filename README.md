# Mail-01

AI-powered email client built with assistant-ui - a next-generation email experience with conversational interface.

## Features

- **AI-Powered Assistant**: Natural language email management through chat interface
- **Smart Compose**: AI-assisted email writing and replies
- **Email Organization**: Intelligent categorization and filtering
- **Thread Summarization**: Quick summaries of long email threads
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Multi-Provider Support**: SendGrid, Gmail (OAuth2 & App Password), Local fallback

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI**: assistant-ui, Vercel AI SDK, OpenAI
- **Email Providers**: SendGrid, Gmail, Local Storage
- **Build**: Turbo, pnpm

## Getting Started

### Quick Start (No Configuration Required!)

```bash
# Clone and install
git clone https://github.com/lantos1618/mail01.git
cd mail01
pnpm install

# Run immediately - emails save locally
pnpm dev

# Open http://localhost:3000
```

### Email Provider Setup (Choose One)

#### Option 1: SendGrid (Recommended for Production)
```bash
# Get API key from sendgrid.com
export SENDGRID_API_KEY=your-api-key

# Restart the app
pnpm dev
```

#### Option 2: Gmail OAuth2 (Most Secure)
1. Visit http://localhost:3000/setup
2. Click "Set Up Gmail OAuth2"
3. Authorize Mail-01
4. Done - tokens saved automatically

#### Option 3: Gmail App Password (Quick Setup)
```bash
# Enable 2FA on Google account, then generate app password
export GMAIL_USER=your-email@gmail.com
export GMAIL_APP_PASSWORD=16-character-password

# Restart the app
pnpm dev
```

#### Option 4: Local Development (Default)
No setup needed! Emails automatically save to `agent/inbox/sent/`

### Installation

```bash
# Clone the repository
git clone https://github.com/lantos1618/mail01.git
cd mail01

# Install dependencies
pnpm install

# Optional: Set up environment variables for email providers
# The app works without any configuration!
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