import { describe, it, expect } from 'vitest';
import { createComicPrompt, type RepoInfo } from '../src/index.js';

describe('createComicPrompt', () => {
  it('creates prompt from repositories', () => {
    const repos: RepoInfo[] = [
      { name: 'repo1', description: 'first repo', stargazers_count: 100, language: 'TypeScript' },
      { name: 'repo2', description: 'second repo', stargazers_count: 50, language: 'JavaScript' },
    ];

    const prompt = createComicPrompt(repos, 'octocat');

    expect(prompt).toContain('octocat');
    expect(prompt).toContain('repo1');
    expect(prompt).toContain('first repo');
    expect(prompt).toContain('TypeScript');
    expect(prompt).toContain('4-panel comic strip');
  });

  it('handles repos without descriptions', () => {
    const repos: RepoInfo[] = [
      { name: 'repo1', description: null, stargazers_count: 10, language: 'Python' },
    ];

    const prompt = createComicPrompt(repos, 'testuser', 1);

    expect(prompt).toContain('No description');
    expect(prompt).toContain('repo1');
    expect(prompt).toContain('Python');
  });

  it('limits to specified repo count', () => {
    const repos: RepoInfo[] = [
      { name: 'repo1', description: 'first', stargazers_count: 100, language: 'TypeScript' },
      { name: 'repo2', description: 'second', stargazers_count: 50, language: 'JavaScript' },
      { name: 'repo3', description: 'third', stargazers_count: 25, language: 'Python' },
      { name: 'repo4', description: 'fourth', stargazers_count: 10, language: 'Go' },
    ];

    const prompt = createComicPrompt(repos, 'testuser', 2);

    expect(prompt).toContain('repo1');
    expect(prompt).toContain('repo2');
    expect(prompt).not.toContain('repo3');
    expect(prompt).not.toContain('repo4');
  });

  it('includes star counts when available', () => {
    const repos: RepoInfo[] = [
      { name: 'popular-repo', description: 'very popular', stargazers_count: 1000, language: 'Rust' },
    ];

    const prompt = createComicPrompt(repos, 'testuser', 1);

    expect(prompt).toContain('⭐ 1000');
  });

  it('handles empty repository array', () => {
    const repos: RepoInfo[] = [];

    const prompt = createComicPrompt(repos, 'testuser', 3);

    // Should still create a prompt, but with no repo details
    expect(prompt).toContain('testuser');
    expect(prompt).toContain('4-panel comic strip');
    // The repos section will be empty but the prompt structure remains
  });

  it('handles missing optional fields gracefully', () => {
    const repos: RepoInfo[] = [
      { name: 'minimal-repo', description: null, stargazers_count: undefined, language: null },
    ];

    const prompt = createComicPrompt(repos, 'testuser', 1);

    expect(prompt).toContain('minimal-repo');
    expect(prompt).toContain('No description');
    expect(prompt).not.toContain('⭐');
    expect(prompt).not.toContain('[');
  });

  describe('input validation', () => {
    it('throws error when repos is not an array', () => {
      expect(() => createComicPrompt(null as any, 'testuser', 3))
        .toThrow('repos must be an array');

      expect(() => createComicPrompt({} as any, 'testuser', 3))
        .toThrow('repos must be an array');

      expect(() => createComicPrompt('invalid' as any, 'testuser', 3))
        .toThrow('repos must be an array');
    });

    it('throws error when user is not a valid string', () => {
      const repos: RepoInfo[] = [{ name: 'repo', description: 'desc' }];

      expect(() => createComicPrompt(repos, '', 3))
        .toThrow('user must be a non-empty string');

      expect(() => createComicPrompt(repos, '   ', 3))
        .toThrow('user must be a non-empty string');

      expect(() => createComicPrompt(repos, null as any, 3))
        .toThrow('user must be a non-empty string');

      expect(() => createComicPrompt(repos, 123 as any, 3))
        .toThrow('user must be a non-empty string');
    });

    it('throws error when count is not a valid number', () => {
      const repos: RepoInfo[] = [{ name: 'repo', description: 'desc' }];

      expect(() => createComicPrompt(repos, 'testuser', 0))
        .toThrow('count must be a positive number');

      expect(() => createComicPrompt(repos, 'testuser', -1))
        .toThrow('count must be a positive number');

      expect(() => createComicPrompt(repos, 'testuser', NaN))
        .toThrow('count must be a positive number');

      expect(() => createComicPrompt(repos, 'testuser', 'invalid' as any))
        .toThrow('count must be a positive number');
    });

    it('throws error when repository is missing required name field', () => {
      const repos = [
        { description: 'has description' } as any,
      ];

      expect(() => createComicPrompt(repos, 'testuser', 1))
        .toThrow('Repository at index 0 is missing required field: name');
    });

    it('throws error when repository name is not a string', () => {
      const repos = [
        { name: 123, description: 'desc' } as any,
      ];

      expect(() => createComicPrompt(repos, 'testuser', 1))
        .toThrow('Repository at index 0 is missing required field: name');
    });
  });
});
