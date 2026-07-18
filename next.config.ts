import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages ? "/feedback-auditor" : undefined,
  trailingSlash: isGithubPages,
  images: {
    unoptimized: isGithubPages,
  },
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: isGithubPages ? "true" : "false",
  },
};

export default nextConfig;
