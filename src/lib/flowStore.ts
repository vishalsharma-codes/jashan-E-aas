import { useSyncExternalStore } from "react";

type Selection = { variant?: string; events: string[]; services: string[] };
type State = Record<string, Selection>;
const STORAGE_KEY = "jashn-category-flow-v1";
const empty = (): Selection => ({ events: [], services: [] });
let state: State = {};
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) state = JSON.parse(saved) as State;
} catch { /* Start with an empty selection when storage is unavailable or invalid. */ }
const listeners = new Set<() => void>();
const emit = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Storage is optional. */ } listeners.forEach((listener) => listener()); };
const subscribe = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); };
const get = (key: string) => state[key] ?? empty();
const update = (key: string, fn: (current: Selection) => Selection) => { state = { ...state, [key]: fn(get(key)) }; emit(); };

export function useFlow() {
  useSyncExternalStore(subscribe, () => state, () => state);
  return {
    get,
    setVariant: (key: string, variant?: string) => update(key, (s) => ({ ...s, variant })),
    setMany: (key: string, field: "events" | "services", values: string[]) => update(key, (s) => ({ ...s, [field]: values })),
    toggle: (key: string, field: "events" | "services", value: string) => update(key, (s) => ({ ...s, [field]: s[field].includes(value) ? s[field].filter((x) => x !== value) : [...s[field], value] })),
  };
}
