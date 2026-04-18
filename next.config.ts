import type { NextConfig } from "next";

const ADMIN_SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
];

const GLOBAL_SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: ADMIN_SECURITY_HEADERS,
      },
      {
        source: "/api/admin/:path*",
        headers: ADMIN_SECURITY_HEADERS,
      },
      {
        source: "/:path*",
        headers: GLOBAL_SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
