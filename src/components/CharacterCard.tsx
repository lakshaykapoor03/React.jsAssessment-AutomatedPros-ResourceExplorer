"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./CharacterCard.module.css";
import { FavoriteButton } from "./FavoriteButton";
import { StatusBadge } from "./StatusBadge";

type Props = {
  id: number;
  name: string;
  image: string;
  status: string;
  species: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onNavigate?: (id: number) => void;
};

export function CharacterCard({
  id,
  name,
  image,
  status,
  species,
  isFavorite,
  onToggleFavorite,
  onNavigate,
}: Props) {
  return (
    <div className={styles.card} data-row-id={id}>
      <Image
        src={image}
        alt={name}
        width={80}
        height={80}
        className={styles.avatar}
      />
      <div>
        <h3 className={styles.name}>
          <Link className={styles.link} href={`/characters/${id}`} scroll={false} onClick={() => onNavigate?.(id)}>
            {name}
          </Link>
        </h3>
        <p className={styles.meta}>
          <StatusBadge status={status} /> • {species}
        </p>
      </div>
      <div className={styles.right}>
        <FavoriteButton isActive={isFavorite} onToggle={onToggleFavorite} />
      </div>
    </div>
  );
}
