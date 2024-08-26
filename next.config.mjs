/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['src/*'],
  },
  eslint: {
    dirs: ['src'],
  },
};

export default nextConfig;
