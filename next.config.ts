import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    /**
     * A static export has no image server, so `next/image` gets a custom
     * loader that points each srcset entry at one of the two files the build
     * already produced. See lib/image-loader.ts.
     */
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    /**
     * Exactly the two widths that exist on disk. Anything else would generate
     * srcset entries claiming a size no file actually has — the default
     * `imageSizes` would advertise the 800px file as 384w, which is untrue.
     */
    deviceSizes: [800, 1920],
    imageSizes: [800],
    formats: ["image/webp"],
  },
};

export default nextConfig;
