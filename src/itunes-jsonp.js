// Apple's Search API officially supports JSONP for browser-side requests.
// A fixed catalog query is used; no participant text is put in the URL.
export const ITUNES_ENDPOINT = "https://itunes.apple.com/search";
export function normalizeITunesSongs(json) {
  if (!Array.isArray(json?.results))
    throw new Error("Invalid iTunes response.");
  const items = json.results
    .filter(
      (track) => typeof track.trackName === "string" && track.trackName.trim(),
    )
    .map((track) => {
      const title = track.trackName.trim().slice(0, 160);
      const artist =
        typeof track.artistName === "string"
          ? track.artistName.trim().slice(0, 100)
          : "";
      return {
        value: `itunes:${track.trackId || `${title}:${artist}`}`,
        label: artist ? `${title} — ${artist}` : title,
        title,
        artist,
        source: "iTunes song suggestions",
      };
    });
  const unique = [
    ...new Map(items.map((item) => [item.value, item])).values(),
  ].slice(0, 10);
  if (!unique.length) throw new Error("iTunes returned no usable songs.");
  return unique;
}

export function requestITunesJSONP({ signal, timeout = 7000 } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(12)), (n) =>
      n.toString(16).padStart(2, "0"),
    ).join("");
    const name = `twoPerspectivesSongs_${nonce}`;
    const script = document.createElement("script");
    const url = new URL(ITUNES_ENDPOINT);
    url.search = new URLSearchParams({
      term: "feel good",
      entity: "song",
      media: "music",
      country: "us",
      limit: "10",
      callback: name,
    }).toString();
    let settled = false;
    function cleanup() {
      clearTimeout(timer);
      script.remove();
      signal?.removeEventListener("abort", aborted);
      // Keep a harmless late callback briefly if a request finishes just after
      // timeout/cancellation, then remove it. No user data is stored here.
      window[name] = () => {};
      setTimeout(() => {
        delete window[name];
      }, 15000);
    }
    function finish(error, data) {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) reject(error);
      else resolve(data);
    }
    const aborted = () => finish(new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(
      () => finish(new Error("iTunes timed out.")),
      timeout,
    );
    window[name] = (data) => finish(null, data);
    script.onerror = () => finish(new Error("iTunes could not be loaded."));
    script.referrerPolicy = "no-referrer";
    script.src = url.href;
    signal?.addEventListener("abort", aborted, { once: true });
    document.head.appendChild(script);
  });
}
