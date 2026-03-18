import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Softchain",
    short_name: "Softchain",
    description:
      "Softchain delivers software design and engineering, AI systems, IT infrastructure, and technology management for companies that need senior execution from scoping through long-term support.",
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
