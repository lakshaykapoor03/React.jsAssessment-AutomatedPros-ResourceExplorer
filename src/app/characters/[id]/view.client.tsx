"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/lib/favorites";
import { FavoriteButton } from "@/components/FavoriteButton";
import { StatusBadge } from "@/components/StatusBadge";
import { useCharacter } from "@/lib/hooks";

export default function CharacterDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { isFavorite, toggle } = useFavorites();
  const query = useCharacter(id);

  if (query.isLoading || !query.data) {
    return (
      <div
        style={{
          height: 180,
          borderRadius: 12,
          background: "var(--bg-elev)",
          border: "1px solid var(--gray-200)",
        }}
      />
    );
  }
  if (query.isError) {
    return (
      <div
        role="alert"
        style={{
          background: "#fee2e2",
          color: "#991b1b",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #fecaca",
        }}
      >
        <p style={{ marginBottom: 8 }}>Failed to load</p>
        <Link href="/" style={{ color: "var(--primary)" }}>
          Back
        </Link>
      </div>
    );
  }

  const c = query.data;
  return (
    <article style={{ display: "grid", gap: 12 }}>
      <button
        onClick={(e) => {
          e.preventDefault();
          try { sessionStorage.setItem("list:return", "1"); } catch {}
          router.back();
        }}
        style={{ background: "none", color: "var(--primary)", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
        aria-label="Back to list"
      >
        ← Back to list
      </button>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <Image
          src={c.image}
          alt={c.name}
          width={180}
          height={180}
          style={{ borderRadius: 12 }}
        />
        <div style={{ display: "grid", gap: 6 }}>
          <h2 style={{ margin: 0 }}>{c.name}</h2>
          <p style={{ color: "var(--muted)" }}>
            <StatusBadge status={c.status} /> • {c.species} • {c.gender}
          </p>
          <p>Origin: {c.origin?.name}</p>
          <p>Location: {c.location?.name}</p>
          <FavoriteButton
            isActive={isFavorite(c.id)}
            onToggle={() => toggle(c.id)}
          />
        </div>
      </div>
    </article>
  );
}
