import { separators } from "./data/separators.js";
import { themes } from "./data/themes.js";
import { segments } from "./data/segments.js";
import { keybindingPresets } from "./data/keybindings.js";

const defaultSegmentLabels = Object.fromEntries(segments.map((segment) => [segment.id, segment.icon]));

const defaultState = {
  appChrome: "dark",
  theme: themes[0].id,
  separator: separators[0].id,
  statusPosition: "bottom",
  leftSegments: ["session", "hostname", "window"],
  rightSegments: ["prefix", "cpu", "memory", "datetime"],
  windowFormat: "both",
  prefixKey: "C-b",
  keyBindingPreset: keybindingPresets[0].id,
  paneBorderStyle: "rounded",
  mouseEnabled: true,
  baseIndexOne: true,
  renumberWindows: true,
  trueColor: true,
  escapeTimeZero: true,
  focusEvents: true,
  clipboard: true,
  segmentLabels: defaultSegmentLabels
};

const listeners = new Set();
let isBatching = false;

function cloneValue(value) {
  if (Array.isArray(value)) {
    return [...value];
  }

  if (value && typeof value === "object") {
    return structuredClone(value);
  }

  return value;
}

function notify() {
  if (isBatching) {
    return;
  }

  listeners.forEach((listener) => listener(state));
}

function isValidStateKey(key) {
  return Object.prototype.hasOwnProperty.call(defaultState, key);
}

const state = new Proxy(
  Object.fromEntries(Object.entries(defaultState).map(([key, value]) => [key, cloneValue(value)])),
  {
    set(target, property, value) {
      if (!isValidStateKey(property)) {
        return true;
      }

      target[property] = cloneValue(value);
      notify();
      return true;
    }
  }
);

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function batchUpdate(updater) {
  isBatching = true;
  updater(state);
  isBatching = false;
  notify();
}

export function setStateValue(key, value) {
  state[key] = value;
}

export function replaceState(nextState) {
  batchUpdate((draft) => {
    Object.entries(defaultState).forEach(([key, fallback]) => {
      if (Object.prototype.hasOwnProperty.call(nextState, key)) {
        draft[key] = nextState[key];
      } else {
        draft[key] = fallback;
      }
    });
  });
}

export function getStateSnapshot() {
  return structuredClone(Object.fromEntries(Object.keys(defaultState).map((key) => [key, cloneValue(state[key])])));
}

export function getDefaultState() {
  return structuredClone(defaultState);
}

export { state };
