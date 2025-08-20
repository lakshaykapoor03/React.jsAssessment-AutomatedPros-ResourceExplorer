import { z } from "zod";

const BASE_URL = "https://rickandmortyapi.com/api";

async function request<T>(
  path: string,
  opts: { signal?: AbortSignal } = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: opts.signal,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Rick & Morty types
export const CharacterSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  species: z.string(),
  type: z.string(),
  gender: z.string(),
  origin: z.object({ name: z.string(), url: z.string() }),
  location: z.object({ name: z.string(), url: z.string() }),
  image: z.string(),
  episode: z.array(z.string()),
  url: z.string(),
  created: z.string(),
});

export type Character = z.infer<typeof CharacterSchema>;

const InfoSchema = z.object({
  count: z.number(),
  pages: z.number(),
  next: z.string().nullable(),
  prev: z.string().nullable(),
});

export const CharactersResponseSchema = z.object({
  info: InfoSchema,
  results: z.array(CharacterSchema),
});

export type CharactersResponse = z.infer<typeof CharactersResponseSchema>;

export async function fetchCharacters(
  params: {
    page?: number;
    name?: string;
    status?: string;
    species?: string;
  },
  signal?: AbortSignal
): Promise<CharactersResponse> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.name) search.set("name", params.name);
  if (params.status) search.set("status", params.status);
  if (params.species) search.set("species", params.species);

  const json = await request<unknown>(`character?${search.toString()}`, {
    signal,
  });
  return CharactersResponseSchema.parse(json);
}

export async function fetchCharacter(
  id: string,
  signal?: AbortSignal
): Promise<Character> {
  const json = await request<unknown>(`character/${id}`, { signal });
  return CharacterSchema.parse(json);
}
