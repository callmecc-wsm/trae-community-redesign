import { useEffect, useState, useSyncExternalStore } from "react";
import { createRepository } from "./repository.js";
import { parseRoute, routeUrl } from "./model.js";
let adapter;
try {
  adapter = window.localStorage;
} catch {
  adapter = {
    getItem: () => null,
    setItem: () => {
      throw Error("Unavailable");
    },
  };
}
export const repository = createRepository(adapter, window);
export function useCommunity() {
  const state = useSyncExternalStore(
    repository.subscribe,
    repository.getSnapshot,
  );
  return {
    state,
    dispatch: repository.dispatch,
    storageStatus: repository.getStatus(),
  };
}
export function useRoute() {
  const [route, set] = useState(() => parseRoute(location.hash));
  useEffect(() => {
    const fn = () => {
      set(parseRoute(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return route;
}
export function navigate(page, id, params = {}) {
  const hash = routeUrl(page, id, params);
  if (location.hash === hash) window.scrollTo(0, 0);
  else location.hash = hash;
}
export function patchRoute(route, patch) {
  navigate(route.page, route.id, { ...route.params, ...patch });
}
export function uid() {
  return (
    "local-" +
    (globalThis.crypto?.randomUUID?.() ||
      Date.now() + "-" + Math.random().toString(36).slice(2))
  );
}
