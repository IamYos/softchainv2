"use client";

import { useEffect } from "react";

const ROUTES_TO_WARM = [
  "/",
  "/about",
  "/solutions",
  "/insights",
];

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (cancelled) return;

        const warmCache = () => {
          const controller =
            navigator.serviceWorker.controller ?? registration.active;
          controller?.postMessage({
            type: "PREFETCH_ROUTES",
            routes: ROUTES_TO_WARM,
          });
        };

        if (navigator.serviceWorker.controller) {
          warmCache();
        } else {
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (!cancelled) warmCache();
          });
        }
      } catch {
        // registration failed — page still works normally
      }
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
