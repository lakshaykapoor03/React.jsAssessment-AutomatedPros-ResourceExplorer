"use client";

import { useEffect, useState } from "react";

type Props = {
  isActive: boolean;
  onToggle: () => void;
  ariaLabel?: string;
};

export function FavoriteButton({ isActive, onToggle, ariaLabel }: Props) {
  const [optimistic, setOptimistic] = useState<boolean>(isActive);

  useEffect(() => {
    setOptimistic(isActive);
  }, [isActive]);

  return (
    <button
      aria-label={
        ariaLabel ?? (optimistic ? "Remove from favorites" : "Add to favorites")
      }
      onClick={() => {
        setOptimistic(!optimistic);
        onToggle();
      }}
      className="favBtn"
      style={{
        border: "1px solid var(--gray-300)",
        background: "var(--bg)",
        borderRadius: 8,
        padding: "6px 10px",
      }}
    >
      {optimistic ? "★ Favorited" : "☆ Favorite"}
    </button>
  );
}
