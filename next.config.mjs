/** @type {import('next').NextConfig} */
const nextConfig = {
  // This project lives under a parent folder that has its own lockfile;
  // pin the tracing root to this project to silence the workspace-root warning.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
