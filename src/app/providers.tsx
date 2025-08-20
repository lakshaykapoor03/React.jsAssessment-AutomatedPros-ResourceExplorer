"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

type ProvidersProps = {
  children: ReactNode;
};

function useQueryClient(): QueryClient {
  const [client] = useState(() => {
    return new QueryClient({
      queryCache: new QueryCache(),
      mutationCache: new MutationCache(),
      defaultOptions: {
        queries: {
          staleTime: 1000 * 30,
          gcTime: 1000 * 60 * 10,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  });
  return client;
}

export function Providers({ children }: ProvidersProps) {
  const client = useQueryClient();
  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Simple theme toggler using a data-theme attribute on <html>
export function ThemeScript() {
  // Apply theme before hydration for no flash
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(() => { try { const t = localStorage.getItem('theme') || 'dark'; document.documentElement.dataset.theme = t; } catch {} })();`,
      }}
    />
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      if (stored) setTheme(stored);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      style={{
        padding: "6px 10px",
        borderRadius: 6,
        border: "1px solid var(--gray-300)",
        background: "var(--bg-elev)",
        color: "var(--fg)",
      }}
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
