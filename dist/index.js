// src/index.ts
import { z } from "zod";
import fetch from "node-fetch";
var configSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  GITHUB_TOKEN: z.string().optional()
});
async function fetchRepositories(user, token) {
  const url = `https://api.github.com/users/${user}/repos`;
  const headers = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch repos for ${user}: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.map((repo) => ({ name: repo.name, description: repo.description }));
}
function createComicPrompt(repos, user) {
  const top = repos.slice(0, 3).map((r) => `${r.name}: ${r.description ?? "No description"}`).join("\n");
  return `Create a four panel comic strip summarizing GitHub user ${user}'s repositories.
${top}`;
}
async function generateComicImage(prompt, apiKey) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model: "dall-e-3", prompt })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }
  const data = await res.json();
  return { url: data.data[0].url };
}
var generateComicAction = {
  name: "GITHUB_COMICS",
  similes: ["REPO_COMICS"],
  description: "Generate comic strip from GitHub repos",
  validate: async () => true,
  handler: async (_runtime, message, _state, options, callback) => {
    const user = options?.user || message.content.text?.trim();
    if (!user) throw new Error("GitHub user not specified");
    const { OPENAI_API_KEY, GITHUB_TOKEN } = config;
    const repos = await fetchRepositories(user, GITHUB_TOKEN);
    const prompt = createComicPrompt(repos, user);
    const image = await generateComicImage(prompt, OPENAI_API_KEY);
    const quip = `Wow ${user}, your code is... something else. Keep it up!`;
    const content = {
      text: `${quip}
${image.url}`
    };
    await callback(content);
    return content;
  },
  examples: []
};
var config;
var githubComicsPlugin = {
  name: "plugin-github-comics",
  description: "Turn GitHub repos into comic strips",
  config: {},
  async init(cfg) {
    config = await configSchema.parseAsync(cfg);
  },
  actions: [generateComicAction]
};
var index_default = githubComicsPlugin;
export {
  createComicPrompt,
  index_default as default,
  fetchRepositories,
  generateComicImage,
  githubComicsPlugin
};
//# sourceMappingURL=index.js.map