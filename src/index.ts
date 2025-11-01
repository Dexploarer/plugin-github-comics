import { z } from 'zod';
import fetch from 'node-fetch';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Configuration schema for the GitHub Comics tool
 */
export const configSchema = z.object({
  AI_GATEWAY_API_KEY: z.string().min(1, 'AI_GATEWAY_API_KEY is required'),
  GITHUB_TOKEN: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;

/**
 * Repository information from GitHub
 */
export interface RepoInfo {
  name: string;
  description: string | null;
  stargazers_count?: number;
  language?: string | null;
}

/**
 * Result from image generation
 */
export interface ImageResult {
  filePath: string;
  fileName: string;
}

/**
 * Fetches repositories for a GitHub user
 *
 * @param user - GitHub username
 * @param token - Optional GitHub personal access token for authentication
 * @returns Array of repository information
 * @throws Error if the GitHub API request fails
 */
export async function fetchRepositories(user: string, token?: string): Promise<RepoInfo[]> {
  // Validate GitHub username format
  const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  if (!USERNAME_REGEX.test(user)) {
    throw new Error(`Invalid GitHub username: ${user}`);
  }

  const url = `https://api.github.com/users/${user}/repos?sort=updated&per_page=30`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'github-comics-cli'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`Failed to fetch repos for ${user}: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as any[];

  if (!Array.isArray(data)) {
    throw new Error('Invalid response from GitHub API');
  }

  if (data.length === 0) {
    throw new Error(`User ${user} has no public repositories`);
  }

  return data.map((repo) => ({
    name: repo.name,
    description: repo.description,
    stargazers_count: repo.stargazers_count,
    language: repo.language,
  }));
}

/**
 * Creates a prompt for comic generation from repository information
 *
 * @param repos - Array of repository information
 * @param user - GitHub username
 * @param count - Number of top repositories to include (default: 3)
 * @returns Formatted prompt for image generation
 */
export function createComicPrompt(repos: RepoInfo[], user: string, count: number = 3): string {
  const topRepos = repos.slice(0, count);

  const repoDetails = topRepos.map((r, idx) => {
    const stars = r.stargazers_count ? ` (⭐ ${r.stargazers_count})` : '';
    const lang = r.language ? ` [${r.language}]` : '';
    return `${idx + 1}. ${r.name}${lang}${stars}: ${r.description ?? 'No description'}`;
  }).join('\n');

  return `Create a humorous 4-panel comic strip about GitHub user "${user}" and their coding projects.

Their top repositories:
${repoDetails}

Style: Comic book style, colorful, fun and playful. Each panel should tell part of the story about their coding journey. Make it lighthearted and encouraging.`;
}

/**
 * Generates a comic image using Gemini Flash 2.5 via Vercel AI Gateway
 *
 * @param prompt - Text prompt for image generation
 * @param apiKey - Vercel AI Gateway API token
 * @param outputDir - Directory to save the generated image (default: './output')
 * @returns Image result with file path and name
 * @throws Error if the image generation fails
 */
export async function generateComicImage(
  prompt: string,
  apiKey: string,
  outputDir: string = './output'
): Promise<ImageResult> {
  console.log('🎨 Generating comic with Gemini Flash 2.5 via AI Gateway...');

  try {
    // Set API key for AI Gateway
    process.env.AI_GATEWAY_API_KEY = apiKey;

    // Use Gemini model through AI Gateway
    const result = await generateText({
      model: google('gemini-2.5-flash-image-preview'),
      prompt: prompt,
    });

    // Check if any files were generated
    if (!result.files || result.files.length === 0) {
      throw new Error('No images were generated. Make sure you have credits and the model supports image generation.');
    }

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Save the first image
    const file = result.files[0];

    if (!file.mediaType.startsWith('image/')) {
      throw new Error(`Invalid file type: ${file.mediaType}`);
    }

    const extension = file.mediaType.split('/')[1] || 'png';
    const fileName = `github-comic-${Date.now()}.${extension}`;
    const filePath = path.join(outputDir, fileName);

    // Save using uint8Array directly
    await fs.writeFile(filePath, file.uint8Array);

    console.log(`✅ Comic generated successfully!`);
    console.log(`📁 Saved to: ${filePath}`);

    return {
      filePath,
      fileName,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate comic: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Main function to generate a GitHub comic
 *
 * @param user - GitHub username
 * @param config - Configuration with API keys
 * @param options - Optional parameters
 * @returns Image result with file path and name
 */
export async function generateGithubComic(
  user: string,
  config: Config,
  options: {
    repoCount?: number;
    outputDir?: string;
  } = {}
): Promise<ImageResult> {
  const { repoCount = 3, outputDir = './output' } = options;

  console.log(`🔍 Fetching repositories for ${user}...`);
  const repos = await fetchRepositories(user, config.GITHUB_TOKEN);
  console.log(`📦 Found ${repos.length} repositories`);

  console.log(`📝 Creating comic prompt...`);
  const prompt = createComicPrompt(repos, user, repoCount);

  const image = await generateComicImage(prompt, config.AI_GATEWAY_API_KEY, outputDir);

  return image;
}
