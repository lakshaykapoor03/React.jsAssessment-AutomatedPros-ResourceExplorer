
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
export type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  episode: string[];
  url: string;
  created: string;
};

export type CharactersResponse = {
  info: { count: number; pages: number; next: string | null; prev: string | null };
  results: Character[];
};

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

  return request<CharactersResponse>(`character?${search.toString()}`, {
    signal,
  });
}

export async function fetchCharacter(
  id: string,
  signal?: AbortSignal
): Promise<Character> {
  return request<Character>(`character/${id}`, { signal });
}
