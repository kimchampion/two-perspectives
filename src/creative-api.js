import { normalizeITunesSongs, requestITunesJSONP } from "./itunes-jsonp.js";
// Catalog requests contain fixed public queries only, never participant data.
export const COLOR_ENDPOINT = "https://colormind.io/api/";
// Apple’s public top-songs feed needs no API key or developer token.
// This is separate from the authenticated Apple Music developer API.
export const SONG_ENDPOINT =
  "https://rss.marketingtools.apple.com/api/v2/us/music/most-played/10/songs.json";
export const REQUEST_TIMEOUT = 7000;

export function catalogEndpoint(value, fallback) {
  if (!value) return fallback;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"))
    return value;
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error(
      "Catalog URLs must use HTTPS and cannot contain credentials.",
    );
  }
  return url.href;
}

export async function requestJSON(url, options = {}) {
  const {
    signal,
    timeout = REQUEST_TIMEOUT,
    fetchImpl = fetch,
    ...request
  } = options;
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, timeout);
  try {
    const response = await fetchImpl(url, {
      ...request,
      signal: controller.signal,
      credentials: "omit",
      referrerPolicy: "no-referrer",
      headers: { Accept: "application/json", ...request.headers },
    });
    if (!response.ok)
      throw new Error(`Catalog request failed (${response.status}).`);
    return await response.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

export function normalizePalette(json) {
  if (
    !Array.isArray(json?.result) ||
    json.result.length < 3 ||
    json.result.length > 12
  ) {
    throw new Error("ColorMind returned an invalid palette.");
  }
  const result = json.result.map((rgb) => {
    if (
      !Array.isArray(rgb) ||
      rgb.length !== 3 ||
      !rgb.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)
    ) {
      throw new Error("ColorMind returned an invalid RGB color.");
    }
    const value =
      "#" +
      rgb
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
    return { value, label: `Color ${value}`, source: "ColorMind" };
  });
  return [...new Map(result.map((item) => [item.value, item])).values()];
}

export function normalizeSongs(json) {
  const tracks = Array.isArray(json?.feed?.results) ? json.feed.results : null;
  if (!tracks) throw new Error("Apple returned an invalid song feed.");
  const items = tracks
    .filter((track) => typeof track?.name === "string" && track.name.trim())
    .map((track) => {
      const title = track.name.trim().slice(0, 160);
      const artist =
        typeof track.artistName === "string"
          ? track.artistName.trim().slice(0, 100)
          : "";
      const id =
        typeof track.id === "string" || typeof track.id === "number"
          ? String(track.id)
          : `${title}:${artist}`;
      return {
        value: `apple:${id}`,
        label: artist ? `${title} — ${artist}` : title,
        title,
        artist,
        source: "Apple Music public chart",
      };
    });
  const unique = [
    ...new Map(items.map((item) => [item.value, item])).values(),
  ].slice(0, 10);
  if (!unique.length) throw new Error("Apple returned no usable songs.");
  return unique;
}

export async function fetchColors({
  endpoint = COLOR_ENDPOINT,
  ...options
} = {}) {
  const json = await requestJSON(catalogEndpoint(endpoint, COLOR_ENDPOINT), {
    ...options,
    method: "POST",
    // ColorMind accepts a JSON body. A safelisted content type avoids an
    // unnecessary browser preflight; no participant choice is included.
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify({ model: "default" }),
  });
  return normalizePalette(json);
}

export async function fetchSongs({
  endpoint = SONG_ENDPOINT,
  jsonpImpl = requestITunesJSONP,
  ...options
} = {}) {
  try {
    return normalizeSongs(
      await requestJSON(catalogEndpoint(endpoint, SONG_ENDPOINT), {
        timeout: 3000,
        ...options,
      }),
    );
  } catch (error) {
    if (options.signal?.aborted) throw error;
    return normalizeITunesSongs(await jsonpImpl({ signal: options.signal }));
  }
}
