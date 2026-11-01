import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/applied",
        destination: "/dashboard/applications",
        permanent: true,
      },
      {
        source: "/dashboard/saved",
        destination: "/dashboard/saved-jobs",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
