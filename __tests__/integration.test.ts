import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { fetchRepositories, configSchema } from '../src/index.js';
import fetch from 'node-fetch';

vi.mock('node-fetch');

const mockedFetch = fetch as unknown as Mock;

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

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepos,
      } as any);

      const result = await fetchRepositories('octocat');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('repo1');
      expect(result[0].description).toBe('desc1');
      expect(result[0].stargazers_count).toBe(100);
      expect(result[0].language).toBe('TypeScript');
    });

    it('includes authorization header when token provided', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ name: 'repo', description: 'desc' }],
      } as any);

      await fetchRepositories('testuser', 'test-token');

      expect(mockedFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/testuser/repos'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('throws error for invalid username', async () => {
      await expect(fetchRepositories('invalid@username')).rejects.toThrow('Invalid GitHub username');
    });

    it('throws error when API request fails', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as any);

      await expect(fetchRepositories('nonexistent')).rejects.toThrow('Failed to fetch repos');
    });

    it('throws error for empty repository list', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as any);

      await expect(fetchRepositories('emptyuser')).rejects.toThrow('no public repositories');
    });
  });
});
