import test from "node:test";
import assert from "node:assert/strict";
import { normalizeITunesSongs } from "../src/itunes-jsonp.js";
import {
  catalogEndpoint,
  fetchColors,
  fetchSongs,
  normalizePalette,
  normalizeSongs,
  requestJSON,
  COLOR_ENDPOINT,
  SONG_ENDPOINT,
} from "../src/creative-api.js";

test("ColorMind validates RGB values and deduplicates palette entries", () => {
  assert.deepEqual(
    normalizePalette({
      result: [
        [0, 128, 255],
        [0, 128, 255],
        [255, 255, 255],
      ],
    }).map((item) => item.value),
    ["#0080FF", "#FFFFFF"],
  );
  for (const result of [
    [],
    [
      [-1, 0, 0],
      [0, 0, 0],
      [1, 2, 3],
    ],
    [
      ["0", 0, 0],
      [0, 0, 0],
      [1, 2, 3],
    ],
    [
      [0, 256, 0],
      [0, 0, 0],
      [1, 2, 3],
    ],
    [
      [0.5, 0, 0],
      [0, 0, 0],
      [1, 2, 3],
    ],
  ]) {
    assert.throws(() => normalizePalette({ result }));
  }
});

test("song normalization accepts Apple's public chart, preserves artists, and removes duplicate IDs", () => {
  const items = normalizeSongs({
    feed: {
      results: [
        { id: 1, name: " Same title ", artistName: "Artist A" },
        { id: 2, name: "Same title", artistName: "Artist B" },
        { id: 1, name: "Same title", artistName: "Artist A" },
        { id: 3, name: "  " },
        { id: 4, name: 12 },
      ],
    },
  });
  assert.equal(items.length, 2);
  assert.equal(items[0].value, "apple:1");
  assert.equal(items[1].label, "Same title — Artist B");
  assert.equal(
    normalizeSongs({ feed: { results: [{ name: "Only title" }] } })[0].label,
    "Only title",
  );
  assert.throws(() => normalizeSongs({ feed: { results: [] } }));
  assert.throws(() => normalizeSongs({ error: "Unavailable" }));
});

test("catalog requests use fixed public queries, omit credentials, and never include participant responses", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () =>
        url === COLOR_ENDPOINT
          ? {
              result: [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
              ],
            }
          : {
              feed: {
                results: [{ id: 1, name: "Track", artistName: "Artist" }],
              },
            },
    };
  };
  await fetchColors({ fetchImpl });
  await fetchSongs({ fetchImpl });
  assert.deepEqual(
    calls.map((call) => call.url),
    [COLOR_ENDPOINT, SONG_ENDPOINT],
  );
  assert.equal(calls[0].options.body, '{"model":"default"}');
  assert.equal(calls[0].options.method, "POST");
  assert.equal(calls[1].options.body, undefined);
  for (const { options } of calls) {
    assert.equal(options.credentials, "omit");
    assert.equal(options.referrerPolicy, "no-referrer");
    assert.equal(options.headers.Authorization, undefined);
  }
});

test("HTTP, parsing, and timeout errors reject so the UI can use fallback data", async () => {
  await assert.rejects(
    requestJSON(COLOR_ENDPOINT, {
      fetchImpl: async () => ({ ok: false, status: 401 }),
    }),
    /401/,
  );
  await assert.rejects(
    requestJSON(COLOR_ENDPOINT, {
      fetchImpl: async () => ({
        ok: true,
        json: async () => {
          throw new SyntaxError("Invalid JSON");
        },
      }),
    }),
    SyntaxError,
  );
  await assert.rejects(
    requestJSON(COLOR_ENDPOINT, {
      timeout: 10,
      fetchImpl: async (_, { signal }) =>
        new Promise((_, reject) =>
          signal.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          ),
        ),
    }),
    { name: "AbortError" },
  );
});

test("catalog override URLs support approved HTTPS proxies and reject credentials or insecure destinations", () => {
  assert.equal(
    catalogEndpoint("/api/catalog/songs", SONG_ENDPOINT),
    "/api/catalog/songs",
  );
  assert.equal(
    catalogEndpoint("https://catalog.example/songs", SONG_ENDPOINT),
    "https://catalog.example/songs",
  );
  for (const value of [
    "http://catalog.example/songs",
    "https://user:secret@catalog.example/",
    "//catalog.example/songs",
    "file:///tmp/songs",
    "/\\catalog.example/songs",
  ]) {
    assert.throws(() => catalogEndpoint(value, SONG_ENDPOINT));
  }
});

test("failed browser chart requests fall back to iTunes without participant data", async () => {
  let called = 0;
  const items = await fetchSongs({
    fetchImpl: async () => {
      throw new TypeError("Failed to fetch");
    },
    jsonpImpl: async (options) => {
      called++;
      assert.deepEqual(Object.keys(options), ["signal"]);
      return {
        results: [{ trackId: 1, trackName: "Song", artistName: "Artist" }],
      };
    },
  });
  assert.equal(called, 1);
  assert.equal(items[0].label, "Song — Artist");
  assert.equal(items[0].source, "iTunes song suggestions");
  assert.throws(() => normalizeITunesSongs({ results: [] }));
  assert.throws(() => normalizeITunesSongs({ results: [{ trackName: 14 }] }));
});

test("cancelled requests do not start a second song lookup", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    fetchSongs({
      signal: controller.signal,
      fetchImpl: async () => {
        throw new DOMException("Aborted", "AbortError");
      },
      jsonpImpl: async () => {
        assert.fail("cancelled catalog must not retry");
      },
    }),
    { name: "AbortError" },
  );
});
