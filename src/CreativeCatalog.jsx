import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { colors, songs } from "./data.js";
import { fetchColors, fetchSongs } from "./creative-api.js";

const Context = createContext(null);
const fallbacks = {
  colors: colors.map((item) => ({ ...item, source: "Preset palette" })),
  songs: songs.map((item) => ({ ...item, source: "Preset songs" })),
};

export function CreativeCatalogProvider({ children }) {
  const [resources, setResources] = useState(() =>
    Object.fromEntries(
      Object.entries(fallbacks).map(([kind, items]) => [
        kind,
        { items, status: "idle" },
      ]),
    ),
  );
  const requests = useRef({});
  const attempted = useRef(new Set());
  useEffect(
    () => () => {
      Object.values(requests.current).forEach((controller) =>
        controller.abort(),
      );
      requests.current = {};
      attempted.current.clear();
    },
    [],
  );

  const load = useCallback(async (kind, retry = false) => {
    if (requests.current[kind] || (attempted.current.has(kind) && !retry))
      return;
    attempted.current.add(kind);
    const controller = new AbortController();
    requests.current[kind] = controller;
    setResources((old) => ({
      ...old,
      [kind]: { ...old[kind], status: "loading" },
    }));
    try {
      const endpoint =
        kind === "colors"
          ? import.meta.env.VITE_COLORMIND_CATALOG_URL
          : import.meta.env.VITE_SONG_CATALOG_URL;
      const items = await (kind === "colors" ? fetchColors : fetchSongs)({
        signal: controller.signal,
        ...(endpoint ? { endpoint } : {}),
      });
      if (!controller.signal.aborted)
        setResources((old) => ({ ...old, [kind]: { items, status: "live" } }));
    } catch {
      if (!controller.signal.aborted)
        setResources((old) => ({
          ...old,
          [kind]: { items: fallbacks[kind], status: "fallback" },
        }));
    } finally {
      if (requests.current[kind] === controller) delete requests.current[kind];
    }
  }, []);

  return (
    <Context.Provider value={{ resources, load }}>{children}</Context.Provider>
  );
}

export function useCreativeCatalog() {
  const value = useContext(Context);
  if (!value) throw new Error("CreativeChoice needs CreativeCatalogProvider.");
  return value;
}
