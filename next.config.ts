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
      {
        source: "/alerts",
        destination: "/dashboard/alerts",
        permanent: true,
      },
      {
        source: "/job-alerts",
        destination: "/dashboard/alerts",
        permanent: true,
      },
      {
        source: "/job-alert",
        destination: "/dashboard/alerts",
        permanent: true,
      },
      {
        source: "/profile",
        destination: "/dashboard/profile",
        permanent: true,
      },
      {
        source: "/wallet",
        destination: "/dashboard/wallet",
        permanent: true,
      },
      {
        source: "/applications",
        destination: "/dashboard/applications",
        permanent: true,
      },
      {
        source: "/my-applications",
        destination: "/dashboard/applications",
        permanent: true,
      },
      {
        source: "/saved-jobs",
        destination: "/dashboard/saved-jobs",
        permanent: true,
      },
      {
        source: "/saved",
        destination: "/dashboard/saved-jobs",
        permanent: true,
      },
      {
        source: "/orders",
        destination: "/dashboard/orders",
        permanent: true,
      },
      {
        source: "/my-orders",
        destination: "/dashboard/orders",
        permanent: true,
      },
      {
        source: "/referral",
        destination: "/dashboard/referral",
        permanent: true,
      },
      {
        source: "/settings",
        destination: "/dashboard/settings",
        permanent: true,
      },
      {
        source: "/job/:id",
        destination: "/jobs/:id",
        permanent: true,
      },
      {
        source: "/quiz/play/:path*",
        destination: "/quiz",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
