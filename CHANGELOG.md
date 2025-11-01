# Changelog

## [2.0.0] - 2025-11-01

### 🎉 Major Rewrite - Standalone CLI Tool

Complete transformation from Eliza OS plugin to standalone CLI application.

### ✨ New Features

- **Standalone CLI Tool**: Converted from Eliza OS plugin to independent command-line application
- **Vercel AI Gateway Integration**: Uses Vercel's unified AI Gateway for API access
- **Gemini Flash 2.5**: Upgraded from OpenAI DALL-E to Google's Gemini Flash 2.5 Image model
- **Commander.js CLI**: Professional command-line interface with help, options, and setup commands
- **Enhanced Repository Analysis**: Includes star counts and programming languages
- **Improved Prompts**: Better comic generation prompts with more repository context
- **Local Image Saving**: Saves generated comics to local filesystem

### 🔄 Breaking Changes

- **No longer an Eliza OS plugin**: Complete architectural change
- **API Key Change**: Now uses `AI_GATEWAY_API_KEY` instead of `OPENAI_API_KEY`
- **New Dependencies**: Migrated to Vercel AI SDK and @ai-sdk/google
- **Configuration Format**: New config schema with different environment variables

### 🛠️ Technical Improvements

- **Better Error Handling**: Input validation for GitHub usernames
- **Improved Type Safety**: TypeScript throughout with Zod validation
- **Comprehensive Testing**: Updated tests for new architecture (12 tests passing)
- **JSDoc Documentation**: Complete API documentation
- **Modern Build Setup**: tsup for fast builds, ESM modules
- **Better Logging**: Detailed console output with emojis and formatting

### 📦 Dependencies

#### Added
- `@ai-sdk/google` ^1.0.10 - Google AI provider for Vercel AI SDK
- `ai` ^4.0.52 - Vercel AI SDK core
- `commander` ^12.1.0 - CLI framework
- `dotenv` ^16.4.5 - Environment variable management
- `@types/node` ^22.10.5 - Node.js type definitions

#### Removed
- `@elizaos/core` - No longer a plugin
- `@elizaos/plugin-local-ai` - Unused dependency
- `@elizaos/cli` - No longer needed

### 📝 Documentation

- **Comprehensive README**: Complete usage guide, setup instructions, troubleshooting
- **API Reference**: Detailed function documentation
- **Examples**: Multiple usage examples with different options
- **.env.example**: Template for environment variables
- **CHANGELOG**: This file!

### 🔧 Configuration

New environment variables:
- `AI_GATEWAY_API_KEY` (required) - Vercel AI Gateway API token
- `GITHUB_TOKEN` (optional) - GitHub personal access token

### 🎨 Image Generation

- Model: `google/gemini-2.5-flash-image-preview`
- Provider: Vercel AI Gateway
- Output: High-quality PNG/JPEG images
- Cost: ~$0.039 per image

### 🧪 Testing

- ✅ 12 tests passing
- Unit tests for prompt creation
- Integration tests for GitHub API and config validation
- Mock-based testing with Vitest

### 📊 Project Structure

```
plugin-github-comics/
├── src/
│   ├── index.ts          # Core library (203 lines)
│   └── cli.ts            # CLI interface (120 lines)
├── __tests__/            # Test suite
├── dist/                 # Compiled output
├── output/               # Generated comics (gitignored)
├── .env.example          # Environment template
└── README.md            # Complete documentation
```

---

## [1.0.3] - Previous

- Initial Eliza OS plugin version with OpenAI DALL-E
