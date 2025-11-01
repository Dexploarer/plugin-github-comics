# Changelog

## [2.0.2] - 2025-11-01

### 🛡️ Robustness & Validation Improvements

Second round of code review fixes focusing on input validation and error handling.

#### Input Validation
- **Added**: Comprehensive input validation in `createComicPrompt()`
  - Validates repos is an array
  - Validates user is a non-empty string
  - Validates count is a positive number
  - Validates repository name field is present and string
- **Improved**: Better error messages specify what was invalid

#### Error Handling
- **Improved**: Environment variable loading with contextual messages
  - Production: Uses system env vars (silent by default)
  - Development: Warns about missing .env with helpful message
  - Honors DEBUG flag for verbose output
- **Improved**: parseInt validation with immediate NaN check
  - Separate validation for invalid number vs out of range
  - Shows user what value was received in error

#### Testing
- **Added**: 5 comprehensive input validation tests (16 → 21 tests total)
  - Non-array repos parameter
  - Invalid user strings (empty, whitespace, null, number)
  - Invalid count values (0, negative, NaN, string)
  - Missing required field (name)
  - Invalid name type
- **Improved**: Mock typing strategy for better type safety
  - Removed unsafe `as unknown as Mock` casting
  - Use `vi.mocked()` for proper type inference
  - Better Response type usage
- **Standardized**: Error message assertions for consistency

#### Code Quality
- **Fixed**: Unsafe type casting in test mocks
- **Improved**: Mock strategy using `vi.mocked()` for type safety
- **Enhanced**: Error message consistency across tests

### 📊 Impact

- All 21 tests passing ✅ (+5 from v2.0.1)
- Better input validation prevents runtime errors
- More helpful error messages for users
- Safer test code with proper typing
- No breaking changes

---

## [2.0.1] - 2025-11-01

### 🐛 Bug Fixes & Code Quality Improvements

Based on automated code review feedback, this patch addresses several important issues:

#### Security & Best Practices
- **Fixed**: Removed global `process.env` mutation - API key now passed directly to model
- **Fixed**: Added URL encoding for GitHub usernames to prevent URL manipulation
- **Fixed**: Corrected environment variable name in CLI help text (AI_GATEWAY_API_KEY)

#### Error Handling
- **Improved**: More specific error messages based on HTTP status codes
  - 404: "User not found"
  - 403: "API rate limit exceeded. Use GITHUB_TOKEN for higher limits."
- **Improved**: Added finishReason to image generation errors for better debugging
- **Improved**: Better error context in all error messages
- **Added**: Environment variable loading error handling

#### Code Structure
- **Refactored**: Removed console.log from library functions (moved to CLI layer)
- **Improved**: Better separation of concerns between library and CLI
- **Fixed**: Library functions are now more reusable in different contexts

#### Testing
- **Added**: Test for empty repository array handling (16 tests total, up from 12)
- **Added**: Test for missing optional fields (stargazers_count, language)
- **Added**: Test for rate limit errors (403)
- **Added**: Test for non-array API responses
- **Improved**: More comprehensive error message validation in tests

### 📊 Impact

- All 16 tests passing ✅
- No breaking changes
- Better error messages for users
- More secure code
- More maintainable architecture

---

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
