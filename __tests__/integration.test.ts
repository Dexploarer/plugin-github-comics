import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchRepositories, configSchema } from '../src/index.js';
import type { Response } from 'node-fetch';

// Mock node-fetch module
vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

// Import the mocked fetch after mocking
const { default: fetch } = await import('node-fetch');

describe('Integration: GitHub Comics CLI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('configSchema', () => {
    it('validates correct config', () => {
      const config = {
        AI_GATEWAY_API_KEY: 'test-token',
        GITHUB_TOKEN: 'github-token',
      };

      const result = configSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('validates config without optional GitHub token', () => {
      const config = {
        AI_GATEWAY_API_KEY: 'test-token',
      };

      const result = configSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('rejects config without required token', () => {
      const config = {
        GITHUB_TOKEN: 'github-token',
      };

      const result = configSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });

  describe('fetchRepositories', () => {
    it('fetches repositories successfully', async () => {
      const mockRepos = [
        { name: 'repo1', description: 'desc1', stargazers_count: 100, language: 'TypeScript' },
        { name: 'repo2', description: 'desc2', stargazers_count: 50, language: 'JavaScript' },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepos,
      } as unknown as Response);

      const result = await fetchRepositories('octocat');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('repo1');
      expect(result[0].description).toBe('desc1');
      expect(result[0].stargazers_count).toBe(100);
      expect(result[0].language).toBe('TypeScript');
    });

    it('includes authorization header when token provided', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ name: 'repo', description: 'desc' }],
      } as unknown as Response);

      await fetchRepositories('testuser', 'test-token');

      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/users/testuser/repos'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('throws error for invalid username', async () => {
      await expect(fetchRepositories('invalid@username'))
        .rejects.toThrow('Invalid GitHub username: invalid@username');
    });

    it('throws error when API request fails with 404', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as unknown as Response);

      await expect(fetchRepositories('nonexistent'))
        .rejects.toThrow('Failed to fetch repos for nonexistent: 404 User not found');
    });

    it('throws error when rate limited (403)', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as unknown as Response);

      await expect(fetchRepositories('ratelimited'))
        .rejects.toThrow('Failed to fetch repos for ratelimited: 403 API rate limit exceeded');
    });

    it('throws error for empty repository list', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as unknown as Response);

      await expect(fetchRepositories('emptyuser'))
        .rejects.toThrow("User 'emptyuser' has no public repositories");
    });

    it('throws error for non-array response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'invalid' }),
      } as unknown as Response);

      await expect(fetchRepositories('badresponse'))
        .rejects.toThrow('Invalid response from GitHub API');
    });
  });
});
