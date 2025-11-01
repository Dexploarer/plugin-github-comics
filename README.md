# GitHub Comics CLI

Generate humorous comic strips from GitHub repositories using **Gemini Flash 2.5** via **Vercel AI Gateway**.

This standalone CLI tool fetches a user's GitHub repositories and creates a fun 4-panel comic strip about their coding journey using Google's latest multimodal AI model.

## Features

- 🎨 **AI-Powered Comics** - Uses Gemini Flash 2.5 for image generation
- 🚀 **Vercel AI Gateway** - Unified API access with built-in rate limiting and caching
- 📊 **Repository Analysis** - Analyzes top repositories with stars and language info
- 🎯 **Customizable** - Choose how many repos to feature (1-10)
- 💾 **Local Output** - Saves generated comics as high-quality images

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd plugin-github-comics

# Install dependencies
npm install

# Build the project
npm run build
```

## Setup

### 1. Get Your Vercel AI Gateway Token

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings → AI Gateway**
3. Create a new API token
4. Copy the token

### 2. (Optional) Get GitHub Personal Access Token

Only needed if you want to access private repositories:

1. Visit [GitHub Token Settings](https://github.com/settings/tokens)
2. Generate a new token with `repo` scope
3. Copy the token

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your tokens:

```env
AI_GATEWAY_API_KEY=your_vercel_token_here
GITHUB_TOKEN=your_github_token_here  # optional
```

## Usage

### Basic Usage

Generate a comic for any GitHub user:

```bash
npm start generate <username>
```

Example:
```bash
npm start generate torvalds
```

### Command-Line Options

```bash
npm start generate <username> [options]

Options:
  -t, --token <token>      GitHub personal access token
  -a, --api-key <key>      Vercel AI Gateway API token
  -c, --count <number>     Number of top repositories to include (default: 3)
  -o, --output <dir>       Output directory for images (default: ./output)
  -h, --help              Display help
```

### Examples

**Generate comic with top 5 repos:**
```bash
npm start generate octocat --count 5
```

**Use custom output directory:**
```bash
npm start generate octocat --output ./my-comics
```

**Provide API key via command line:**
```bash
npm start generate octocat --api-key your_token_here
```

### Using as a Global Command

After installation, you can install it globally:

```bash
npm install -g .
```

Then use it anywhere:

```bash
github-comics generate octocat
github-comics setup
```

## How It Works

1. **Fetch Repositories** - Retrieves user's repositories from GitHub API
2. **Analyze Top Repos** - Sorts by update time and extracts top N repositories
3. **Generate Prompt** - Creates a detailed prompt with repo info (name, language, stars, description)
4. **AI Generation** - Sends prompt to Gemini Flash 2.5 via Vercel AI Gateway
5. **Save Image** - Downloads and saves the generated comic strip

## Architecture

### Vercel AI Gateway

This tool uses Vercel's AI Gateway, which provides:

- ✅ **Unified API** - Single endpoint for multiple AI providers
- ✅ **No Markup Pricing** - Pay list price with 0% markup
- ✅ **Built-in Caching** - Automatic response caching
- ✅ **Rate Limiting** - Smart rate limit handling
- ✅ **Fallback Support** - Automatic failover between providers
- ✅ **Usage Analytics** - Built-in monitoring and metrics

### Gemini Flash 2.5 Image

Features of Google's latest multimodal model:

- 🎨 High-quality image generation
- 🖼️ 4-panel comic strip support
- 🌍 Culturally aware outputs
- ⚡ Fast generation times
- 💰 Cost-effective ($0.039 per image)

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_GATEWAY_API_KEY` | Yes | Vercel AI Gateway API token |
| `GITHUB_TOKEN` | No | GitHub personal access token (for private repos) |

### Output

Generated comics are saved to the `./output` directory by default (configurable via `-o` flag).

File naming format: `github-comic-{timestamp}.{ext}`

## Troubleshooting

### Error: "AI_GATEWAY_API_KEY is required"

Make sure you have set the `AI_GATEWAY_API_KEY` in your `.env` file or pass it via `--api-key` flag.

### Error: "Failed to fetch repos"

- Check that the GitHub username is correct
- If accessing private repos, ensure `GITHUB_TOKEN` is set
- Check your internet connection

### Error: "No images were generated"

- Verify your Vercel AI Gateway token is valid
- Check that you have available credits/quota
- Try with a simpler prompt

### Rate Limiting

GitHub API has rate limits:
- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour

Use a `GITHUB_TOKEN` for higher limits.

## Project Structure

```
plugin-github-comics/
├── src/
│   ├── index.ts          # Core library functions
│   └── cli.ts            # CLI interface
├── dist/                 # Compiled output
├── output/               # Generated comics
├── .env                  # Environment variables (gitignored)
├── .env.example          # Example environment file
├── package.json          # Project metadata
├── tsconfig.json         # TypeScript config
└── README.md            # This file
```

## Tech Stack

- **TypeScript** - Type-safe development
- **Vercel AI SDK** - AI Gateway integration
- **Gemini Flash 2.5** - Image generation model
- **Commander.js** - CLI framework
- **Node-Fetch** - GitHub API requests
- **Zod** - Runtime validation

## API Reference

### `fetchRepositories(user, token?)`

Fetches repositories for a GitHub user.

**Parameters:**
- `user` (string) - GitHub username
- `token` (string, optional) - GitHub personal access token

**Returns:** `Promise<RepoInfo[]>`

### `createComicPrompt(repos, user, count?)`

Creates a prompt for comic generation.

**Parameters:**
- `repos` (RepoInfo[]) - Array of repository information
- `user` (string) - GitHub username
- `count` (number, optional) - Number of repos to include (default: 3)

**Returns:** `string` - Formatted prompt

### `generateComicImage(prompt, apiKey, outputDir?)`

Generates comic using Gemini via AI Gateway.

**Parameters:**
- `prompt` (string) - Text prompt for image generation
- `apiKey` (string) - Vercel AI Gateway token
- `outputDir` (string, optional) - Output directory (default: './output')

**Returns:** `Promise<ImageResult>` - File path and name

### `generateGithubComic(user, config, options?)`

Main function that orchestrates the entire process.

**Parameters:**
- `user` (string) - GitHub username
- `config` (Config) - Configuration object
- `options` (object, optional) - Additional options

**Returns:** `Promise<ImageResult>`

## Credits

- **Google Gemini** - Image generation model
- **Vercel** - AI Gateway infrastructure
- **GitHub** - Repository data

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ using Gemini Flash 2.5 via Vercel AI Gateway
