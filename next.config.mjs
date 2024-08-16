/** @type {import('next').NextConfig} */
const nextConfig = {
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["./src/components/*"],
      "@modules/*": ["./src/modules/*"],
      "@utils/*": ["./src/utils/*"],
      "@/*": ["./src/*"],
    }
  },
  sassOptions: {
    includePaths: ['src/*'],
  },
};

export default nextConfig;
