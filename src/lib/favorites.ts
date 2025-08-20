"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "favorites:characters";

export function readFavoriteIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function writeFavoriteIds(ids: Set<number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

export function useFavorites() {
  const [ids, setIds] = useState<Set<number>>(() => readFavoriteIds());

  useEffect(() => {
    setIds(readFavoriteIds());
  }, []);

  useEffect(() => {
    writeFavoriteIds(ids);
  }, [ids]);

  const isFavorite = (id: number) => ids.has(id);
  const toggle = (id: number) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return { ids, isFavorite, toggle } as const;
}
