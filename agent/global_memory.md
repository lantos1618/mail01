# Mail-01 Global Memory

## Project Overview
- **Name**: Mail-01 (Next-Gen AI Email Client)
- **Based On**: Mail-0/Zero enhanced with assistant-ui
- **UI Framework**: assistant-ui for conversational email interface
- **Key Innovation**: Deep AI integration with streaming, tools, and agents

## Environment
- **SendGrid API**: Available in env
- **Email Config**:
  - From: agent@lambda.run
  - To: l.leong1618@gmail.com
  - Subject Pattern: ralph-mail01-[topic]

## Key Architectural Decisions
1. **assistant-ui Thread** for email conversations (superior UX)
2. **AI-first** approach - every action enhanced by AI
3. **Local + Cloud** hybrid storage strategy
4. **Monorepo** with turbo for optimal DX
5. **Tool UI** for direct email actions from chat
6. **Email Agents** for autonomous email handling

## Enhanced AI Features (Beyond Mail-0)
1. **Smart Compose**: Real-time streaming suggestions
2. **Thread Intelligence**: Instant summaries with context
3. **Email Agents**: Autonomous responders with rules
4. **Voice-to-Email**: Dictation with AI enhancement
5. **Relationship Insights**: Communication pattern analysis
6. **Smart Templates**: Learn user's writing style
7. **Multi-Modal**: Handle images and attachments intelligently

## Technical Constraints
- KISS principle with elegant solutions
- DRY code patterns throughout
- Frequent git commits (every feature)
- 80% implementation, 20% testing ratio
- Target 40% context window (100-140k tokens)

## Implementation Progress
✅ Phase 1-5 Complete:
- Full assistant-ui integration with cutting-edge features
- Cloud persistence with real-time sync
- Tool UI for direct email actions
- Assistant Frame API for cross-iframe sharing
- Generative UI components
- Enhanced streaming assistant
- Voice email composer
- Collaborative editing
- Smart search with NLP
- Email scheduling with timezone optimization
- Comprehensive test coverage

## Latest Enhancements (2025-09-09)
✅ Cutting-Edge assistant-ui Integration:
- **Enhanced Runtime**: Advanced email tools with rich UI components
- **Real-time Streaming**: WebSocket-based email updates with AI processing
- **Multi-Modal Support**: Process images, PDFs, and attachments with AI
- **Intelligent Categorization**: ML-style pattern matching with learning
- **Relationship Analytics**: Network graphs and communication insights
- **Pattern Learning**: AI adapts to user's writing style
- **Email Automation**: Smart workflows with AI-driven rules

## Key Innovations Over Mail-0
1. **Zero-Config AI**: Works immediately
2. **Conversational Control**: Natural language for everything
3. **Streaming Everything**: Instant feedback
4. **Privacy + Power**: Self-hosted with cloud AI
5. **Enterprise Ready**: Scales to 100K+ emails