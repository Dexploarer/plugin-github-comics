#!/usr/bin/env node

import { Command } from 'commander';
import { config as loadEnv } from 'dotenv';
import { generateGithubComic, configSchema } from './index.js';

// Load environment variables with error handling
const envResult = loadEnv();
if (envResult.error) {
  // Log warning if .env file is missing or malformed
  // This is informational only - users can provide env vars via CLI flags
  const isProduction = process.env.NODE_ENV === 'production';
  const message = `Info: No .env file found. ${isProduction ? 'Using system environment variables.' : 'You can create one or use --api-key flag.'}`;

  // In production, we expect env vars to be set via system, so just note it
  // In development, it's helpful to know .env is missing
  if (!isProduction || process.env.DEBUG) {
    console.warn(`⚠️  ${message}`);
  }
}

const program = new Command();

program
  .name('github-comics')
  .description('Generate comic strips from GitHub repositories using Gemini Flash 2.5 via Vercel AI Gateway')
  .version('2.0.2');

program
  .command('generate')
  .description('Generate a comic from a GitHub user\'s repositories')
  .argument('<username>', 'GitHub username')
  .option('-t, --token <token>', 'GitHub personal access token (or set GITHUB_TOKEN env var)')
  .option('-a, --api-key <key>', 'Vercel AI Gateway API token (or set AI_GATEWAY_API_KEY env var)')
  .option('-c, --count <number>', 'Number of top repositories to include (default: 3)', '3')
  .option('-o, --output <dir>', 'Output directory for generated images (default: ./output)', './output')
  .action(async (username: string, options: any) => {
    try {
      // Get API key from option or environment
      const apiKey = options.apiKey || process.env.AI_GATEWAY_API_KEY;
      const githubToken = options.token || process.env.GITHUB_TOKEN;

      if (!apiKey) {
        console.error('❌ Error: Vercel AI Gateway API token is required');
        console.error('   Provide it via --api-key flag or AI_GATEWAY_API_KEY environment variable');
        console.error('');
        console.error('   Get your API key at: https://vercel.com/dashboard');
        process.exit(1);
      }

      // Validate config
      const config = configSchema.parse({
        AI_GATEWAY_API_KEY: apiKey,
        GITHUB_TOKEN: githubToken,
      });

      // Validate and parse repository count
      const repoCount = parseInt(options.count, 10);
      // Check for NaN immediately after parsing to catch invalid inputs
      if (isNaN(repoCount)) {
        console.error('❌ Error: Repository count must be a valid number');
        console.error(`   Received: "${options.count}"`);
        process.exit(1);
      }
      if (repoCount < 1 || repoCount > 10) {
        console.error('❌ Error: Repository count must be between 1 and 10');
        console.error(`   Received: ${repoCount}`);
        process.exit(1);
      }

      console.log('');
      console.log('🎨 GitHub Comics Generator');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`👤 User: ${username}`);
      console.log(`📊 Repositories: Top ${repoCount}`);
      console.log(`📁 Output: ${options.output}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');

      console.log(`🔍 Fetching repositories for ${username}...`);
      const result = await generateGithubComic(username, config, {
        repoCount,
        outputDir: options.output,
      });

      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 Success!');
      console.log(`📄 File: ${result.fileName}`);
      console.log(`📂 Path: ${result.filePath}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    } catch (error) {
      console.error('');
      console.error('❌ Error:', error instanceof Error ? error.message : String(error));
      console.error('');
      process.exit(1);
    }
  });

program
  .command('setup')
  .description('Show setup instructions')
  .action(() => {
    console.log('');
    console.log('🔧 GitHub Comics CLI Setup');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('1️⃣  Get Vercel AI Gateway API Token:');
    console.log('   Visit: https://vercel.com/dashboard');
    console.log('   Navigate to: Settings → AI Gateway');
    console.log('   Create a new API token');
    console.log('');
    console.log('2️⃣  (Optional) Get GitHub Personal Access Token:');
    console.log('   Visit: https://github.com/settings/tokens');
    console.log('   Generate a new token with "repo" scope');
    console.log('   This is only needed for private repositories');
    console.log('');
    console.log('3️⃣  Set Environment Variables:');
    console.log('   Create a .env file in your project:');
    console.log('');
    console.log('   AI_GATEWAY_API_KEY=your_vercel_token_here');
    console.log('   GITHUB_TOKEN=your_github_token_here  # optional');
    console.log('');
    console.log('4️⃣  Run the tool:');
    console.log('   npm start generate <username>');
    console.log('   or');
    console.log('   github-comics generate <username>');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  });

// Show help if no arguments provided
if (process.argv.length === 2) {
  program.outputHelp();
  process.exit(0);
}

program.parse();
