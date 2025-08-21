"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFavorites } from "@/lib/favorites";
import { CharacterCard } from "@/components/CharacterCard";
import { useCharacters } from "@/lib/hooks";
import homeStyles from "./home.module.css";

const SEARCH_DEBOUNCE_MS = 350;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function HomeClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { ids: favoriteIds, isFavorite, toggle } = useFavorites();

  const qParam = params.get("q") ?? "";
  const pageParam = Math.max(1, Number(params.get("page")) || 1);
  const statusParam = params.get("status") ?? "";
  const speciesParam = params.get("species") ?? "";
  const sortParam = params.get("sort") ?? "name"; // name | id
  const showFavOnly = params.get("fav") === "1";

  const [q, setQ] = useState(qParam);
  const debouncedQ = useDebouncedValue(q, SEARCH_DEBOUNCE_MS);
  const lastAppliedQRef = useRef(qParam);

  const replaceParams = useCallback(
    (mutate: (usp: URLSearchParams) => void) => {
      const current = params.toString();
      const usp = new URLSearchParams(current);
      mutate(usp);
      const next = usp.toString();
      if (next === current) return;
      const href = next ? `/?${next}` : "/";
      router.replace(href);
    },
    [params, router]
  );

  useEffect(() => {
    if (debouncedQ === lastAppliedQRef.current) return;
    replaceParams((usp) => {
      if (debouncedQ) usp.set("q", debouncedQ);
      else usp.delete("q");
      usp.set("page", "1");
    });
    lastAppliedQRef.current = debouncedQ;
  }, [debouncedQ, replaceParams]);

  const query = useCharacters({
    page: pageParam,
    name: qParam || undefined,
    status: statusParam || undefined,
    species: speciesParam || undefined,
  });

  const results = useMemo(() => {
    const items = (query.data?.results ?? []).slice();
    const filtered = showFavOnly
      ? items.filter((c) => favoriteIds.has(c.id))
      : items;
    if (sortParam === "name")
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sortParam === "id") filtered.sort((a, b) => a.id - b.id);
    return filtered;
  }, [query.data, showFavOnly, favoriteIds, sortParam]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("list:viewstate");
      if (!raw) return;
      let parsed: { scrollY: number; focusedId?: number } | null = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
      if (!parsed) {
        sessionStorage.removeItem("list:viewstate");
        return;
      }
      const { scrollY, focusedId } = parsed;
      requestAnimationFrame(() => {
        if (typeof scrollY === "number") {
          window.scrollTo(0, scrollY);
        }
        if (focusedId) {
          const el = document.querySelector(`[data-row-id="${focusedId}"] a`);
          if (el && el instanceof HTMLElement) el.focus();
        }
        sessionStorage.removeItem("list:viewstate");
      });
    } catch {}
  }, [query.data]);

  const setParam = useCallback(
    (key: string, value?: string) => {
      replaceParams((usp) => {
        const oldPage = usp.get("page");
        if (value && value.length) usp.set(key, value);
        else usp.delete(key);
        if (key === "q" || key === "status" || key === "species") {
          usp.set("page", "1");
        } else if (!usp.get("page") && oldPage) {
          usp.set("page", oldPage);
        }
      });
    },
    [replaceParams]
  );

  const totalPages = query.data?.info?.pages ?? 1;

  useEffect(() => {
    try {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
        return () => {
          history.scrollRestoration = "auto";
        };
      }
    } catch {}
  }, []);

  return (
    <div className={homeStyles.container}>
      <section className={homeStyles.toolbar}>
        <input
          aria-label="Search by name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search characters..."
          className={homeStyles.control}
          style={{ minWidth: 240 }}
        />
        <select
          aria-label="Status filter"
          value={statusParam}
          onChange={(e) => setParam("status", e.target.value)}
          className={homeStyles.control}
        >
          <option value="">All statuses</option>
          <option value="alive">Alive</option>
          <option value="dead">Dead</option>
          <option value="unknown">Unknown</option>
        </select>
        <input
          aria-label="Species filter"
          placeholder="Species"
          value={speciesParam}
          onChange={(e) => setParam("species", e.target.value)}
          className={homeStyles.control}
          style={{ minWidth: 160 }}
        />
        <select
          aria-label="Sort"
          value={sortParam}
          onChange={(e) => setParam("sort", e.target.value)}
          className={homeStyles.control}
        >
          <option value="name">Sort: Name</option>
          <option value="id">Sort: ID</option>
        </select>
        <label className={homeStyles.checkbox}>
          <input
            type="checkbox"
            checked={showFavOnly}
            onChange={(e) =>
              setParam("fav", e.target.checked ? "1" : undefined)
            }
          />
          Favorites only
        </label>
      </section>

      {query.isLoading && (
        <div role="status" aria-live="polite" className={homeStyles.list}>
          {Array(20)
            .fill("")
            .map((_, i) => (
              <div key={i} className={homeStyles.skeleton} />
            ))}
        </div>
      )}

      {query.isError && (
        <div role="alert" className={homeStyles.errorBox}>
          <p style={{ marginBottom: 8 }}>Failed to load</p>
          <button
            onClick={() => {
              const usp = new URLSearchParams(params.toString());
              router.replace(`/?${usp.toString()}`);
            }}
            className={homeStyles.btn}
          >
            Retry
          </button>
        </div>
      )}

      {!query.isLoading && !query.isError && results.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          No results. Try changing search or filters.
        </p>
      )}

      <section className={homeStyles.list}>
        {results.map((c) => (
          <CharacterCard
            key={c.id}
            id={c.id}
            name={c.name}
            image={c.image}
            status={c.status}
            species={c.species}
            isFavorite={isFavorite(c.id)}
            onToggleFavorite={() => toggle(c.id)}
            onNavigate={(id) => {
              try {
                sessionStorage.setItem(
                  "list:viewstate",
                  JSON.stringify({ scrollY: window.scrollY, focusedId: id })
                );
              } catch {}
            }}
          />
        ))}
      </section>

      <nav aria-label="Pagination" className={homeStyles.pagination}>
        <button
          disabled={pageParam <= 1}
          onClick={() => setParam("page", String(pageParam - 1))}
          className={homeStyles.btn}
        >
          Previous
        </button>
        <span className={homeStyles.muted}>
          Page {pageParam} of {totalPages}
        </span>
        <button
          disabled={pageParam >= totalPages}
          onClick={() => setParam("page", String(pageParam + 1))}
          className={homeStyles.btn}
        >
          Next
        </button>
      </nav>
    </div>
  );
}