"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchCharacter, fetchCharacters } from "./api";
import type { CharactersResponse, Character } from "./api";

export function useCharacters(params: {
  page?: number;
  name?: string;
  status?: string;
  species?: string;
}) {
  return useQuery<CharactersResponse>({
    queryKey: ["characters", params],
    queryFn: ({ signal }) => fetchCharacters(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useCharacter(id: string | number | undefined) {
  return useQuery<Character>({
    queryKey: ["character", id],
    enabled: !!id,
    queryFn: ({ signal }) => fetchCharacter(String(id), signal),
  });
}
