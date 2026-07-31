"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    function register() {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(() => navigator.serviceWorker.ready)
        .then((registration) => {
          document.documentElement.dataset.pwaReady = "true";
          document.documentElement.dataset.pwaState =
            registration.active?.state ?? "registered";
        })
        .catch(() => {
          document.documentElement.dataset.pwaReady = "false";
          document.documentElement.dataset.pwaState = "error";
        });
    }

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
